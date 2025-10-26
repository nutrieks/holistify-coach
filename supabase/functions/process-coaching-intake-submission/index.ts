import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapiranje pitanja (order_index) na client kolone
const QUESTION_MAPPING: Record<string, string> = {
  "1": "full_name",
  "2": "email",
  "3": "date_of_birth",
  "4": "phone",
  "5": "preferred_contact_method",
  "6": "best_contact_time",
  "7": "preferred_pronouns",
  "8": "occupation",
  "9": "weekly_work_hours",
  "10": "emergency_contact_name",
  "11": "emergency_contact_phone",
  "12": "gender",
  "13": "place_of_birth",
  "14": "blood_type",
  "15": "height",
  "16": "starting_weight",
  "17": "relationship_status",
  "18": "number_of_children",
  "67": "smoking_status",
  "68": "smoking_details",
  "69": "alcohol_consumption",
  "70": "alcohol_details",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submission_id } = await req.json();
    
    if (!submission_id) {
      throw new Error('submission_id is required');
    }

    console.log('Processing coaching intake submission:', submission_id);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Dohvatiti submission sa questionnaire title
    const { data: submission, error: submissionError } = await supabase
      .from('client_submissions')
      .select('*, questionnaires(title)')
      .eq('id', submission_id)
      .single();

    if (submissionError) {
      console.error('Error fetching submission:', submissionError);
      throw submissionError;
    }

    console.log('Submission found for questionnaire:', submission.questionnaires?.title);

    // Provjera je li ovo Coaching Intake upitnik
    if (submission.questionnaires?.title !== 'Inicijalni Coaching Upitnik') {
      console.log('Not a coaching intake questionnaire, skipping');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Not a coaching intake questionnaire' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parsirati odgovore i mapirati na client podatke
    const answers = submission.answers as Record<string, any>;
    const clientUpdates: Record<string, any> = {};

    console.log('Mapping answers to client fields...');

    for (const [questionOrderIndex, columnName] of Object.entries(QUESTION_MAPPING)) {
      const answer = answers[questionOrderIndex];
      
      if (answer !== undefined && answer !== null && answer !== '') {
        // Posebna obrada za height i weight (konverzija u number)
        if (columnName === 'height' || columnName === 'starting_weight') {
          const numValue = parseFloat(answer);
          if (!isNaN(numValue)) {
            clientUpdates[columnName] = numValue;
            console.log(`Mapped ${columnName}: ${numValue}`);
          }
        } 
        // Posebna obrada za number_of_children
        else if (columnName === 'number_of_children') {
          const intValue = parseInt(answer);
          if (!isNaN(intValue)) {
            clientUpdates[columnName] = intValue;
            console.log(`Mapped ${columnName}: ${intValue}`);
          }
        }
        // Posebna obrada za gender (mapiranje na bazu)
        else if (columnName === 'gender') {
          const genderMap: Record<string, string> = {
            'Muško': 'male',
            'Žensko': 'female',
            'Ostalo': 'other'
          };
          const mappedGender = genderMap[answer] || answer;
          clientUpdates[columnName] = mappedGender;
          console.log(`Mapped ${columnName}: ${mappedGender}`);
        }
        // Posebna obrada za date_of_birth (osigurati da je u validnom formatu)
        else if (columnName === 'date_of_birth') {
          // Pretpostavljam format DD.MM.YYYY ili slično
          // Možda treba parsirati i konvertirati u YYYY-MM-DD
          clientUpdates[columnName] = answer;
          console.log(`Mapped ${columnName}: ${answer}`);
        }
        else {
          clientUpdates[columnName] = answer;
          console.log(`Mapped ${columnName}: ${answer}`);
        }
      }
    }

    console.log(`Mapped ${Object.keys(clientUpdates).length} fields`);

    if (Object.keys(clientUpdates).length === 0) {
      console.log('No fields to update');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No client data to update',
          updatedFields: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prvo provjeriti postoji li client zapis
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', submission.client_id)
      .maybeSingle();

    if (!existingClient) {
      console.log('No client record found, creating one');
      // Ako ne postoji, kreirati novi zapis
      const { error: insertError } = await supabase
        .from('clients')
        .insert({
          user_id: submission.client_id,
          ...clientUpdates
        });

      if (insertError) {
        console.error('Error creating client record:', insertError);
        throw insertError;
      }
    } else {
      console.log('Updating existing client record');
      // Ažurirati client podatke
      const { error: updateError } = await supabase
        .from('clients')
        .update(clientUpdates)
        .eq('user_id', submission.client_id);

      if (updateError) {
        console.error('Error updating client record:', updateError);
        throw updateError;
      }
    }

    console.log('Client data updated successfully');

    // ===== GENERIRANJE PSIHOLOŠKOG PROFILA =====
    console.log('Generating psychological profile...');
    
    // Ekstrakcija odgovora iz novih pitanja (142-156)
    const foodRelationshipRaw = answers['142']; // Skala 1-10
    const currentStress = answers['143']; // Nizak/Umjeren/Visok
    const sleepQuality = answers['144']; // 1-10
    const workLifeBalance = answers['145']; // 1-10
    const supportSystem = answers['146']; // Da/Ne
    const majorLifeChanges = answers['147']; // Opciono text
    
    const mentalPriorities = answers['148']; // Array checkboxes
    const motivationLevel = answers['149']; // Nizak/Umjeren/Visok
    const readinessForChange = answers['150']; // 1-10
    const mainGoal = answers['151']; // text
    const timeCommitment = answers['152']; // text (sati tjedno)
    
    const previousDiets = answers['153']; // Da/Ne
    const dietAttempts = answers['154']; // broj puta
    const longestDietDuration = answers['155']; // text
    const dietChallenges = answers['156']; // text
    
    // Računanje Food Relationship Score (1-10)
    let foodRelationshipScore = parseFloat(foodRelationshipRaw) || 5;
    
    // Prilagodba score-a na temelju ostalih faktora
    if (sleepQuality && parseFloat(sleepQuality) < 5) {
      foodRelationshipScore = Math.max(1, foodRelationshipScore - 1);
    }
    if (workLifeBalance && parseFloat(workLifeBalance) < 5) {
      foodRelationshipScore = Math.max(1, foodRelationshipScore - 1);
    }
    
    // Određivanje stress level-a
    const stressLevelMap: Record<string, string> = {
      'Nizak': 'low',
      'Umjeren': 'moderate',
      'Visok': 'high'
    };
    const stressLevel = stressLevelMap[currentStress] || 'moderate';
    
    // Računanje Diet History Complexity
    let dietHistoryComplexity = 0;
    if (previousDiets === 'Da' && dietAttempts) {
      dietHistoryComplexity = parseInt(dietAttempts) || 0;
    }
    
    // Parsiranje Mental Priorities
    let mentalPrioritiesArray: string[] = [];
    if (Array.isArray(mentalPriorities)) {
      mentalPrioritiesArray = mentalPriorities;
    } else if (typeof mentalPriorities === 'string') {
      mentalPrioritiesArray = [mentalPriorities];
    }
    
    // Parsiranje Time Availability
    let timeAvailabilityMinutes: number | null = null;
    if (timeCommitment) {
      const hoursMatch = timeCommitment.match(/(\d+)/);
      if (hoursMatch) {
        timeAvailabilityMinutes = parseInt(hoursMatch[1]) * 60;
      }
    }
    
    // Određivanje Recommended Deficit Speed
    let recommendedDeficitSpeed = 'moderate';
    
    // Faktori koji utječu na brzinu deficita
    const readinessScore = parseFloat(readinessForChange) || 5;
    const motivationMap: Record<string, number> = {
      'Nizak': 1,
      'Umjeren': 2,
      'Visok': 3
    };
    const motivationScore = motivationMap[motivationLevel] || 2;
    
    // Logika odlučivanja
    if (stressLevel === 'high' || dietHistoryComplexity > 5 || foodRelationshipScore < 5) {
      recommendedDeficitSpeed = 'slow';
    } else if (motivationScore === 3 && readinessScore >= 8 && stressLevel === 'low') {
      recommendedDeficitSpeed = 'fast';
    }
    
    // Mapiranje motivation level-a
    const motivationLevelMap: Record<string, string> = {
      'Nizak': 'low',
      'Umjeren': 'moderate',
      'Visok': 'high'
    };
    const motivationLevelMapped = motivationLevelMap[motivationLevel] || 'moderate';
    
    // Spremanje psihološkog profila
    const psychologicalProfile = {
      client_id: submission.client_id,
      food_relationship_score: foodRelationshipScore,
      stress_level: stressLevel,
      mental_priorities: mentalPrioritiesArray,
      diet_history_complexity: dietHistoryComplexity,
      time_availability_minutes: timeAvailabilityMinutes,
      recommended_deficit_speed: recommendedDeficitSpeed,
      motivation_level: motivationLevelMapped,
      calculated_at: new Date().toISOString()
    };
    
    console.log('Psychological profile data:', psychologicalProfile);
    
    // Prvo provjeriti postoji li već profil
    const { data: existingProfile } = await supabase
      .from('client_psychological_profile')
      .select('id')
      .eq('client_id', submission.client_id)
      .maybeSingle();
    
    if (existingProfile) {
      console.log('Updating existing psychological profile');
      const { error: profileUpdateError } = await supabase
        .from('client_psychological_profile')
        .update(psychologicalProfile)
        .eq('client_id', submission.client_id);
      
      if (profileUpdateError) {
        console.error('Error updating psychological profile:', profileUpdateError);
        // Ne bacamo error jer je glavni task (update client data) uspio
      } else {
        console.log('Psychological profile updated successfully');
      }
    } else {
      console.log('Creating new psychological profile');
      const { error: profileInsertError } = await supabase
        .from('client_psychological_profile')
        .insert(psychologicalProfile);
      
      if (profileInsertError) {
        console.error('Error creating psychological profile:', profileInsertError);
        // Ne bacamo error jer je glavni task (update client data) uspio
      } else {
        console.log('Psychological profile created successfully');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Client data and psychological profile updated successfully',
        updatedFields: Object.keys(clientUpdates),
        psychologicalProfile: psychologicalProfile
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing coaching intake submission:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
