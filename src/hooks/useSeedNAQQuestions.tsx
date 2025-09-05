import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useSeedNAQQuestions = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (questionnaireId: string) => {
      const { data, error } = await supabase.functions.invoke('seed-naq-questions', {
        body: { questionnaireId }
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "NAQ pitanja dodana",
        description: `${data.message}. Ukupno pitanja: ${data.totalQuestions}`,
      });
    },
    onError: (error: any) => {
      console.error('Greška prilikom dodavanja NAQ pitanja:', error);
      toast({
        title: "Greška",
        description: error.message || "Nije moguće dodati NAQ pitanja.",
        variant: "destructive",
      });
    },
  });
};