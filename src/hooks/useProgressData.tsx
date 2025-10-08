import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";

export interface ProgressDataPoint {
  date: string;
  weight?: number;
  waist_circumference?: number;
  energy_level?: number;
  mood?: number;
}

export interface DateRange {
  days: number;
  label: string;
}

export const DATE_RANGES: DateRange[] = [
  { days: 7, label: "Zadnjih 7 dana" },
  { days: 30, label: "Zadnjih 30 dana" },
  { days: 90, label: "Zadnjih 90 dana" }
];

export function useProgressData(clientId: string, dateRange: number = 30) {
  return useQuery({
    queryKey: ['progressData', clientId, dateRange],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), dateRange), 'yyyy-MM-dd');
      
      // Fetch from progress_tracking
      const { data: progressData, error: progressError } = await supabase
        .from('progress_tracking')
        .select('date, metric_type, value')
        .eq('client_id', clientId)
        .gte('date', startDate)
        .order('date', { ascending: true });

      if (progressError) throw progressError;

      // Fetch from client_anthropometric_data
      const { data: anthropometricData, error: anthropometricError } = await supabase
        .from('client_anthropometric_data')
        .select('measurement_date, weight, body_fat_navy, body_fat_manual, lean_body_mass, fat_mass, waist_circumference, hip_circumference, neck_circumference')
        .eq('client_id', clientId)
        .gte('measurement_date', startDate)
        .order('measurement_date', { ascending: true });

      if (anthropometricError) throw anthropometricError;

      // Group data by date
      const groupedData: Record<string, ProgressDataPoint> = {};
      
      // Add progress_tracking data
      progressData.forEach((item) => {
        const date = item.date;
        if (!groupedData[date]) {
          groupedData[date] = { date };
        }
        
        const value = parseFloat(item.value);
        if (!isNaN(value)) {
          switch (item.metric_type) {
            case 'weight':
              groupedData[date].weight = value;
              break;
            case 'waist_circumference':
              groupedData[date].waist_circumference = value;
              break;
            case 'energy_level':
              groupedData[date].energy_level = value;
              break;
            case 'mood':
              groupedData[date].mood = value;
              break;
          }
        }
      });

      // Add anthropometric data (use measurement_date as date)
      anthropometricData.forEach((item) => {
        const date = item.measurement_date;
        if (!groupedData[date]) {
          groupedData[date] = { date };
        }
        
        // Override with anthropometric data if available
        if (item.weight !== null) groupedData[date].weight = item.weight;
        if (item.waist_circumference !== null) groupedData[date].waist_circumference = item.waist_circumference;
      });

      return Object.values(groupedData).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    },
    enabled: !!clientId
  });
}