import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { NAQScore } from "@/utils/naqScoringEngine";

interface NAQComparisonChartProps {
  currentScores: NAQScore[];
  previousScores?: NAQScore[];
  title?: string;
}

export function NAQComparisonChart({ 
  currentScores, 
  previousScores, 
  title = "Poređenje NAQ Rezultata" 
}: NAQComparisonChartProps) {
  const chartData = currentScores.map(currentScore => {
    const previousScore = previousScores?.find(
      prev => prev.sectionName === currentScore.sectionName
    );
    
    return {
      section: currentScore.sectionName.length > 15 
        ? currentScore.sectionName.substring(0, 15) + "..."
        : currentScore.sectionName,
      fullName: currentScore.sectionName,
      current: Math.round(currentScore.symptomBurden * 100),
      previous: previousScore ? Math.round(previousScore.symptomBurden * 100) : 0,
      change: previousScore 
        ? Math.round((currentScore.symptomBurden - previousScore.symptomBurden) * 100)
        : 0
    };
  });

  const chartConfig = {
    current: {
      label: "Trenutno",
      color: "hsl(var(--primary))",
    },
    previous: {
      label: "Prethodno",
      color: "hsl(var(--muted-foreground))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px]">
          <BarChart data={chartData} margin={{ bottom: 60 }}>
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name, entry) => {
                  const label = name === 'current' ? 'Trenutno' : 'Prethodno';
                  const change = entry.payload.change;
                  const changeText = change > 0 ? `↗ +${change}%` : change < 0 ? `↘ ${change}%` : '→ 0%';
                  return [
                    <>
                      {value}% ({label})
                      {name === 'current' && change !== 0 && (
                        <div className={`text-xs ${change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {changeText}
                        </div>
                      )}
                    </>,
                    entry.payload.fullName
                  ];
                }}
                labelFormatter={() => ""}
              />} 
            />
            <XAxis 
              dataKey="section" 
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 10 }}
            />
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Bar dataKey="previous" fill="hsl(var(--muted-foreground))" opacity={0.6} />
            <Bar dataKey="current" fill="hsl(var(--primary))" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}