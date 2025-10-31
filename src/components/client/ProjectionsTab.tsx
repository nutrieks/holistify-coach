import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingDown, TrendingUp, Activity } from "lucide-react";
import { type DailyTrackingEntry } from "@/utils/expertSystemCalculations";

interface ProjectionsTabProps {
  clientId: string;
  targetCalories?: number;
}

export function ProjectionsTab({ clientId, targetCalories = 2000 }: ProjectionsTabProps) {
  const { data: trackingData, isLoading } = useQuery({
    queryKey: ['daily-tracking-projections', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_daily_tracking')
        .select('*')
        .eq('client_id', clientId)
        .order('tracking_date', { ascending: true });

      if (error) throw error;

      return data.map(entry => ({
        date: new Date(entry.tracking_date),
        weight: entry.daily_weight || 0,
        caloriesConsumed: entry.daily_calories_consumed || 0,
        storeChange: entry.daily_change_in_stores || 0,
        adaptiveTDEE: entry.adaptive_tdee_7day || 0,
        ewmaWeight: entry.weight_ewma || entry.daily_weight || 0
      }));
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <Activity className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trackingData || trackingData.length < 7) {
    return (
      <Alert>
        <AlertDescription>
          Potrebno je najmanje 7 dana praćenja za prikazivanje projekcija. Trenutno imate {trackingData?.length || 0} dana.
        </AlertDescription>
      </Alert>
    );
  }

  // Calculate projections locally
  const lastEntry = trackingData[trackingData.length - 1];
  const avgTDEE = trackingData.slice(-7).reduce((sum, e) => sum + (e.adaptiveTDEE || 2000), 0) / Math.min(7, trackingData.length);
  const dailyDeficit = avgTDEE - targetCalories;
  const dailyWeightChange = dailyDeficit / 7700;

  const weightProjections = [];
  let currentWeight = lastEntry.weight;
  let currentEWMA = lastEntry.ewmaWeight;

  for (let i = 1; i <= 90; i++) {
    currentWeight -= dailyWeightChange;
    currentEWMA = currentEWMA * 0.9 + currentWeight * 0.1;
    
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    weightProjections.push({
      date: date.toISOString().split('T')[0],
      projectedWeight: Math.round(currentWeight * 10) / 10,
      projectedEWMA: Math.round(currentEWMA * 10) / 10
    });
  }

  // TDEE projections
  const adaptationRate = 0.01 / 30;
  const tdeeProjections = [];
  let currentTDEE = avgTDEE;

  for (let i = 1; i <= 90; i++) {
    currentTDEE *= (1 - adaptationRate);
    
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    tdeeProjections.push({
      date: date.toISOString().split('T')[0],
      projectedTDEE: Math.round(currentTDEE)
    });
  }

  // Historical + Projected Weight Data
  const historicalWeight = trackingData.map(entry => ({
    date: entry.date.toISOString().split('T')[0],
    weight: entry.weight,
    ewma: entry.ewmaWeight,
    type: 'historical'
  }));

  const projectedWeightData = weightProjections.map(proj => ({
    date: proj.date,
    weight: proj.projectedWeight,
    ewma: proj.projectedEWMA,
    type: 'projected'
  }));

  const combinedWeightData = [...historicalWeight, ...projectedWeightData];

  // Historical + Projected TDEE Data
  const historicalTDEE = trackingData
    .filter(e => e.adaptiveTDEE > 0)
    .map(entry => ({
      date: entry.date.toISOString().split('T')[0],
      tdee: entry.adaptiveTDEE,
      type: 'historical'
    }));

  const projectedTDEEData = tdeeProjections.map(proj => ({
    date: proj.date,
    tdee: proj.projectedTDEE,
    type: 'projected'
  }));

  const combinedTDEEData = [...historicalTDEE, ...projectedTDEEData];

  // Calculate statistics
  const currentWeightValue = trackingData[trackingData.length - 1].weight;
  const projectedWeightIn90Days = weightProjections[weightProjections.length - 1]?.projectedWeight || currentWeightValue;
  const totalProjectedLoss = currentWeightValue - projectedWeightIn90Days;

  const currentTDEEValue = trackingData[trackingData.length - 1].adaptiveTDEE;
  const projectedTDEEIn90Days = tdeeProjections[tdeeProjections.length - 1]?.projectedTDEE || currentTDEEValue;
  const tdeeChange = currentTDEEValue - projectedTDEEIn90Days;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trenutna Težina</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWeightValue.toFixed(1)} kg</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projekcija (90 dana)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {projectedWeightIn90Days.toFixed(1)} kg
              <TrendingDown className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {totalProjectedLoss > 0 ? '-' : '+'}{Math.abs(totalProjectedLoss).toFixed(1)} kg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">TDEE Promjena</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {projectedTDEEIn90Days.toFixed(0)} kcal
              {tdeeChange > 0 ? (
                <TrendingDown className="w-5 h-5 text-orange-500" />
              ) : (
                <TrendingUp className="w-5 h-5 text-green-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {tdeeChange > 0 ? '-' : '+'}{Math.abs(tdeeChange).toFixed(0)} kcal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weight Projection Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Projekcija Težine (90 dana)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={combinedWeightData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' })}
                className="text-xs"
              />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} className="text-xs" />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString('hr-HR')}
                formatter={(value: number) => [`${value.toFixed(1)} kg`, '']}
              />
              <Legend />
              <ReferenceLine 
                x={trackingData[trackingData.length - 1].date.toISOString().split('T')[0]} 
                stroke="hsl(var(--border))" 
                strokeDasharray="3 3" 
                label="Danas"
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Težina"
                dot={{ r: 2 }}
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="ewma" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="EWMA Trend"
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* TDEE Projection Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Projekcija TDEE (90 dana)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={combinedTDEEData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' })}
                className="text-xs"
              />
              <YAxis domain={['dataMin - 100', 'dataMax + 100']} className="text-xs" />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString('hr-HR')}
                formatter={(value: number) => [`${value.toFixed(0)} kcal`, '']}
              />
              <Legend />
              <ReferenceLine 
                x={historicalTDEE[historicalTDEE.length - 1]?.date} 
                stroke="hsl(var(--border))" 
                strokeDasharray="3 3" 
                label="Danas"
              />
              <Line 
                type="monotone" 
                dataKey="tdee" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
                name="Adaptivni TDEE"
                dot={{ r: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
          <Alert className="mt-4">
            <AlertDescription>
              Projekcija pretpostavlja konstantan unos od {targetCalories} kcal/dan i metaboličku adaptaciju od ~1% mjesečno.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
