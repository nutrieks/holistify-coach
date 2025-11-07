import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Get authenticated user using admin client with token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching coach for user:', user.id, 'email:', user.email);

    // Try fetching client by user_id first
    let { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, coach_id, user_id, email')
      .eq('user_id', user.id)
      .maybeSingle();

    // If not found by user_id, try by email (fallback)
    if (!client && user.email) {
      console.log('Client not found by user_id, trying email fallback:', user.email);
      
      const { data: clientByEmail, error: emailError } = await supabaseAdmin
        .from('clients')
        .select('id, coach_id, user_id, email')
        .eq('email', user.email)
        .maybeSingle();

      if (emailError) {
        console.error('Email fallback fetch error:', emailError);
      } else if (clientByEmail) {
        console.log('Client found by email:', clientByEmail.id);
        
        // Backfill user_id if it's null or different
        if (!clientByEmail.user_id || clientByEmail.user_id !== user.id) {
          console.log('Backfilling user_id from', clientByEmail.user_id, 'to', user.id);
          
          const { error: updateError } = await supabaseAdmin
            .from('clients')
            .update({ user_id: user.id })
            .eq('id', clientByEmail.id);

          if (updateError) {
            console.error('Failed to backfill user_id:', updateError);
          } else {
            console.log('Successfully backfilled user_id');
          }
        }
        
        client = clientByEmail;
        clientError = null;
      }
    }

    if (clientError) {
      console.error('Client fetch error:', clientError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch client data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!client) {
      console.log('No client record found for user');
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (!client.coach_id) {
      console.log('No coach assigned to client:', client.id);
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    console.log('Fetching coach profile:', client.coach_id);

    // Use service role to fetch coach profile (bypass RLS)
    const { data: coachProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .eq('id', client.coach_id)
      .single();

    if (profileError) {
      console.error('Coach profile fetch error:', profileError);
      // Return coach_id anyway so chat can work
      return new Response(
        JSON.stringify({ 
          id: client.coach_id, 
          full_name: 'Savjetnik' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Coach found:', coachProfile);

    return new Response(
      JSON.stringify(coachProfile),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
