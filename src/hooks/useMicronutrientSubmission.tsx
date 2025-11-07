import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useMicronutrientSubmission = (clientId: string) => {
  const queryClient = useQueryClient();

  // Get or create draft submission
  const { data: submission, isLoading } = useQuery({
    queryKey: ['micronutrient-submission', clientId],
    queryFn: async () => {
      // First, check if there's an assigned questionnaire for this client
      const { data: assignment, error: assignmentError } = await supabase
        .from('assigned_micronutrient_questionnaires')
        .select('questionnaire_id')
        .eq('client_id', clientId)
        .maybeSingle();

      if (assignmentError) throw assignmentError;
      
      // Require assignment to proceed
      if (!assignment || !assignment.questionnaire_id) {
        throw new Error('Upitnik nije dodijeljen. Kontaktirajte svog savjetnika.');
      }
      
      const questionnaireId = assignment.questionnaire_id;

      // Check for existing draft or completed submission
      const { data: existing, error: existingError } = await supabase
        .from('client_micronutrient_submissions')
        .select('*')
        .eq('client_id', clientId)
        .eq('questionnaire_id', questionnaireId)
        .in('status', ['draft', 'completed'])
        .order('started_at', { ascending: false })
        .maybeSingle();

      if (existingError) throw existingError;

      // If draft exists, return it
      if (existing && existing.status === 'draft') {
        return existing;
      }

      // If completed exists and no draft, create new draft for retake
      // Create new submission
      const { data: newSubmission, error: createError } = await supabase
        .from('client_micronutrient_submissions')
        .insert({
          client_id: clientId,
          questionnaire_id: questionnaireId,
          status: 'draft'
        })
        .select()
        .single();

      if (createError) throw createError;
      return newSubmission;
    },
    enabled: !!clientId
  });

  // Save answer
  const saveAnswer = useMutation({
    mutationFn: async ({ questionId, answerValue }: { questionId: string; answerValue: any }) => {
      if (!submission) throw new Error('Submission not found');

      // Check if answer exists
      const { data: existing } = await supabase
        .from('client_micronutrient_answers')
        .select('id')
        .eq('submission_id', submission.id)
        .eq('question_id', questionId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('client_micronutrient_answers')
          .update({ answer_value: answerValue })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('client_micronutrient_answers')
          .insert({
            submission_id: submission.id,
            question_id: questionId,
            answer_value: answerValue
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['micronutrient-answers', submission?.id] });
    }
  });

  // Submit final
  const submitFinal = useMutation({
    mutationFn: async () => {
      if (!submission) throw new Error('Submission not found');

      // Mark as completed
      const { error: updateError } = await supabase
        .from('client_micronutrient_submissions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', submission.id);

      if (updateError) throw updateError;

      // Trigger calculation
      const { error: calcError } = await supabase.functions.invoke(
        'calculate-micronutrient-assessment',
        { body: { submission_id: submission.id } }
      );

      if (calcError) throw calcError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['micronutrient-submission', clientId] });
      queryClient.invalidateQueries({ queryKey: ['micronutrient-results', clientId] });
      toast.success("Upitnik uspješno poslan!", {
        description: "Rezultati su izračunati i dostupni"
      });
    },
    onError: (error: any) => {
      toast.error("Greška pri slanju upitnika", {
        description: error.message
      });
    }
  });

  return {
    submission,
    isLoading,
    saveAnswer,
    submitFinal
  };
};

// Hook to fetch questions
export const useMicronutrientQuestions = (questionnaireId?: string) => {
  return useQuery({
    queryKey: ['micronutrient-questions', questionnaireId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('micronutrient_questions')
        .select('*')
        .eq('questionnaire_id', questionnaireId!)
        .order('order_index');

      if (error) throw error;
      return data;
    },
    enabled: !!questionnaireId
  });
};

// Hook to fetch saved answers
export const useMicronutrientAnswers = (submissionId?: string) => {
  return useQuery({
    queryKey: ['micronutrient-answers', submissionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_micronutrient_answers')
        .select('*')
        .eq('submission_id', submissionId!);

      if (error) throw error;
      return data;
    },
    enabled: !!submissionId
  });
};
