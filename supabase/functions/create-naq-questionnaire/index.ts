import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { NAQ_QUESTIONS, NAQ_QUESTIONNAIRE_METADATA } from "./naq-data.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { coachId } = await req.json()

    // Create the NAQ questionnaire
    const { data: questionnaire, error: questionnaireError } = await supabaseClient
      .from('questionnaires')
      .insert({
        title: NAQ_QUESTIONNAIRE_METADATA.title,
        description: NAQ_QUESTIONNAIRE_METADATA.description,
        coach_id: coachId,
        is_default_questionnaire: true
      })
      .select()
      .single()

    if (questionnaireError) throw questionnaireError

    // Create all questions
    const questions = NAQ_QUESTIONS.map((q, index) => ({
      questionnaire_id: questionnaire.id,
      question_text: q.text,
      question_type: q.questionType === 'scale_0_3' ? 'scale_1_10' : q.questionType,
      question_order: index + 1,
      section_name: q.sectionName,
      scoring_category: q.scoringCategory,
      scoring_weight: q.scoringWeight,
      options: q.options ? { choices: q.options } : null
    }))

    const { error: questionsError } = await supabaseClient
      .from('questionnaire_questions')
      .insert(questions)

    if (questionsError) throw questionsError

    return new Response(
      JSON.stringify({ 
        success: true, 
        questionnaireId: questionnaire.id,
        questionsCount: questions.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error creating NAQ questionnaire:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})