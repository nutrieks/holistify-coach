import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, Flame, Target } from "lucide-react";
import { OptimalCaloriesResult } from "@/utils/expertSystemCalculations";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import ExpertSystemPDFExport from "./ExpertSystemPDFExport";

interface ExpertSystemRecommendationsProps {
  result: OptimalCaloriesResult;
  clientName?: string;
}

export default function ExpertSystemRecommendations({ result, clientName = "Klijent" }: ExpertSystemRecommendationsProps) {
  const macroData = [
    { name: "Protein", value: result.protein * 4, color: "#ef4444" },
    { name: "Carbs", value: result.carbs * 4, color: "#3b82f6" },
    { name: "Fats", value: result.fats * 9, color: "#f59e0b" },
  ];

  const macroPercentages = {
    protein: ((result.protein * 4) / result.recommendedCalories * 100).toFixed(0),
    carbs: ((result.carbs * 4) / result.recommendedCalories * 100).toFixed(0),
    fats: ((result.fats * 9) / result.recommendedCalories * 100).toFixed(0),
  };

  return (
    <div className="space-y-6">
      {/* Main Recommendation Card */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Target className="h-6 w-6" />
            Finalne Preporuke
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Numbers */}
            <div className="space-y-4">
              <div className="text-center p-6 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Adaptive TDEE</p>
                <p className="text-4xl font-bold text-primary">
                  {Math.round(result.adaptiveTDEE)}
                </p>
                <p className="text-sm text-muted-foreground">kcal/dan</p>
              </div>

              <div className="text-center p-6 bg-green-500/10 rounded-lg border-2 border-green-500/50">
                <p className="text-sm text-muted-foreground mb-2">Preporučene Kalorije</p>
                <p className="text-5xl font-bold text-green-600">
                  {Math.round(result.recommendedCalories)}
                </p>
                <p className="text-sm text-muted-foreground">kcal/dan</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 bg-red-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="text-xl font-bold text-red-600">{Math.round(result.protein)}g</p>
                  <p className="text-xs text-muted-foreground">{macroPercentages.protein}%</p>
                </div>
                <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Carbs</p>
                  <p className="text-xl font-bold text-blue-600">{Math.round(result.carbs)}g</p>
                  <p className="text-xs text-muted-foreground">{macroPercentages.carbs}%</p>
                </div>
                <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Fats</p>
                  <p className="text-xl font-bold text-yellow-600">{Math.round(result.fats)}g</p>
                  <p className="text-xs text-muted-foreground">{macroPercentages.fats}%</p>
                </div>
              </div>
            </div>

            {/* Right: Chart */}
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intermediate Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Detalji Kalkulacije
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">DEE</p>
              <p className="text-xl font-bold">{Math.round(result.dee)}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">TEF</p>
              <p className="text-xl font-bold">{Math.round(result.tef)}</p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground">Adaptive TDEE</p>
              <p className="text-xl font-bold text-primary">{Math.round(result.adaptiveTDEE)}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Insulin Sensitivity</p>
              <Badge className="mt-2">{result.insulinSensitivity.toUpperCase()}</Badge>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Muscle Potential</p>
              <Badge className="mt-2">{result.musclePotential.toUpperCase()}</Badge>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Deficit Speed</p>
              <Badge className="mt-2">{result.deficitSpeed.toUpperCase()}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reasoning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Razlozi za Preporuke
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.reasoning.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{reason}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* PDF Export */}
      <ExpertSystemPDFExport result={result} clientName={clientName} />
    </div>
  );
}
