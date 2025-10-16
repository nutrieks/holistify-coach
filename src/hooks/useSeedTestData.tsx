import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSeedTestData = () => {
  const [isLoading, setIsLoading] = useState(false);

  const seedTestData = async () => {
    try {
      setIsLoading(true);
      toast.loading('Kreiram test podatke...');

      const { data, error } = await supabase.functions.invoke('seed-test-nutrition-data');

      if (error) throw error;

      toast.dismiss();
      toast.success('Test podaci uspješno kreirani!');
      
      return data;
    } catch (error) {
      toast.dismiss();
      toast.error('Greška prilikom kreiranja test podataka');
      console.error('Error seeding test data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { seedTestData, isLoading };
};
