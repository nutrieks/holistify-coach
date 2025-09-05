import { supabase } from '@/integrations/supabase/client';

export const seedNAQQuestions = async (questionnaireId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('seed-naq-questions', {
      body: { questionnaireId }
    });

    if (error) {
      throw error;
    }

    console.log('NAQ questions seeded successfully:', data);
    return data;
  } catch (error) {
    console.error('Error seeding NAQ questions:', error);
    throw error;
  }
};

// Call this function with your questionnaire ID
// seedNAQQuestions('b421c273-10bc-4d64-bc8b-8bcc7f68f367');