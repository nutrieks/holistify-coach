import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { NAQ_COMPLETE_QUESTIONS } from './naq-complete-data.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// NAQ section structure imported from naq-complete-data.ts
// All 322 questions are now loaded from the external data file

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Creating NAQ questionnaire for user:', user.id);

    // Create the questionnaire
    const { data: questionnaire, error: qError } = await supabaseClient
      .from('questionnaires')
      .insert({
        title: 'NAQ - Nutritional Assessment Questionnaire',
        description: 'Kompletan NAQ upitnik za funkcionalnu procjenu zdravlja - 321 pitanje prema knjizi "Signs and Symptoms Analysis from a Functional Perspective" by Dicken Weatherby, N.D.',
        questionnaire_type: 'naq',
        is_active: true
      })
      .select()
      .single();

    if (qError) {
      console.error('Error creating questionnaire:', qError);
      throw qError;
    }

    console.log('Questionnaire created:', questionnaire.id);

    // Prepare all questions with correct schema - using complete data from naq-complete-data.ts
    const questionsToInsert = NAQ_COMPLETE_QUESTIONS.map((q, index) => ({
      questionnaire_id: questionnaire.id,
      question_text: q.question_text,
      section: q.section,
      category: q.category,
      order_index: q.order_index || (index + 1),
      question_type: q.question_type,
      is_required: q.is_required !== undefined ? q.is_required : true,
      options: q.options ? JSON.stringify(q.options) : null
    }));

    // Insert questions in batches of 100
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < questionsToInsert.length; i += batchSize) {
      const batch = questionsToInsert.slice(i, i + batchSize);
      const { error: insertError } = await supabaseClient
        .from('questionnaire_questions')
        .insert(batch);

      if (insertError) {
        console.error('Error inserting questions batch:', insertError);
        throw insertError;
      }

      insertedCount += batch.length;
      console.log(`Inserted ${insertedCount}/${questionsToInsert.length} questions`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        questionnaireId: questionnaire.id,
        questionCount: insertedCount,
        message: `NAQ upitnik uspješno kreiran sa ${insertedCount} pitanja`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-complete-naq:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
