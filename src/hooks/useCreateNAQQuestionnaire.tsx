import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './useAuth';

export const useCreateNAQQuestionnaire = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('Korisnik nije prijavljen');
      }

      const { data, error } = await supabase.functions.invoke('create-naq-questionnaire', {
        body: { coachId: user.id }
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "NAQ uspješno kreiran",
        description: `Kreiran je NAQ upitnik s ${data.questionCount} pitanja.`,
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