import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

interface DraftData {
  answers: Record<string, string | number>;
  currentQuestionIndex: number;
}

export const useDraftSaving = (questionnaireId: string, clientId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { execute, loading: isSaving } = useAsyncOperation();

  // Load existing draft
  const { data: draftData, isLoading: isLoadingDraft } = useQuery({
    queryKey: ['questionnaire-draft', questionnaireId, clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questionnaire_drafts')
        .select('*')
        .eq('questionnaire_id', questionnaireId)
        .eq('client_id', clientId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!questionnaireId && !!clientId,
  });

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (draftData: DraftData) => {
      const { error } = await supabase
        .from('questionnaire_drafts')
        .upsert({
          client_id: clientId,
          questionnaire_id: questionnaireId,
          answers: draftData.answers,
          current_question_index: draftData.currentQuestionIndex,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: ['questionnaire-draft', questionnaireId, clientId] });
    },
    onError: (error: any) => {
      console.error('Error saving draft to server:', error);
      // Silently fallback to localStorage for auto-save
      // Manual saves will still show error toast
    },
  });

  // Clear draft mutation
  const clearDraftMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('questionnaire_drafts')
        .delete()
        .eq('questionnaire_id', questionnaireId)
        .eq('client_id', clientId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaire-draft', questionnaireId, clientId] });
    },
  });

  // Auto-save function (silent, with localStorage fallback)
  const autoSave = useCallback(
    async (answers: Record<string, string | number>, currentQuestionIndex: number) => {
      if (!questionnaireId || !clientId) return;
      
      try {
        await saveDraftMutation.mutateAsync({ answers, currentQuestionIndex });
      } catch (error) {
        // Silently save to localStorage as fallback
        const localKey = `questionnaire-draft-${questionnaireId}-${clientId}`;
        localStorage.setItem(localKey, JSON.stringify({ answers, currentQuestionIndex }));
        setLastSaved(new Date());
      }
    },
    [questionnaireId, clientId, saveDraftMutation]
  );

  // Manual save function
  const saveDraft = useCallback(
    async (answers: Record<string, string | number>, currentQuestionIndex: number) => {
      if (!questionnaireId || !clientId) return;
      
      await execute(
        async () => {
          await saveDraftMutation.mutateAsync({ answers, currentQuestionIndex });
        },
        {
          successMessage: "Draft je uspješno spremljen",
          errorMessage: "Greška prilikom spremanja drafta"
        }
      );
    },
    [questionnaireId, clientId, saveDraftMutation, execute]
  );

  // Clear draft function
  const clearDraft = useCallback(async () => {
    if (!questionnaireId || !clientId) return;
    
    await execute(
      async () => {
        await clearDraftMutation.mutateAsync();
      },
      {
        successMessage: "Draft je obrisan",
        errorMessage: "Greška prilikom brisanja drafta"
      }
    );
  }, [questionnaireId, clientId, clearDraftMutation, execute]);

  return {
    draftData,
    isLoadingDraft,
    autoSave,
    saveDraft,
    clearDraft,
    isSaving,
    lastSaved,
  };
};