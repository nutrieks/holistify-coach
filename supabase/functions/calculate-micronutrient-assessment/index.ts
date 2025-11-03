import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { NUTRIENT_CONFIG } from "./nutrient-config.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submission_id } = await req.json();
    
    console.log('Starting micronutrient assessment calculation for submission:', submission_id);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch submission & answers with question details
    const { data: submission, error: submissionError } = await supabase
      .from('client_micronutrient_submissions')
      .select('*')
      .eq('id', submission_id)
      .single();

    if (submissionError || !submission) {
      console.error('Submission not found:', submissionError);
      throw new Error('Submission not found');
    }

    const { data: answers, error: answersError } = await supabase
      .from('client_micronutrient_answers')
      .select(`
        *,
        question:micronutrient_questions(*)
      `)
      .eq('submission_id', submission_id);

    if (answersError || !answers) {
      console.error('Answers not found:', answersError);
      throw new Error('No answers found');
    }

    console.log(`Processing ${answers.length} answers for ${Object.keys(NUTRIENT_CONFIG).length} nutrients`);

    // 2. Calculate scores for all 27 nutrients
    const results = [];
    
    for (const [nutrientCode, config] of Object.entries(NUTRIENT_CONFIG)) {
      const score = calculateNutrientScore(nutrientCode, config, answers);
      results.push({
        submission_id,
        client_id: submission.client_id,
        nutrient_name: config.name,
        nutrient_code: nutrientCode,
        ...score
      });
      
      console.log(`Calculated ${nutrientCode}: FPS=${score.final_weighted_score.toFixed(2)}%, Category=${score.risk_category}`);
    }

    // 3. Store all results
    const { error: insertError } = await supabase
      .from('client_micronutrient_results')
      .insert(results);

    if (insertError) {
      console.error('Error inserting results:', insertError);
      throw insertError;
    }

    console.log(`Successfully stored ${results.length} nutrient assessments`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results_count: results.length,
        message: `Uspješno izračunato ${results.length} nutrijenata`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Calculation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function calculateNutrientScore(nutrientCode: string, config: any, answers: any[]) {
  // KORAK 1: SKOR UNOSA (SUN%)
  let intakePoints = 0;
  let maxIntakePoints = 0;
  
  for (const qCode of config.relevantQuestions?.intake || []) {
    const answer = answers.find(a => a.question?.question_code === qCode);
    if (answer) {
      const weightFactor = config.weightingFactors?.[qCode] || 1.0;
      const points = mapAnswerToPoints(answer.answer_value, answer.question);
      intakePoints += points * weightFactor;
      maxIntakePoints += 10 * weightFactor;
    }
  }
  
  const SUN = maxIntakePoints > 0 ? (intakePoints / maxIntakePoints) * 100 : 0;
  
  // KORAK 2: SKOR SIMPTOMA (SSN%)
  let symptomPoints = 0;
  let maxSymptomPoints = 0;
  
  for (const qCode of config.relevantQuestions?.symptoms || []) {
    const answer = answers.find(a => a.question?.question_code === qCode);
    const scoreValue = config.symptomScores?.[qCode] || 0;
    maxSymptomPoints += scoreValue;
    
    // Symptom is absent (good) if answer is "Ne"
    if (answer && answer.answer_value?.selected === 'Ne') {
      symptomPoints += scoreValue;
    }
  }
  
  let SSN = maxSymptomPoints > 0 ? (symptomPoints / maxSymptomPoints) * 100 : 100;
  
  // Apply Cluster Rules if defined
  if (config.clusterRules) {
    for (const rule of config.clusterRules) {
      const allMet = rule.condition.every((qCode: string) => {
        const ans = answers.find(a => a.question?.question_code === qCode);
        return ans && ans.answer_value?.selected === 'Da';
      });
      if (allMet && rule.action.type === 'subtract') {
        SSN -= rule.action.value;
      }
    }
  }
  
  SSN = Math.max(0, Math.min(100, SSN));
  
  // KORAK 3: KONAČNI SKOR RIZIKA (KSR%)
  let KSR = (0.6 * SUN) + (0.4 * SSN);
  
  // Apply Risk Modifiers
  const contributingFactors: string[] = [];
  let riskMultiplier = 1.0;
  
  for (const [qCode, modifier] of Object.entries(config.riskModifiers || {})) {
    const answer = answers.find(a => a.question?.question_code === qCode);
    if (answer && isRiskFactorPresent(answer, qCode)) {
      riskMultiplier *= modifier as number;
      contributingFactors.push(getRiskFactorName(qCode));
    }
  }
  
  KSR *= riskMultiplier;
  
  // KORAK 4: FINALNI PONDERIRANI SKOR (FPS%)
  const FPS = Math.min(100, KSR * (config.prevalenceFactor || 1.0));
  
  // KORAK 5: KATEGORIJA RIZIKA
  const risk_category = 
    FPS > 85 ? 'none' :
    FPS > 60 ? 'low' :
    FPS > 35 ? 'moderate' : 'high';
  
  return {
    intake_score_percentage: Math.round(SUN * 100) / 100,
    symptom_score_percentage: Math.round(SSN * 100) / 100,
    risk_score_percentage: Math.round(KSR * 100) / 100,
    final_weighted_score: Math.round(FPS * 100) / 100,
    risk_category,
    contributing_factors,
    calculated_at: new Date().toISOString()
  };
}

function mapAnswerToPoints(answerValue: any, question: any): number {
  const selected = answerValue?.selected || answerValue;
  
  if (question.question_type === 'frequency') {
    const mapping: Record<string, number> = {
      'Nikad ili vrlo rijetko': 0,
      '1-2 puta mjesečno': 3,
      '1-3 puta tjedno': 6,
      '4-6 puta tjedno': 8,
      'Dnevno ili više': 10
    };
    return mapping[selected] || 0;
  }
  
  if (question.question_type === 'portion') {
    const mapping: Record<string, number> = {
      'Manja od šake': 4,
      'Manja od veličine dlana': 4,
      'Manja od dlana': 4,
      'Veličina šake': 7,
      'Veličina dlana': 7,
      'Veća od šake': 10,
      'Veća od dlana': 10,
      '1 jaje': 5,
      '2 jaja': 8,
      '3 ili više jaja': 10,
      '1 banana': 5,
      '2 banane': 8,
      '3 ili više banana': 10,
      '1 žlica': 4,
      '2 žlice': 7,
      '3 ili više žlica': 10
    };
    return mapping[selected] || 0;
  }

  if (question.question_type === 'select_one') {
    // Sun exposure mapping
    if (question.question_code?.startsWith('A.16')) {
      const sunMapping: Record<string, number> = {
        'Gotovo nikad': 0,
        'Manje od 15 min': 3,
        '15-30 min': 6,
        '30-60 min': 8,
        'Više od 1 sat': 10
      };
      return sunMapping[selected] || 0;
    }

    // Vitamin D supplement dosage
    if (question.question_code === 'A.15.3') {
      const vitDMapping: Record<string, number> = {
        'Ne uzimam Vitamin D': 0,
        'Manje od 1000 IU': 3,
        '1000-2000 IU': 5,
        '2000-4000 IU': 8,
        'Više od 4000 IU': 10,
        'Ne znam': 2
      };
      return vitDMapping[selected] || 0;
    }

    // Jodirana sol
    if (question.question_code === 'A.14.1') {
      const saltMapping: Record<string, number> = {
        'Jodirana sol': 10,
        'Morska sol (nejodirana)': 3,
        'Himalajska/keltska sol': 2,
        'Obična (rafinirana) kuhinjska sol': 5,
        'Ne solim hranu': 0,
        'Ne znam': 2
      };
      return saltMapping[selected] || 0;
    }
  }
  
  return 0;
}

function isRiskFactorPresent(answer: any, qCode: string): boolean {
  const selected = answer.answer_value?.selected || answer.answer_value;
  
  if (answer.question?.question_type === 'yes_no') {
    return selected === 'Da';
  }
  
  if (qCode === 'C.3.3') {
    return selected === 'Visoka' || selected === 'Vrlo visoka';
  }
  
  return false;
}

function getRiskFactorName(qCode: string): string {
  const mapping: Record<string, string> = {
    'C.1.1': 'Bolest štitnjače',
    'C.1.2': 'Bolest probavnog sustava',
    'C.1.3': 'Autoimuna bolest',
    'C.1.4': 'Inzulinska rezistencija',
    'C.2.1': 'Lijekovi za želučanu kiselinu',
    'C.2.2': 'Metformin',
    'C.2.3': 'Oralna kontracepcija',
    'C.2.4': 'Diuretici',
    'C.2.5': 'Statini',
    'C.3.1': 'Kava/čaj uz obroke',
    'C.3.2': 'Vegetarijanska/veganska prehrana',
    'C.3.3': 'Visok stres',
    'C.3.4': 'Nedovoljan san'
  };
  return mapping[qCode] || 'Faktor rizika';
}