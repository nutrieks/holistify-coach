import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { useCreateCompleteNAQ } from "@/hooks/useCreateCompleteNAQ";

export const CreateCompleteNAQButton = () => {
  const { mutate: createNAQ, isPending } = useCreateCompleteNAQ();

  return (
    <Button
      onClick={() => createNAQ()}
      disabled={isPending}
      size="lg"
      className="gap-2"
    >
      {isPending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Kreiranje NAQ-a...
        </>
      ) : (
        <>
          <FileText className="h-5 w-5" />
          Kreiraj Kompletan NAQ (321 pitanja)
        </>
      )}
    </Button>
  );
};
