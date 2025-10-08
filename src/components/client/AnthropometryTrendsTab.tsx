import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { hr } from "date-fns/locale";
import { TrendingUp, TrendingDown, Weight, Activity, Ruler, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddAnthropometricDataModal from "./AddAnthropometricDataModal";

interface AnthropometricData {
  id: string;
  measurement_date: string;
  height: number | null;
  weight: number | null;
  body_fat_manual: number | null;
  body_fat_navy: number | null;
  lean_body_mass: number | null;
  fat_mass: number | null;
  waist_circumference: number | null;
  hip_circumference: number | null;
  neck_circumference: number | null;
  wrist_circumference: number | null;
  digit_ratio_2d4d: number | null;
}

interface AnthropometryTabProps {
  data: AnthropometricData[];
  clientId: string;
  clientGender: string | null;
  onDataAdded: () => void;
}

export default function AnthropometryTab({ data, clientId, clientGender, onDataAdded }: AnthropometryTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  if (!data || data.length === 0) {
    return (
      <>
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj Mjerenje
          </Button>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Nema dostupnih mjerenja za prikaz trendova.</p>
            </div>
          </CardContent>
        </Card>
        <AddAnthropometricDataModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          clientId={clientId}
          clientGender={clientGender}
          onDataAdded={onDataAdded}
        />
      </>
    );
  }

  // Prepare data for charts (reverse to show chronological order)
  const chartData = [...data].reverse().map(d => ({
    date: format(new Date(d.measurement_date), 'dd.MM', { locale: hr }),
    fullDate: format(new Date(d.measurement_date), 'dd.MM.yyyy', { locale: hr }),
    weight: d.weight,
    bodyFat: d.body_fat_navy || d.body_fat_manual,
    lbm: d.lean_body_mass,
    fm: d.fat_mass,
    waist: d.waist_circumference,
    hip: d.hip_circumference,
    neck: d.neck_circumference,
  }));

  // Calculate trends
  const calculateTrend = (key: keyof typeof chartData[0]) => {
    const validData = chartData.filter(d => d[key] != null);
    if (validData.length < 2) return null;
    
    const first = validData[0][key] as number;
    const last = validData[validData.length - 1][key] as number;
    const change = last - first;
    const percentChange = ((change / first) * 100).toFixed(1);
    
    return {
      change: change.toFixed(1),
      percentChange,
      isPositive: change > 0,
    };
  };

  const weightTrend = calculateTrend('weight');
  const bodyFatTrend = calculateTrend('bodyFat');

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj Mjerenje
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukupna Promjena Težine</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {weightTrend ? (
              <div>
                <div className="text-2xl font-bold">
                  {weightTrend.isPositive ? '+' : ''}{weightTrend.change} kg
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  {weightTrend.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-red-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-green-500" />
                  )}
                  <span>{weightTrend.percentChange}% od prvog mjerenja</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Potrebno više mjerenja</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promjena Body Fat %</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {bodyFatTrend ? (
              <div>
                <div className="text-2xl font-bold">
                  {bodyFatTrend.isPositive ? '+' : ''}{bodyFatTrend.change}%
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  {bodyFatTrend.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-red-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-green-500" />
                  )}
                  <span>{bodyFatTrend.percentChange}% od prvog mjerenja</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Potrebno više mjerenja</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Broj Mjerenja</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Posljednje: {format(new Date(data[0].measurement_date), 'dd. MMM yyyy', { locale: hr })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weight Trend Chart */}
      {chartData.some(d => d.weight) && (
        <Card>
          <CardHeader>
            <CardTitle>Trend Težine</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => {
                    const item = chartData.find(d => d.date === label);
                    return item?.fullDate || label;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Težina (kg)"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Body Composition Chart */}
      {chartData.some(d => d.bodyFat || d.lbm || d.fm) && (
        <Card>
          <CardHeader>
            <CardTitle>Sastav Tijela</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => {
                    const item = chartData.find(d => d.date === label);
                    return item?.fullDate || label;
                  }}
                />
                <Legend />
                {chartData.some(d => d.bodyFat) && (
                  <Line 
                    type="monotone" 
                    dataKey="bodyFat" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Body Fat %"
                    dot={{ r: 4 }}
                  />
                )}
                {chartData.some(d => d.lbm) && (
                  <Line 
                    type="monotone" 
                    dataKey="lbm" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="LBM (kg)"
                    dot={{ r: 4 }}
                  />
                )}
                {chartData.some(d => d.fm) && (
                  <Line 
                    type="monotone" 
                    dataKey="fm" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="FM (kg)"
                    dot={{ r: 4 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Circumferences Chart */}
      {chartData.some(d => d.waist || d.hip || d.neck) && (
        <Card>
          <CardHeader>
            <CardTitle>Opsezi (cm)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => {
                    const item = chartData.find(d => d.date === label);
                    return item?.fullDate || label;
                  }}
                />
                <Legend />
                {chartData.some(d => d.waist) && (
                  <Line 
                    type="monotone" 
                    dataKey="waist" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Struk (cm)"
                    dot={{ r: 4 }}
                  />
                )}
                {chartData.some(d => d.hip) && (
                  <Line 
                    type="monotone" 
                    dataKey="hip" 
                    stroke="#ec4899" 
                    strokeWidth={2}
                    name="Bokovi (cm)"
                    dot={{ r: 4 }}
                  />
                )}
                {chartData.some(d => d.neck) && (
                  <Line 
                    type="monotone" 
                    dataKey="neck" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    name="Vrat (cm)"
                    dot={{ r: 4 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      </div>
      
      <AddAnthropometricDataModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        clientId={clientId}
        clientGender={clientGender}
        onDataAdded={onDataAdded}
      />
    </>
  );
}
