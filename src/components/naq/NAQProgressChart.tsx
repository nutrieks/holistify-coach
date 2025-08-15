import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface NAQProgressData {
  submissionId: string;
  submissionDate: string;
  questionnaireName: string;
  scores: {
    sectionName: string;
    totalScore: number;
    maxPossibleScore: number;
    symptomBurden: number;
    priorityLevel: 'low' | 'medium' | 'high';
  }[];
}

interface NAQProgressChartProps {
  data: NAQProgressData[];
  sectionName?: string;
  title?: string;
}

export function NAQProgressChart({ 
  data, 
  sectionName = "Ukupni Teret", 
  title 
}: NAQProgressChartProps) {
  const chartData = data.map((submission, index) => {
    if (sectionName === "Ukupni Teret") {
      // Calculate overall burden
      const totalQuestions = submission.scores.reduce((sum, score) => sum + (score.maxPossibleScore / 3), 0);
      const totalScore = submission.scores.reduce((sum, score) => sum + score.totalScore, 0);
      const overallBurden = totalScore / totalQuestions;
      
      return {
        date: submission.submissionDate,
        value: Math.round(overallBurden * 100),
        submission: index + 1,
        formattedDate: format(new Date(submission.submissionDate), 'dd.MM.yyyy')
      };
    } else {
      // Find specific section
      const section = submission.scores.find(s => s.sectionName === sectionName);
      return {
        date: submission.submissionDate,
        value: section ? Math.round(section.symptomBurden * 100) : 0,
        submission: index + 1,
        formattedDate: format(new Date(submission.submissionDate), 'dd.MM.yyyy')
      };
    }
  }).reverse(); // Show chronological order

  const chartConfig = {
    value: {
      label: sectionName,
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          {title || `Napredak - ${sectionName}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px]">
          <LineChart data={chartData}>
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value) => [`${value}%`, sectionName]}
                labelFormatter={(label, payload) => 
                  payload?.[0]?.payload?.formattedDate || label
                }
              />} 
            />
            <XAxis 
              dataKey="submission" 
              tickFormatter={(value) => `#${value}`}
            />
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}