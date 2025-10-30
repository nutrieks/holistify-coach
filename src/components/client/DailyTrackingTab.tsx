import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, TrendingUp, Activity, Zap, Plus } from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { 
  calculateEWMA, 
  calculateDailyStoreChange, 
  calculateWeightedAdaptiveTDEE,
  shouldEnableFastAdaptation 
} from "@/utils/expertSystemCalculations";

interface DailyTrackingTabProps {
  clientId: string;
}

export default function DailyTrackingTab({ clientId }: DailyTrackingTabProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trackingData, setTrackingData] = useState<any[]>([]);
  
  // Form state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyWeight, setDailyWeight] = useState("");
  const [dailyCalories, setDailyCalories] = useState("");

  useEffect(() => {
    loadTrackingData();
  }, [clientId]);

  const loadTrackingData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("client_daily_tracking")
        .select("*")
        .eq("client_id", clientId)
        .order("tracking_date", { ascending: false })
        .limit(30);

      if (error) throw error;
      setTrackingData(data || []);
    } catch (error: any) {
      console.error("Error loading tracking data:", error);
      toast({
        title: "Greška",
        description: "Nije moguće učitati podatke praćenja.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!dailyWeight || !dailyCalories) {
      toast({
        title: "Greška",
        description: "Molimo unesite težinu i kalorije.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const weight = parseFloat(dailyWeight);
      const calories = parseFloat(dailyCalories);
      
      // Get yesterday's weight for store change calculation
      const yesterday = new Date(selectedDate);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: yesterdayData } = await supabase
        .from("client_daily_tracking")
        .select("daily_weight")
        .eq("client_id", clientId)
        .eq("tracking_date", yesterday.toISOString().split('T')[0])
        .maybeSingle();

      let storeChange = null;
      if (yesterdayData?.daily_weight) {
        storeChange = calculateDailyStoreChange(weight, yesterdayData.daily_weight);
      }

      // Calculate EWMA if we have historical data
      const { data: historicalData } = await supabase
        .from("client_daily_tracking")
        .select("tracking_date, daily_weight")
        .eq("client_id", clientId)
        .order("tracking_date", { ascending: true })
        .limit(30);

      let weightEWMA = weight;
      if (historicalData && historicalData.length > 0) {
        const weights = [...historicalData, { tracking_date: selectedDate.toISOString().split('T')[0], daily_weight: weight }]
          .map(d => ({ date: new Date(d.tracking_date), weight: d.daily_weight }));
        const ewmaValues = calculateEWMA(weights);
        weightEWMA = ewmaValues[ewmaValues.length - 1];
      }

      // Calculate 7-day Adaptive TDEE if we have enough data
      const { data: last7Days } = await supabase
        .from("client_daily_tracking")
        .select("daily_calories_consumed, daily_change_in_stores")
        .eq("client_id", clientId)
        .order("tracking_date", { ascending: false })
        .limit(6);

      let adaptiveTDEE7Day = null;
      if (last7Days && last7Days.length >= 6) {
        const dailyDataForTDEE = [
          { caloriesConsumed: calories, storeChange: storeChange || 0 },
          ...last7Days.map(d => ({
            caloriesConsumed: d.daily_calories_consumed || 0,
            storeChange: d.daily_change_in_stores || 0
          }))
        ];
        adaptiveTDEE7Day = calculateWeightedAdaptiveTDEE(dailyDataForTDEE);
      }

      // Upsert tracking entry
      const { error } = await supabase
        .from("client_daily_tracking")
        .upsert({
          client_id: clientId,
          tracking_date: selectedDate.toISOString().split('T')[0],
          daily_weight: weight,
          daily_calories_consumed: calories,
          weight_ewma: weightEWMA,
          daily_change_in_stores: storeChange,
          adaptive_tdee_7day: adaptiveTDEE7Day
        }, {
          onConflict: 'client_id,tracking_date'
        });

      if (error) throw error;

      toast({
        title: "Spremljeno",
        description: "Dnevni podaci su uspješno zabilježeni."
      });

      setDailyWeight("");
      setDailyCalories("");
      loadTrackingData();
    } catch (error: any) {
      console.error("Error saving tracking data:", error);
      toast({
        title: "Greška",
        description: error.message || "Nije moguće spremiti podatke.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Prepare chart data
  const chartData = trackingData
    .slice()
    .reverse()
    .map(d => ({
      date: format(new Date(d.tracking_date), 'dd.MM'),
      weight: d.daily_weight,
      ewma: d.weight_ewma,
      tdee: d.adaptive_tdee_7day
    }));

  // Fast Adaptation Check
  const fastAdaptationCheck = trackingData.length >= 7 ? (() => {
    const lastWeek = trackingData.slice(0, 7);
    const firstWeight = lastWeek[lastWeek.length - 1]?.daily_weight;
    const lastWeight = lastWeek[0]?.daily_weight;
    
    if (firstWeight && lastWeight) {
      const weeklyChange = (firstWeight - lastWeight) / firstWeight;
      return shouldEnableFastAdaptation('fat_loss', weeklyChange, 0.005);
    }
    return null;
  })() : null;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Učitavanje...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fast Adaptation Alert */}
      {fastAdaptationCheck?.shouldEnable && (
        <Card className="border-orange-500 bg-orange-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Zap className="h-5 w-5" />
              Fast Adaptation Mode Preporuka
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{fastAdaptationCheck.reasoning}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Razmislite o povećanju kalorija ili smanjenju kardio aktivnosti kako bi se postigao bolji tempo gubitka težine.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Unos Dnevnih Podataka
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Datum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "dd.MM.yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Weight Input */}
            <div className="space-y-2">
              <Label htmlFor="dailyWeight">Težina (kg)</Label>
              <Input
                id="dailyWeight"
                type="number"
                step="0.1"
                value={dailyWeight}
                onChange={(e) => setDailyWeight(e.target.value)}
                placeholder="npr. 75.5"
              />
            </div>

            {/* Calories Input */}
            <div className="space-y-2">
              <Label htmlFor="dailyCalories">Kalorije (kcal)</Label>
              <Input
                id="dailyCalories"
                type="number"
                step="10"
                value={dailyCalories}
                onChange={(e) => setDailyCalories(e.target.value)}
                placeholder="npr. 2200"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Spremanje..." : "Spremi Dnevne Podatke"}
          </Button>
        </CardContent>
      </Card>

      {/* EWMA Weight Trend Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              EWMA Trend Težine
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Eksponencijalno izglađeni trend težine (alpha=0.3)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="weight" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="Stvarna Težina" />
                <Line type="monotone" dataKey="ewma" stroke="#10b981" strokeWidth={2} name="EWMA Trend" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Adaptive TDEE Chart */}
      {chartData.some(d => d.tdee) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              7-Dnevni Adaptive TDEE
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Weighted moving average realnog TDEE-a
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tdee" stroke="#f59e0b" strokeWidth={2} name="Adaptive TDEE (kcal)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Entries Table */}
      {trackingData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nedavni Unosi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trackingData.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{format(new Date(entry.tracking_date), 'dd.MM.yyyy')}</Badge>
                    <span className="text-sm">
                      <strong>{entry.daily_weight} kg</strong> · {entry.daily_calories_consumed} kcal
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {entry.weight_ewma && <span>EWMA: {entry.weight_ewma.toFixed(1)} kg</span>}
                    {entry.adaptive_tdee_7day && <span>TDEE: {Math.round(entry.adaptive_tdee_7day)} kcal</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {trackingData.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nema podataka za praćenje. Počnite unositi dnevnu težinu i kalorije.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
