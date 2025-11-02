import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface RetrospectiveChartsTabProps {
  clientId: string;
}

export default function RetrospectiveChartsTab({ clientId }: RetrospectiveChartsTabProps) {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadRetrospectiveData();
  }, [clientId]);

  const loadRetrospectiveData = async () => {
    setLoading(true);
    try {
      // Get daily tracking data (weight, calories, TDEE)
      const { data: trackingData, error } = await supabase
        .from("client_daily_tracking")
        .select("*")
        .eq("client_id", clientId)
        .order("tracking_date", { ascending: true })
        .limit(90); // Last 90 days

      if (error) throw error;

      // Transform data for chart
      const transformedData = (trackingData || []).map((entry) => ({
        date: new Date(entry.tracking_date).toLocaleDateString("hr-HR", { 
          day: "2-digit", 
          month: "2-digit" 
        }),
        weight: entry.daily_weight ? Number(entry.daily_weight) : null,
        calories: entry.daily_calories_consumed ? Number(entry.daily_calories_consumed) : null,
        tdee: entry.adaptive_tdee_7day ? Number(entry.adaptive_tdee_7day) : null,
      }));

      setChartData(transformedData);
    } catch (error) {
      console.error("Error loading retrospective data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Učitavanje podataka...</div>;
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Nema dostupnih podataka za retrospektivni prikaz.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Combined Retrospective Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Retrospektivni Prikaz - Težina, Unos i TDEE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                yAxisId="left"
                label={{ value: 'Težina (kg)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                label={{ value: 'Kalorije (kcal)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              
              {/* Weight Line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                name="Težina (kg)"
                dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                connectNulls
              />
              
              {/* Calories Line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="calories"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                name="Unos (kcal)"
                dot={{ fill: 'hsl(var(--chart-1))', r: 2 }}
                connectNulls
              />
              
              {/* TDEE Line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="tdee"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="TDEE (kcal)"
                dot={{ fill: 'hsl(var(--chart-2))', r: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-4 h-1 bg-primary rounded" />
                <span className="font-semibold">Težina</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Dnevna težina klijenta (kg)
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-4 h-1" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
                <span className="font-semibold">Unos</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Dnevni unos kalorija (kcal)
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-4 h-1 border-t-2 border-dashed" style={{ borderColor: 'hsl(var(--chart-2))' }} />
                <span className="font-semibold">TDEE</span>
              </div>
              <p className="text-xs text-muted-foreground">
                7-dnevni adaptivni TDEE (kcal)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
