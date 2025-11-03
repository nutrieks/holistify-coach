import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMicronutrientResults = (clientId?: string) => {
  return useQuery({
    queryKey: ['micronutrient-results', clientId],
    queryFn: async () => {
      // Get latest completed submission
      const { data: submission, error: submissionError } = await supabase
        .from('client_micronutrient_submissions')
        .select('id, completed_at')
        .eq('client_id', clientId!)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (submissionError) throw submissionError;
      if (!submission) return null;

      // Get all results for this submission
      const { data: results, error: resultsError } = await supabase
        .from('client_micronutrient_results')
        .select('*')
        .eq('submission_id', submission.id)
        .order('final_weighted_score', { ascending: true });

      if (resultsError) throw resultsError;

      return {
        submission,
        results: results || []
      };
    },
    enabled: !!clientId
  });
};

// Hook to fetch all client submissions history
export const useMicronutrientHistory = (clientId?: string) => {
  return useQuery({
    queryKey: ['micronutrient-history', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_micronutrient_submissions')
        .select(`
          id,
          status,
          started_at,
          completed_at,
          questionnaire:micronutrient_questionnaires(title)
        `)
        .eq('client_id', clientId!)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!clientId
  });
};
