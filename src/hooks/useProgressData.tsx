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
      
      const { data, error } = await supabase
        .from('progress_tracking')
        .select('date, metric_type, value')
        .eq('client_id', clientId)
        .gte('date', startDate)
        .order('date', { ascending: true });

      if (error) throw error;

      // Group data by date
      const groupedData: Record<string, ProgressDataPoint> = {};
      
      data.forEach((item) => {
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

      return Object.values(groupedData).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    },
    enabled: !!clientId
  });
}