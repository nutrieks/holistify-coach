import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { MICRONUTRIENT_QUESTIONS } from "./questions-data.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting micronutrient questionnaire seed...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Create questionnaire
    const { data: questionnaire, error: qError } = await supabase
      .from('micronutrient_questionnaires')
      .insert({
        title: 'Mikronutritivna Dijagnostika v2',
        description: 'Procjena rizika deficita 27 mikronutrijenata na temelju prehrane, simptoma i faktora rizika',
        is_active: true
      })
      .select()
      .single();

    if (qError) {
      console.error('Error creating questionnaire:', qError);
      throw qError;
    }

    console.log('Questionnaire created:', questionnaire.id);

    // 2. Build all questions with questionnaire_id
    const questionsToInsert = MICRONUTRIENT_QUESTIONS.map(q => ({
      ...q,
      questionnaire_id: questionnaire.id
    }));

    console.log(`Preparing to insert ${questionsToInsert.length} questions...`);

    // 3. Insert questions in batches
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < questionsToInsert.length; i += batchSize) {
      const batch = questionsToInsert.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('micronutrient_questions')
        .insert(batch);
      
      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        throw insertError;
      }
      
      insertedCount += batch.length;
      console.log(`Inserted batch ${i / batchSize + 1}, total: ${insertedCount}/${questionsToInsert.length}`);
    }

    console.log('All questions inserted successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        questionnaire_id: questionnaire.id,
        total_questions: insertedCount,
        message: `Uspješno dodano ${insertedCount} pitanja`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Seed error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});