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

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Client data updated successfully',
        updatedFields: Object.keys(clientUpdates)
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
