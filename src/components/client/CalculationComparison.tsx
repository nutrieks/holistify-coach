import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { hr } from "date-fns/locale";

interface Calculation {
  id: string;
  calculation_date: string;
  recommended_calories: number;
  protein_target_g: number;
  carbs_target_g: number;
  fat_target_g: number;
  adaptive_tdee: number;
  dee: number;
  tef_correction: number;
  insulin_sensitivity: string;
  muscle_potential: string;
  deficit_speed: string;
}

interface CalculationComparisonProps {
  calculation1: Calculation;
  calculation2: Calculation;
  onClose: () => void;
}

export default function CalculationComparison({
  calculation1,
  calculation2,
  onClose,
}: CalculationComparisonProps) {
  const getDifference = (val1: number, val2: number) => {
    const diff = val1 - val2;
    const percentage = val2 !== 0 ? ((diff / val2) * 100).toFixed(1) : "0";
    return { diff, percentage };
  };

  const renderDiffIndicator = (diff: number) => {
    if (diff > 0) {
      return (
        <div className="flex items-center gap-1 text-green-500 text-sm">
          <TrendingUp className="h-4 w-4" />
          <span>+{diff.toFixed(0)}</span>
        </div>
      );
    } else if (diff < 0) {
      return (
        <div className="flex items-center gap-1 text-orange-500 text-sm">
          <TrendingDown className="h-4 w-4" />
          <span>{diff.toFixed(0)}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <Minus className="h-4 w-4" />
          <span>0</span>
        </div>
      );
    }
  };

  const renderComparisonRow = (label: string, val1: number, val2: number, unit: string = "") => {
    const { diff, percentage } = getDifference(val1, val2);
    return (
      <div className="py-3 border-b last:border-0">
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="text-right">
            <p className="font-semibold">{val1.toFixed(0)} {unit}</p>
          </div>
          <div className="flex flex-col items-center">
            {renderDiffIndicator(diff)}
            {diff !== 0 && (
              <span className="text-xs text-muted-foreground">({percentage}%)</span>
            )}
          </div>
          <div className="text-left">
            <p className="font-semibold">{val2.toFixed(0)} {unit}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTextComparisonRow = (label: string, val1: string, val2: string) => {
    const isDifferent = val1 !== val2;
    return (
      <div className="py-3 border-b last:border-0">
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="text-right">
            <Badge variant={isDifferent ? "default" : "outline"} className="text-xs">
              {val1 || "N/A"}
            </Badge>
          </div>
          <div className="flex items-center justify-center">
            {isDifferent ? (
              <span className="text-xs text-orange-500">Promijenilo se</span>
            ) : (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="text-left">
            <Badge variant={isDifferent ? "default" : "outline"} className="text-xs">
              {val2 || "N/A"}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Usporedba Kalkulacija</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Headers */}
        <div className="grid grid-cols-3 gap-4 pb-4 border-b">
          <div className="text-right">
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className="mb-1">Kalkulacija 1</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(calculation1.calculation_date), "d. MMM yyyy.", { locale: hr })}
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Razlika</p>
          </div>
          <div className="text-left">
            <div className="flex flex-col items-start gap-1">
              <Badge variant="outline" className="mb-1">Kalkulacija 2</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(calculation2.calculation_date), "d. MMM yyyy.", { locale: hr })}
              </div>
            </div>
          </div>
        </div>

        {/* Energy Metrics */}
        <div>
          <h3 className="font-semibold mb-3">Energetske Metrike</h3>
          {renderComparisonRow("DEE (Daily Energy Expenditure)", calculation1.dee || 0, calculation2.dee || 0, "kcal")}
          {renderComparisonRow("TEF Korekcija", calculation1.tef_correction || 0, calculation2.tef_correction || 0, "kcal")}
          {renderComparisonRow("Adaptive TDEE", calculation1.adaptive_tdee || 0, calculation2.adaptive_tdee || 0, "kcal")}
          {renderComparisonRow("Preporučene Kalorije", calculation1.recommended_calories, calculation2.recommended_calories, "kcal")}
        </div>

        {/* Macronutrients */}
        <div>
          <h3 className="font-semibold mb-3">Makronutrijenti</h3>
          {renderComparisonRow("Proteini", calculation1.protein_target_g, calculation2.protein_target_g, "g")}
          {renderComparisonRow("Ugljikohidrati", calculation1.carbs_target_g, calculation2.carbs_target_g, "g")}
          {renderComparisonRow("Masti", calculation1.fat_target_g, calculation2.fat_target_g, "g")}
        </div>

        {/* Parameters */}
        <div>
          <h3 className="font-semibold mb-3">Parametri</h3>
          {renderTextComparisonRow("Insulin Sensitivity", calculation1.insulin_sensitivity || "N/A", calculation2.insulin_sensitivity || "N/A")}
          {renderTextComparisonRow("Muscle Potential", calculation1.muscle_potential || "N/A", calculation2.muscle_potential || "N/A")}
          {renderTextComparisonRow("Deficit Speed", calculation1.deficit_speed || "N/A", calculation2.deficit_speed || "N/A")}
        </div>

        {/* Summary */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 text-sm">Sažetak Promjena</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            {(() => {
              const caloriesDiff = calculation1.recommended_calories - calculation2.recommended_calories;
              const proteinDiff = calculation1.protein_target_g - calculation2.protein_target_g;
              
              return (
                <>
                  <p>
                    • Kalorije su se {caloriesDiff > 0 ? "povećale" : caloriesDiff < 0 ? "smanjile" : "nisu promijenile"} za {Math.abs(caloriesDiff).toFixed(0)} kcal
                  </p>
                  <p>
                    • Proteini su se {proteinDiff > 0 ? "povećali" : proteinDiff < 0 ? "smanjili" : "nisu promijenili"} za {Math.abs(proteinDiff).toFixed(0)}g
                  </p>
                  {calculation1.deficit_speed !== calculation2.deficit_speed && (
                    <p>
                      • Brzina deficita promijenjena iz "{calculation2.deficit_speed}" u "{calculation1.deficit_speed}"
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
