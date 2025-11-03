import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSeedMicronutrientQuestionnaire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        'seed-micronutrient-questionnaire'
      );

      if (error) {
        console.error('Error seeding micronutrient questionnaire:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['micronutrient-questionnaires'] });
      toast.success("Mikronutritivni upitnik uspješno kreiran!", {
        description: "166 pitanja dodano u bazu podataka"
      });
    },
    onError: (error: any) => {
      console.error('Seed error:', error);
      toast.error("Greška pri kreiranju upitnika", {
        description: error.message || "Pokušajte ponovo"
      });
    },
  });
};
