import { Button } from "@/components/ui/button";
import { Loader2, Database } from "lucide-react";
import { useSeedTestData } from "@/hooks/useSeedTestData";

export const SeedTestDataButton = () => {
  const { seedTestData, isLoading } = useSeedTestData();

  const handleClick = async () => {
    try {
      await seedTestData();
      // Refresh page after seeding
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Failed to seed test data:', error);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Kreiram podatke...
        </>
      ) : (
        <>
          <Database className="mr-2 h-4 w-4" />
          Kreiraj Test Podatke
        </>
      )}
    </Button>
  );
};
