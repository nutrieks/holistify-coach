import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const CreateCoachingIntakeButton = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: createIntake, isPending } = useMutation({
    mutationFn: async () => {
      console.log('Invoking create-coaching-intake function...');
      const { data, error } = await supabase.functions.invoke(
        'create-coaching-intake',
        { body: {} }
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      console.log('Coaching intake created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      
      if (data.success === false) {
        toast({
          title: "Upitnik već postoji",
          description: data.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Inicijalni Coaching Upitnik kreiran",
          description: `Uspješno dodano ${data.questionCount} pitanja.`,
        });
      }
    },
    onError: (error: any) => {
      console.error('Error creating coaching intake:', error);
      toast({
        title: "Greška",
        description: error.message || "Nije moguće kreirati upitnik.",
        variant: "destructive",
      });
    },
  });

  return (
    <Button
      onClick={() => createIntake()}
      disabled={isPending}
      size="lg"
      className="gap-2"
    >
      {isPending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Kreiranje...
        </>
      ) : (
        <>
          <FileText className="h-5 w-5" />
          Kreiraj Inicijalni Coaching Upitnik (141 pitanja)
        </>
      )}
    </Button>
  );
};
