import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown, Minus, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  insulin_sensitivity: string;
  muscle_potential: string;
  deficit_speed: string;
}

interface CalculationHistoryProps {
  clientId: string;
  onCompare: (calc1: Calculation, calc2: Calculation) => void;
  onViewDetails: (calc: Calculation) => void;
}

export default function CalculationHistory({ 
  clientId, 
  onCompare,
  onViewDetails 
}: CalculationHistoryProps) {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForComparison, setSelectedForComparison] = useState<Calculation[]>([]);

  useEffect(() => {
    fetchCalculations();
  }, [clientId]);

  const fetchCalculations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("energy_calculations")
        .select("*")
        .eq("client_id", clientId)
        .order("calculation_date", { ascending: false });

      if (error) throw error;
      setCalculations(data || []);
    } catch (error) {
      console.error("Error fetching calculations:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComparisonSelection = (calc: Calculation) => {
    if (selectedForComparison.find(c => c.id === calc.id)) {
      setSelectedForComparison(selectedForComparison.filter(c => c.id !== calc.id));
    } else if (selectedForComparison.length < 2) {
      setSelectedForComparison([...selectedForComparison, calc]);
    }
  };

  const handleCompare = () => {
    if (selectedForComparison.length === 2) {
      onCompare(selectedForComparison[0], selectedForComparison[1]);
      setSelectedForComparison([]);
    }
  };

  const getCalorieChange = (index: number) => {
    if (index === calculations.length - 1) return null;
    const current = calculations[index].recommended_calories;
    const previous = calculations[index + 1].recommended_calories;
    const diff = current - previous;
    const percentage = ((diff / previous) * 100).toFixed(1);
    return { diff, percentage };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Učitavanje historije...
        </CardContent>
      </Card>
    );
  }

  if (calculations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Još nema spremljenih kalkulacija.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {selectedForComparison.length === 2 && (
        <Card className="bg-primary/5 border-primary">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Odabrane 2 kalkulacije za usporedbu
              </p>
              <div className="flex gap-2">
                <Button onClick={handleCompare} size="sm">
                  Usporedi
                </Button>
                <Button 
                  onClick={() => setSelectedForComparison([])} 
                  variant="outline" 
                  size="sm"
                >
                  Odustani
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historija Kalkulacija ({calculations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {calculations.map((calc, index) => {
            const change = getCalorieChange(index);
            const isSelected = selectedForComparison.find(c => c.id === calc.id);

            return (
              <div
                key={calc.id}
                className={`p-4 rounded-lg border transition-colors ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">
                        {format(new Date(calc.calculation_date), "d. MMMM yyyy.", { locale: hr })}
                      </p>
                      {index === 0 && (
                        <Badge variant="default">Najnovija</Badge>
                      )}
                    </div>
                    {change && (
                      <div className="flex items-center gap-1 text-sm">
                        {change.diff > 0 ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-green-500">
                              +{change.diff.toFixed(0)} kcal ({change.percentage}%)
                            </span>
                          </>
                        ) : change.diff < 0 ? (
                          <>
                            <TrendingDown className="h-4 w-4 text-orange-500" />
                            <span className="text-orange-500">
                              {change.diff.toFixed(0)} kcal ({change.percentage}%)
                            </span>
                          </>
                        ) : (
                          <>
                            <Minus className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Bez promjene</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(calc)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => toggleComparisonSelection(calc)}
                      disabled={selectedForComparison.length >= 2 && !isSelected}
                    >
                      {isSelected ? "Odabrano" : "Odaberi"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">TDEE</p>
                    <p className="font-semibold">{calc.adaptive_tdee?.toFixed(0) || "-"} kcal</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Preporučene Kalorije</p>
                    <p className="font-semibold">{calc.recommended_calories.toFixed(0)} kcal</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Makro</p>
                    <p className="font-semibold">
                      {calc.protein_target_g.toFixed(0)}P / {calc.carbs_target_g.toFixed(0)}C / {calc.fat_target_g.toFixed(0)}F
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Deficit Speed</p>
                    <Badge variant="outline" className="text-xs">
                      {calc.deficit_speed || "moderate"}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
