import { Button } from "@/components/ui/button";
import { useSeedMicronutrientQuestionnaire } from "@/hooks/useSeedMicronutrientQuestionnaire";
import { Loader2, Database } from "lucide-react";

export const SeedMicronutrientQuestionnaireButton = () => {
  const { mutate: seedQuestionnaire, isPending } = useSeedMicronutrientQuestionnaire();

  return (
    <Button
      onClick={() => seedQuestionnaire()}
      disabled={isPending}
      variant="outline"
      size="sm"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Kreiranje...
        </>
      ) : (
        <>
          <Database className="mr-2 h-4 w-4" />
          Kreiraj Mikronutritivni Upitnik
        </>
      )}
    </Button>
  );
};
