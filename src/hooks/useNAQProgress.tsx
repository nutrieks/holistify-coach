import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useNAQProgress(clientId: string) {
  return useQuery({
    queryKey: ['naq-progress', clientId],
    queryFn: async () => {
      // Get assigned questionnaires for this client
      const { data: assigned, error: assignedError } = await supabase
        .from('assigned_questionnaires')
        .select('id, status, questionnaire_id, assigned_at, completed_at')
        .eq('client_id', clientId)
        .order('assigned_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (assignedError) throw assignedError;

      if (!assigned) {
        return {
          status: 'not_sent',
          assignedId: null,
          percentage: 0,
          assignedAt: null,
          completedAt: null
        };
      }

      // If completed, return 100%
      if (assigned.status === 'completed') {
        return {
          status: 'completed',
          assignedId: assigned.id,
          percentage: 100,
          assignedAt: assigned.assigned_at,
          completedAt: assigned.completed_at
        };
      }

      // If sent but not viewed, return 0%
      if (assigned.status === 'sent') {
        return {
          status: 'sent',
          assignedId: assigned.id,
          percentage: 0,
          assignedAt: assigned.assigned_at,
          completedAt: null
        };
      }

      // If viewed, check draft progress
      const { data: draft } = await supabase
        .from('questionnaire_drafts')
        .select('answers, current_question_index')
        .eq('client_id', clientId)
        .eq('questionnaire_id', assigned.questionnaire_id)
        .maybeSingle();

      // Get total questions
      const { count: totalQuestions } = await supabase
        .from('questionnaire_questions')
        .select('*', { count: 'exact', head: true })
        .eq('questionnaire_id', assigned.questionnaire_id);

      if (!draft || !totalQuestions) {
        return {
          status: 'viewed',
          assignedId: assigned.id,
          percentage: 0,
          assignedAt: assigned.assigned_at,
          completedAt: null
        };
      }

      // Calculate percentage based on answered questions
      const answeredCount = Object.keys(draft.answers || {}).length;
      const percentage = Math.round((answeredCount / totalQuestions) * 100);

      return {
        status: 'in_progress',
        assignedId: assigned.id,
        percentage,
        assignedAt: assigned.assigned_at,
        completedAt: null
      };
    },
    enabled: !!clientId
  });
}
