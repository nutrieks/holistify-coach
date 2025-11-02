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

  // Weekend pattern detection
  const detectWeekendPattern = (data: typeof trackingData) => {
    const mondaySpikes: number[] = [];
    const saturdaySpikes: number[] = [];
    
    data.forEach((entry, idx) => {
      if (idx === 0) return;
      const dayOfWeek = entry.date.getDay();
      const weightChange = entry.weight - data[idx - 1].weight;
      
      if (dayOfWeek === 1) mondaySpikes.push(weightChange); // Monday
      if (dayOfWeek === 6) saturdaySpikes.push(weightChange); // Saturday
    });
    
    const avgMondaySpike = mondaySpikes.length > 0 
      ? mondaySpikes.reduce((a, b) => a + b, 0) / mondaySpikes.length 
      : 0;
    const avgSaturdaySpike = saturdaySpikes.length > 0 
      ? saturdaySpikes.reduce((a, b) => a + b, 0) / saturdaySpikes.length 
      : 0;
    
    return { avgMondaySpike, avgSaturdaySpike, hasPattern: Math.abs(avgMondaySpike) > 0.3 || Math.abs(avgSaturdaySpike) > 0.3 };
  };
  
  const weekendPattern = detectWeekendPattern(trackingData);

  // Calculate projections locally
  const lastEntry = trackingData[trackingData.length - 1];
  const avgTDEE = trackingData.slice(-7).reduce((sum, e) => sum + (e.adaptiveTDEE || 2000), 0) / Math.min(7, trackingData.length);
  const dailyDeficit = avgTDEE - targetCalories;
  const dailyWeightChange = dailyDeficit / 7700;

  // Advanced metabolic adaptation based on deficit size
  const deficitPercentage = (dailyDeficit / avgTDEE) * 100;
  let baseAdaptationRate = 0.01 / 30; // 1% per month baseline
  
  if (deficitPercentage > 25) {
    baseAdaptationRate = 0.025 / 30; // 2.5% per month for aggressive deficit
  } else if (deficitPercentage > 15) {
    baseAdaptationRate = 0.015 / 30; // 1.5% per month for moderate deficit
  }

  const weightProjections = [];
  let currentWeight = lastEntry.weight;
  let currentEWMA = lastEntry.ewmaWeight;
  let currentTDEE = avgTDEE;

  for (let i = 1; i <= 90; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    
    // Apply weekend pattern if detected
    let weekendAdjustment = 0;
    if (weekendPattern.hasPattern) {
      if (dayOfWeek === 1) weekendAdjustment = weekendPattern.avgMondaySpike;
      if (dayOfWeek === 6) weekendAdjustment = weekendPattern.avgSaturdaySpike;
    }
    
    // Metabolic adaptation increases over time
    const adaptationMultiplier = 1 + (i / 90) * 0.5; // Adaptation gets stronger over 90 days
    currentTDEE *= (1 - baseAdaptationRate * adaptationMultiplier);
    
    // Recalculate daily weight change based on adapted TDEE
    const adaptedDailyChange = (currentTDEE - targetCalories) / 7700;
    
    currentWeight -= adaptedDailyChange;
    currentWeight += weekendAdjustment;
    currentEWMA = currentEWMA * 0.9 + currentWeight * 0.1;
    
    // Uncertainty corridor (±5%)
    const uncertaintyFactor = 0.05;
    const weightUpper = currentWeight * (1 + uncertaintyFactor);
    const weightLower = currentWeight * (1 - uncertaintyFactor);
    const tdeeUpper = currentTDEE * (1 + uncertaintyFactor);
    const tdeeLower = currentTDEE * (1 - uncertaintyFactor);
    
    weightProjections.push({
      date: date.toISOString().split('T')[0],
      projectedWeight: Math.round(currentWeight * 10) / 10,
      projectedEWMA: Math.round(currentEWMA * 10) / 10,
      weightUpper: Math.round(weightUpper * 10) / 10,
      weightLower: Math.round(weightLower * 10) / 10,
      projectedTDEE: Math.round(currentTDEE),
      tdeeUpper: Math.round(tdeeUpper),
      tdeeLower: Math.round(tdeeLower)
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
    weightUpper: proj.weightUpper,
    weightLower: proj.weightLower,
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

  const projectedTDEEData = weightProjections.map(proj => ({
    date: proj.date,
    tdee: proj.projectedTDEE,
    tdeeUpper: proj.tdeeUpper,
    tdeeLower: proj.tdeeLower,
    type: 'projected'
  }));

  const combinedTDEEData = [...historicalTDEE, ...projectedTDEEData];

  // Calculate statistics
  const currentWeightValue = trackingData[trackingData.length - 1].weight;
  const projectedWeightIn90Days = weightProjections[weightProjections.length - 1]?.projectedWeight || currentWeightValue;
  const totalProjectedLoss = currentWeightValue - projectedWeightIn90Days;

  const currentTDEEValue = trackingData[trackingData.length - 1].adaptiveTDEE;
  const projectedTDEEIn90Days = weightProjections[weightProjections.length - 1]?.projectedTDEE || currentTDEEValue;
  const tdeeChange = currentTDEEValue - projectedTDEEIn90Days;

  return (
    <div className="space-y-6">
      {/* Weekend Pattern Alert */}
      {weekendPattern.hasPattern && (
        <Alert>
          <AlertDescription>
            <strong>Vikend pattern detektiran:</strong> {' '}
            {weekendPattern.avgMondaySpike > 0.3 && `Ponedjeljak: prosječno +${weekendPattern.avgMondaySpike.toFixed(2)} kg. `}
            {weekendPattern.avgSaturdaySpike > 0.3 && `Subota: prosječno +${weekendPattern.avgSaturdaySpike.toFixed(2)} kg. `}
            Projekcije uključuju ovaj pattern.
          </AlertDescription>
        </Alert>
      )}

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
              <Line 
                type="monotone" 
                dataKey="weightUpper" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={1}
                strokeDasharray="2 2"
                name="Gornja granica (+5%)"
                dot={false}
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="weightLower" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={1}
                strokeDasharray="2 2"
                name="Donja granica (-5%)"
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
              <Line 
                type="monotone" 
                dataKey="tdeeUpper" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={1}
                strokeDasharray="2 2"
                name="Gornja granica (+5%)"
                dot={false}
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="tdeeLower" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={1}
                strokeDasharray="2 2"
                name="Donja granica (-5%)"
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
          <Alert className="mt-4">
            <AlertDescription>
              <strong>Napredni model:</strong> Projekcija uključuje uncertainty corridor (±5%), progresivnu metaboličku adaptaciju 
              ({deficitPercentage > 25 ? '2.5%' : deficitPercentage > 15 ? '1.5%' : '1%'} mjesečno bazno, progresivno jača), 
              i detektirane vikend patterne. Deficit: {deficitPercentage.toFixed(1)}%.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
