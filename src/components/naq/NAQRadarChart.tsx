import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { NAQScore } from "@/utils/naqScoringEngine";

interface NAQRadarChartProps {
  scores: NAQScore[];
  title?: string;
}

export function NAQRadarChart({ scores, title = "NAQ Pregled po Sekcijama" }: NAQRadarChartProps) {
  const chartData = scores.map(score => ({
    section: score.sectionName.replace(/\s+/g, '\n'),
    value: Math.round(score.symptomBurden * 100),
    fullName: score.sectionName,
    priority: score.priorityLevel
  }));

  const chartConfig = {
    value: {
      label: "Simptomatski Teret (%)",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[400px]">
          <RadarChart data={chartData}>
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name, entry) => [
                  `${value}%`,
                  `${entry.payload.fullName}`
                ]}
                labelFormatter={() => ""}
              />} 
            />
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis 
              dataKey="section" 
              tick={{ fontSize: 10, textAnchor: 'middle' }}
              className="text-xs"
            />
            <PolarRadiusAxis 
              angle={0} 
              domain={[0, 100]} 
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `${value}%`}
            />
            <Radar
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}