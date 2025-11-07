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

    // Verify admin role
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { client_id } = await req.json();

    if (!client_id) {
      return new Response(
        JSON.stringify({ error: 'client_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fixing micronutrient assignment for client:', client_id);

    // Find a questionnaire_id that has questions
    const { data: questionnaireWithQuestions, error: questError } = await supabaseClient
      .from('micronutrient_questions')
      .select('questionnaire_id')
      .limit(1)
      .maybeSingle();

    if (questError || !questionnaireWithQuestions) {
      console.error('No questionnaire with questions found:', questError);
      return new Response(
        JSON.stringify({ error: 'No valid questionnaire found with questions' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validQuestionnaireId = questionnaireWithQuestions.questionnaire_id;
    console.log('Valid questionnaire found:', validQuestionnaireId);

    // Update the latest assignment for this client
    const { data: updated, error: updateError } = await supabaseClient
      .from('assigned_micronutrient_questionnaires')
      .update({ 
        questionnaire_id: validQuestionnaireId,
        status: 'sent'
      })
      .eq('client_id', client_id)
      .order('assigned_at', { ascending: false })
      .limit(1)
      .select();

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update assignment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Assignment fixed:', updated);

    return new Response(
      JSON.stringify({ success: true, updated }),
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
