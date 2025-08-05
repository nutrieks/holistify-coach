import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ProgressDataPoint } from "@/hooks/useProgressData";

interface ProgressChartProps {
  data: ProgressDataPoint[];
  title: string;
  dataKey: keyof ProgressDataPoint;
  color: string;
  unit?: string;
  yAxisDomain?: [number, number];
}

export function ProgressChart({ 
  data, 
  title, 
  dataKey, 
  color, 
  unit = "", 
  yAxisDomain 
}: ProgressChartProps) {
  const filteredData = data.filter(item => item[dataKey] !== undefined);
  
  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="mb-2">Nema podataka za prikaz</p>
              <p className="text-sm">Dodajte check-in da biste vidjeli graf</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTooltipLabel = (label: string) => {
    return format(new Date(label), 'dd.MM.yyyy');
  };

  const formatTooltipValue = (value: number) => {
    return `${value}${unit}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => format(new Date(value), 'dd.MM')}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={yAxisDomain}
                tickFormatter={(value) => `${value}${unit}`}
              />
              <Tooltip 
                labelFormatter={formatTooltipLabel}
                formatter={(value: number) => [formatTooltipValue(value), title]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}