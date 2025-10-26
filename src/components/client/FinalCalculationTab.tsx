import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Save, Apple, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { calculateOptimalCalories, OptimalCaloriesResult } from "@/utils/expertSystemCalculations";
import ExpertSystemRecommendations from "./ExpertSystemRecommendations";

interface FinalCalculationTabProps {
  clientId: string;
  clientGender: string | null;
  clientAge: number | null;
  onOpenNutritionPlanModal?: (prefilledData: any) => void;
}

export default function FinalCalculationTab({ 
  clientId, 
  clientGender, 
  clientAge,
  onOpenNutritionPlanModal 
}: FinalCalculationTabProps) {
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<OptimalCaloriesResult | null>(null);
  const [hasRequiredData, setHasRequiredData] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkDataAvailability();
  }, [clientId]);

  const checkDataAvailability = async () => {
    try {
      const [anthroRes, bioRes, psychoRes] = await Promise.all([
        supabase
          .from("client_anthropometric_data")
          .select("*")
          .eq("client_id", clientId)
          .order("measurement_date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("client_biochemical_data")
          .select("*")
          .eq("client_id", clientId)
          .order("measurement_date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("client_psychological_profile")
          .select("*")
          .eq("client_id", clientId)
          .order("calculated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const hasBasicData = anthroRes.data?.weight && anthroRes.data?.height && clientAge;
      setHasRequiredData(!!hasBasicData);

      // Check if there's already a saved calculation
      if (hasBasicData) {
        const { data: savedCalc } = await supabase
          .from("energy_calculations")
          .select("*")
          .eq("client_id", clientId)
          .order("calculation_date", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (savedCalc) {
          // Reconstruct result from saved calculation
          setResult({
            recommendedCalories: savedCalc.recommended_calories || 0,
            protein: savedCalc.protein_target_g || 0,
            carbs: savedCalc.carbs_target_g || 0,
            fats: savedCalc.fat_target_g || 0,
            dee: savedCalc.dee || 0,
            tef: savedCalc.tef_correction || 0,
            adaptiveTDEE: savedCalc.adaptive_tdee || 0,
            insulinSensitivity: savedCalc.insulin_sensitivity || "moderate",
            musclePotential: savedCalc.muscle_potential || "moderate",
            deficitSpeed: savedCalc.deficit_speed || "moderate",
            reasoning: savedCalc.reasoning as string[] || [],
          });
        }
      }
    } catch (error) {
      console.error("Error checking data availability:", error);
    }
  };

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const [anthroRes, bioRes, psychoRes, clientRes] = await Promise.all([
        supabase
          .from("client_anthropometric_data")
          .select("*")
          .eq("client_id", clientId)
          .order("measurement_date", { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("client_biochemical_data")
          .select("*")
          .eq("client_id", clientId)
          .order("measurement_date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("client_psychological_profile")
          .select("*")
          .eq("client_id", clientId)
          .order("calculated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("clients")
          .select("*")
          .eq("user_id", clientId)
          .single(),
      ]);

      if (!anthroRes.data || !clientGender || !clientAge) {
        throw new Error("Nedostaju osnovni podaci za izračun");
      }

      const anthro = anthroRes.data;
      const bio = bioRes.data;
      const psycho = psychoRes.data;

      const calculationResult = calculateOptimalCalories({
        weight: anthro.weight,
        height: anthro.height,
        age: clientAge,
        gender: clientGender as "male" | "female",
        lbm: anthro.lean_body_mass || undefined,
        bodyFat: anthro.body_fat_manual || anthro.body_fat_navy || undefined,
        waistCircumference: anthro.waist_circumference || undefined,
        wristCircumference: anthro.wrist_circumference || undefined,
        digitRatio: anthro.digit_ratio_2d4d || undefined,
        ggt: bio?.ggt || undefined,
        triglycerides: bio?.triglycerides || undefined,
        fastingGlucose: bio?.fasting_glucose || undefined,
        hba1c: bio?.hba1c || undefined,
        stressLevel: psycho?.stress_level as any || "moderate",
        motivationLevel: psycho?.motivation_level as any || "moderate",
        foodRelationshipScore: psycho?.food_relationship_score || 5,
        dietHistoryComplexity: psycho?.diet_history_complexity || 0,
        timeAvailabilityMinutes: psycho?.time_availability_minutes || 180,
        goal: "fat_loss",
        neatLevel: "moderate",
        exerciseMinutesPerWeek: 240,
      });

      setResult(calculationResult);
      
      toast({
        title: "Kalkulacija Uspješna",
        description: "Expert system je izračunao optimalne preporuke.",
      });
    } catch (error: any) {
      console.error("Error calculating:", error);
      toast({
        title: "Greška",
        description: error.message || "Dogodila se greška prilikom izračuna.",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleSaveCalculation = async () => {
    if (!result) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("energy_calculations")
        .insert({
          client_id: clientId,
          calculation_date: new Date().toISOString().split("T")[0],
          dee: result.dee,
          tef_correction: result.tef,
          adaptive_tdee: result.adaptiveTDEE,
          recommended_calories: result.recommendedCalories,
          protein_target_g: result.protein,
          carbs_target_g: result.carbs,
          fat_target_g: result.fats,
          insulin_sensitivity: result.insulinSensitivity,
          muscle_potential: result.musclePotential,
          deficit_speed: result.deficitSpeed,
          reasoning: result.reasoning,
          calculation_method: "expert_system_v2",
        });

      if (error) throw error;

      toast({
        title: "Spremljeno",
        description: "Kalkulacija je uspješno spremljena u bazu.",
      });
    } catch (error: any) {
      console.error("Error saving calculation:", error);
      toast({
        title: "Greška",
        description: "Nije moguće spremiti kalkulaciju.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNutritionPlan = () => {
    if (!result || !onOpenNutritionPlanModal) return;

    onOpenNutritionPlanModal({
      dailyCaloriesTarget: result.recommendedCalories,
      dailyProteinTarget: result.protein,
      dailyCarbsTarget: result.carbs,
      dailyFatsTarget: result.fats,
    });
  };

  if (!hasRequiredData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">
            Nedostaju osnovni podaci za Expert System kalkulaciju.
          </p>
          <p className="text-sm text-muted-foreground">
            Potrebni su: Težina, Visina, i Dob klijenta.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calculate Button */}
      {!result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Expert System Kalkulacija
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Expert System će analizirati sve prikupljene podatke (antropometrijske, biokemijske, psihološke) i izračunati optimalne preporuke za kalorije i makronutrijente.
            </p>
            <Button 
              onClick={handleCalculate} 
              disabled={calculating}
              className="w-full"
            >
              {calculating ? "Izračunavanje..." : "Izračunaj Optimalne Preporuke"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <>
          <ExpertSystemRecommendations result={result} />

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <Button 
              onClick={handleSaveCalculation} 
              disabled={saving}
              variant="outline"
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Spremanje..." : "Spremi Kalkulaciju u Bazu"}
            </Button>
            <Button 
              onClick={handleCreateNutritionPlan}
              className="w-full"
            >
              <Apple className="h-4 w-4 mr-2" />
              Kreiraj Plan Prehrane
            </Button>
          </div>

          {/* Recalculate Button */}
          <Button 
            onClick={handleCalculate} 
            disabled={calculating}
            variant="secondary"
            className="w-full"
          >
            {calculating ? "Re-Kalkuliranje..." : "Re-Kalkuliraj Preporuke"}
          </Button>
        </>
      )}
    </div>
  );
}
