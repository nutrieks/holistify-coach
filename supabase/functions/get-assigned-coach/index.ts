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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching coach for user:', user.id);

    // Get client record with coach_id
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('coach_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (clientError) {
      console.error('Client fetch error:', clientError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch client data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!client || !client.coach_id) {
      console.log('No coach assigned to client');
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
