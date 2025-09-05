import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { NAQ_QUESTIONS } from "./naq-data.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { questionnaireId } = await req.json();

    if (!questionnaireId) {
      return new Response(
        JSON.stringify({ error: 'questionnaireId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Seeding NAQ questions for questionnaire: ${questionnaireId}`);

    // Clear existing questions first for complete reseed
    const { error: deleteError } = await supabase
      .from('questionnaire_questions')
      .delete()
      .eq('questionnaire_id', questionnaireId);

    if (deleteError) {
      console.error('Error clearing existing questions:', deleteError);
      throw deleteError;
    }

    // Map NAQ questions to database format
    const questions = NAQ_QUESTIONS.map((q, index) => {
      // Map question types to database format
      let dbQuestionType = 'multiple_choice';
      let options = null;

      switch (q.questionType) {
        case 'scale_0_3':
          dbQuestionType = 'scale_1_10';
          break;
        case 'yes_no':
          dbQuestionType = 'multiple_choice';
          options = ['Da', 'Ne'];
          break;
        case 'multiple_choice':
          dbQuestionType = 'multiple_choice';
          options = q.options || ['Nikad', 'Rijetko', 'Ponekad', 'Često'];
          break;
      }

      return {
        questionnaire_id: questionnaireId,
        question_text: q.text,
        question_type: dbQuestionType,
        question_order: index + 1,
        section_name: q.sectionName,
        scoring_category: q.scoringCategory,
        scoring_weight: q.scoringWeight,
        options: options
      };
    });

    // Insert questions in batches of 100 to handle large dataset efficiently
    const batchSize = 100;
    let totalInserted = 0;

    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('questionnaire_questions')
        .insert(batch);

      if (insertError) {
        console.error('Error inserting questions batch:', insertError);
        throw insertError;
      }
      
      totalInserted += batch.length;
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}, total questions: ${totalInserted}`);
    }

    return new Response(
      JSON.stringify({ 
        message: `Uspješno dodano ${totalInserted} NAQ pitanja`,
        totalQuestions: totalInserted
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in seed-naq-questions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});