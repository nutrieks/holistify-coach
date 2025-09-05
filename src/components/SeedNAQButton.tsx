import { Button } from "@/components/ui/button";
import { useSeedNAQQuestions } from "@/hooks/useSeedNAQQuestions";

export const SeedNAQButton = () => {
  const { mutate: seedQuestions, isPending } = useSeedNAQQuestions();

  const handleSeedQuestions = () => {
    seedQuestions('b421c273-10bc-4d64-bc8b-8bcc7f68f367');
  };

  return (
    <Button 
      onClick={handleSeedQuestions} 
      disabled={isPending}
      variant="outline"
    >
      {isPending ? 'Seeding NAQ Questions...' : 'Seed NAQ Questions (321)'}
    </Button>
  );
};