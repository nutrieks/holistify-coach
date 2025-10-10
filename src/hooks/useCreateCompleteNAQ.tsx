import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useCreateCompleteNAQ = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-complete-naq', {
        body: {}
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh NAQ status
      queryClient.invalidateQueries({ queryKey: ['naq-exists'] });
      queryClient.invalidateQueries({ queryKey: ['naq-questionnaire'] });
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      
      toast({
        title: "NAQ uspješno kreiran",
        description: `Kreiran je kompletan NAQ upitnik s ${data.questionCount} pitanja.`,
      });
    },
    onError: (error: any) => {
      console.error('Greška prilikom kreiranja NAQ upitnika:', error);
      toast({
        title: "Greška",
        description: error.message || "Nije moguće kreirati NAQ upitnik.",
        variant: "destructive",
      });
    },
  });
};
