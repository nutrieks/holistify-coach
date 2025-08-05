import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ProgressDataPoint } from "@/hooks/useProgressData";

interface EnergyMoodChartProps {
  data: ProgressDataPoint[];
}

export function EnergyMoodChart({ data }: EnergyMoodChartProps) {
  const filteredData = data.filter(item => 
    item.energy_level !== undefined || item.mood !== undefined
  );
  
  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Energija i Raspoloženje</CardTitle>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Energija i Raspoloženje</CardTitle>
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
                domain={[1, 10]}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                labelFormatter={formatTooltipLabel}
                formatter={(value: number, name: string) => [
                  `${value}/10`, 
                  name === 'energy_level' ? 'Energija' : 'Raspoloženje'
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                formatter={(value) => value === 'energy_level' ? 'Energija' : 'Raspoloženje'}
              />
              <Line 
                type="monotone" 
                dataKey="energy_level" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                name="energy_level"
              />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="hsl(var(--accent-foreground))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--accent-foreground))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--accent-foreground))", strokeWidth: 2 }}
                name="mood"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}