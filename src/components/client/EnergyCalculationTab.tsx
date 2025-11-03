import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, Flame, TrendingUp, TrendingDown, Activity, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateIdealBodyWeight, calculateAdjustedWeight, calculateREE } from "@/utils/anthropometricCalculations";
import MetabolicDataTab from "./MetabolicDataTab";
import PsychologicalDataTab from "./PsychologicalDataTab";
import DailyTrackingTab from "./DailyTrackingTab";
import { ProjectionsTab } from "./ProjectionsTab";
import FinalCalculationTab from "./FinalCalculationTab";

interface EnergyCalculationTabProps {
  clientId: string;
  clientGender: string | null;
  latestWeight: number | null;
  latestHeight: number | null;
  latestLBM: number | null;
  clientAge: number | null;
  clientDetails?: {
    first_name?: string | null;
    last_name?: string | null;
  };
  onOpenNutritionPlanModal?: (prefilledData: any) => void;
}

export default function EnergyCalculationTab({
  clientId,
  clientGender,
  latestWeight,
  latestHeight,
  latestLBM,
  clientAge,
  clientDetails,
  onOpenNutritionPlanModal,
}: EnergyCalculationTabProps) {
  const [weight, setWeight] = useState(latestWeight?.toString() || "");
  const [height, setHeight] = useState(latestHeight?.toString() || "");
  const [age, setAge] = useState(clientAge?.toString() || "");
  const [lbm, setLbm] = useState(latestLBM?.toString() || "");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [goal, setGoal] = useState("maintain");
  const [expertSystemCalories, setExpertSystemCalories] = useState<number | null>(null);

  useEffect(() => {
    if (latestWeight) setWeight(latestWeight.toString());
    if (latestHeight) setHeight(latestHeight.toString());
    if (latestLBM) setLbm(latestLBM.toString());
    if (clientAge) setAge(clientAge.toString());
  }, [latestWeight, latestHeight, latestLBM, clientAge]);

  // Harris-Benedict Formula
  const calculateHarrisBenedict = (): number | null => {
    if (!weight || !height || !age) return null;
    
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    
    if (clientGender === 'male') {
      return 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
    } else {
      return 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    }
  };

  // Mifflin-St Jeor Formula
  const calculateMifflinStJeor = (): number | null => {
    if (!weight || !height || !age) return null;
    
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    
    if (clientGender === 'male') {
      return (10 * w) + (6.25 * h) - (5 * a) + 5;
    } else {
      return (10 * w) + (6.25 * h) - (5 * a) - 161;
    }
  };

  // Katch-McArdle Formula (uses LBM)
  const calculateKatchMcArdle = (): number | null => {
    if (!lbm) return null;
    const l = parseFloat(lbm);
    return 370 + (21.6 * l);
  };

  // REE Formula (uses Adjusted Weight)
  const calculateREEFormula = (): number | null => {
    if (!weight || !height || !age || !clientGender) return null;
    
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    
    return calculateREE(w, h, a, clientGender as 'male' | 'female');
  };

  const activityMultipliers: Record<string, { value: number; label: string }> = {
    sedentary: { value: 1.2, label: "Sjedilački (malo ili bez vježbanja)" },
    light: { value: 1.375, label: "Lagana aktivnost (vježbanje 1-3 dana/tjedan)" },
    moderate: { value: 1.55, label: "Umjerena aktivnost (vježbanje 3-5 dana/tjedan)" },
    active: { value: 1.725, label: "Visoka aktivnost (vježbanje 6-7 dana/tjedan)" },
    veryActive: { value: 1.9, label: "Ekstremna aktivnost (fizički zahtjevan posao + vježbanje)" },
  };

  const goalAdjustments: Record<string, { value: number; label: string; description: string }> = {
    deficit: { value: -500, label: "Gubitak težine", description: "-500 kcal (deficit za gubitak ~0.5kg/tjedan)" },
    maintain: { value: 0, label: "Održavanje težine", description: "Bez kaloriskog deficita/suficita" },
    surplus: { value: 300, label: "Povećanje težine", description: "+300 kcal (suficit za povećanje ~0.3kg/tjedan)" },
  };

  const bmr1 = calculateHarrisBenedict();
  const bmr2 = calculateMifflinStJeor();
  const bmr3 = calculateKatchMcArdle();
  const bmr4 = calculateREEFormula();
  
  const tdee1 = bmr1 ? bmr1 * activityMultipliers[activityLevel].value : null;
  const tdee2 = bmr2 ? bmr2 * activityMultipliers[activityLevel].value : null;
  const tdee3 = bmr3 ? bmr3 * activityMultipliers[activityLevel].value : null;
  const tdee4 = bmr4 ? bmr4 * activityMultipliers[activityLevel].value : null;

  const target1 = tdee1 ? tdee1 + goalAdjustments[goal].value : null;
  const target2 = tdee2 ? tdee2 + goalAdjustments[goal].value : null;
  const target3 = tdee3 ? tdee3 + goalAdjustments[goal].value : null;
  const target4 = tdee4 ? tdee4 + goalAdjustments[goal].value : null;

  const averageTDEE = [tdee1, tdee2, tdee3, tdee4].filter(v => v !== null).length > 0
    ? [tdee1, tdee2, tdee3, tdee4].filter(v => v !== null).reduce((a, b) => a! + b!, 0)! / 
      [tdee1, tdee2, tdee3, tdee4].filter(v => v !== null).length
    : null;

  const averageTarget = averageTDEE ? averageTDEE + goalAdjustments[goal].value : null;

  // Calculate IBW and Adjusted Weight for display
  const ibw = weight && height && clientGender 
    ? calculateIdealBodyWeight(parseFloat(height), clientGender as 'male' | 'female')
    : null;
  const adjustedWeight = weight && height && clientGender
    ? calculateAdjustedWeight(parseFloat(weight), parseFloat(height), clientGender as 'male' | 'female')
    : null;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Unos Podataka
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Težina (kg) *</Label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="75"
                min="30"
                max="300"
                step="0.1"
              />
            </div>
            <div>
              <Label>Visina (cm) *</Label>
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                min="100"
                max="250"
                step="0.1"
              />
            </div>
            <div>
              <Label>Dob (godine) *</Label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="30"
                min="15"
                max="100"
              />
            </div>
            <div>
              <Label>LBM (kg) - Za Katch-McArdle</Label>
              <Input
                type="number"
                value={lbm}
                onChange={(e) => setLbm(e.target.value)}
                placeholder="60"
                min="20"
                max="200"
                step="0.1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Razina Aktivnosti</Label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(activityMultipliers).map(([key, { value, label }]) => (
                    <SelectItem key={key} value={key}>
                      {label} (×{value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Cilj</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(goalAdjustments).map(([key, { label, description }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {goalAdjustments[goal].description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section with 5 Tabs */}
      <Tabs defaultValue="osnovno" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="osnovno">Osnovno</TabsTrigger>
          <TabsTrigger value="metabolicko">Metaboličko</TabsTrigger>
          <TabsTrigger value="psiholosko">Psihološko</TabsTrigger>
          <TabsTrigger value="tracking">Praćenje</TabsTrigger>
          <TabsTrigger value="projekcije">Projekcije</TabsTrigger>
          <TabsTrigger value="finalno">Finalni Unos</TabsTrigger>
        </TabsList>

        {/* Tab 1: Osnovno - DEE Model + Formule */}
        <TabsContent value="osnovno" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>DEE Model (Dynamic Energy Expenditure)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Prosječni BMR izračunat iz više formula za veću točnost
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Harris-Benedict</p>
                  <p className="text-xl font-bold">{bmr1 ? Math.round(bmr1) : '-'}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Mifflin-St Jeor</p>
                  <p className="text-xl font-bold">{bmr2 ? Math.round(bmr2) : '-'}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Katch-McArdle</p>
                  <p className="text-xl font-bold">{bmr3 ? Math.round(bmr3) : '-'}</p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Prosječni DEE</p>
                  <p className="text-xl font-bold text-primary">
                    {[bmr1, bmr2, bmr3].filter(v => v !== null).length > 0
                      ? Math.round([bmr1, bmr2, bmr3].filter(v => v !== null).reduce((a, b) => a! + b!, 0)! / 
                        [bmr1, bmr2, bmr3].filter(v => v !== null).length)
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Harris-Benedict */}
          <Card>
            <CardHeader>
              <CardTitle>Harris-Benedict Formula</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tradicionalna formula bazirana na težini, visini, dobi i spolu
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">BMR</p>
                  <p className="text-2xl font-bold">{bmr1 ? Math.round(bmr1) : '-'} kcal</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">TDEE</p>
                  <p className="text-2xl font-bold">{tdee1 ? Math.round(tdee1) : '-'} kcal</p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Cilj</p>
                  <p className="text-2xl font-bold text-primary">{target1 ? Math.round(target1) : '-'} kcal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mifflin-St Jeor */}
          <Card>
            <CardHeader>
              <CardTitle>Mifflin-St Jeor Formula</CardTitle>
              <p className="text-sm text-muted-foreground">
                Modernija i često točnija formula za prosječnu populaciju
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">BMR</p>
                  <p className="text-2xl font-bold">{bmr2 ? Math.round(bmr2) : '-'} kcal</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">TDEE</p>
                  <p className="text-2xl font-bold">{tdee2 ? Math.round(tdee2) : '-'} kcal</p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Cilj</p>
                  <p className="text-2xl font-bold text-primary">{target2 ? Math.round(target2) : '-'} kcal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Katch-McArdle */}
          <Card>
            <CardHeader>
              <CardTitle>Katch-McArdle Formula</CardTitle>
              <p className="text-sm text-muted-foreground">
                Formula bazirana na nemasnoj tjelesnoj masi (LBM) - najtočnija za sportaše
              </p>
            </CardHeader>
            <CardContent>
              {lbm ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">BMR</p>
                    <p className="text-2xl font-bold">{bmr3 ? Math.round(bmr3) : '-'} kcal</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">TDEE</p>
                    <p className="text-2xl font-bold">{tdee3 ? Math.round(tdee3) : '-'} kcal</p>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Cilj</p>
                    <p className="text-2xl font-bold text-primary">{target3 ? Math.round(target3) : '-'} kcal</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Unesite LBM (nemasnu tjelesnu masu) za ovu formulu.</p>
                  <p className="text-xs mt-2">LBM možete dobiti iz antropometrijskih podataka.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* REE Formula */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                REE Formula (Adjusted Weight)
                <Badge variant="secondary" className="ml-auto">
                  <Info className="h-3 w-3 mr-1" />
                  Preporučeno
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Napredna formula koja koristi prilagođenu težinu - idealna za osobe izvan idealne težine
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {bmr4 ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                      <p className="text-xs text-muted-foreground">Idealna Težina (IBW)</p>
                      <p className="text-lg font-bold text-blue-600">{ibw ? Math.round(ibw) : '-'} kg</p>
                    </div>
                    <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                      <p className="text-xs text-muted-foreground">Prilagođena Težina</p>
                      <p className="text-lg font-bold text-purple-600">
                        {adjustedWeight ? Math.round(adjustedWeight) : '-'} kg
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">REE</p>
                      <p className="text-2xl font-bold">{Math.round(bmr4)} kcal</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">TDEE</p>
                      <p className="text-2xl font-bold">{tdee4 ? Math.round(tdee4) : '-'} kcal</p>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Cilj</p>
                      <p className="text-2xl font-bold text-primary">{target4 ? Math.round(target4) : '-'} kcal</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Svi osnovni podaci su potrebni za REE izračun.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Metaboličko - Placeholder for Sprint 3 */}
        <TabsContent value="metabolicko" className="space-y-4">
          <Card>
            <CardContent className="py-12 text-center">
              <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Metaboličko Zdravlje</h3>
              <p className="text-muted-foreground">
                Analiza inzulinske osjetljivosti, metaboličke fleksibilnosti i potencijala za mišićnu masu.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Ova sekcija će biti dostupna u sljedećem sprinta nakon unosa biokemijskih podataka.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Psihološko */}
        <TabsContent value="psiholosko" className="space-y-4">
          <PsychologicalDataTab clientId={clientId} />
        </TabsContent>

        {/* Tab 4: Dnevno Praćenje (FAZA 2) */}
        <TabsContent value="tracking" className="space-y-4">
          <DailyTrackingTab clientId={clientId} />
        </TabsContent>

        {/* Tab 5: Projekcije (FAZA 3) */}
        <TabsContent value="projekcije" className="space-y-4">
          <ProjectionsTab 
            clientId={clientId} 
            targetCalories={expertSystemCalories || averageTarget || 2000} 
          />
        </TabsContent>

        {/* Tab 6: Finalni Unos - Expert System */}
        <TabsContent value="finalno" className="space-y-4">
          <FinalCalculationTab
            clientId={clientId}
            clientGender={clientGender}
            clientAge={clientAge}
            clientDetails={clientDetails}
            onOpenNutritionPlanModal={onOpenNutritionPlanModal}
            onCalculationComplete={(recommendedCalories) => setExpertSystemCalories(recommendedCalories)}
          />
        </TabsContent>

        {/* Tab 7: Osnovna Formula Summary (premješteno) */}
        <TabsContent value="osnovna-formula" className="space-y-4">
          {averageTDEE && averageTarget ? (
            <>
              {/* Average TDEE Card */}
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      Preporučeni Dnevni Unos
                    </span>
                    <Badge variant="default" className="text-lg px-4 py-1">
                      {Math.round(averageTarget)} kcal
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">TDEE (Održavanje)</p>
                      <p className="text-2xl font-bold">{Math.round(averageTDEE)} kcal</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Prosječno iz {[tdee1, tdee2, tdee3, tdee4].filter(v => v !== null).length} formule
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Ciljna Kalorija</p>
                      <p className="text-2xl font-bold flex items-center gap-2">
                        {Math.round(averageTarget)} kcal
                        {goal === 'deficit' && <TrendingDown className="h-5 w-5 text-green-500" />}
                        {goal === 'surplus' && <TrendingUp className="h-5 w-5 text-blue-500" />}
                        {goal === 'maintain' && <Activity className="h-5 w-5 text-primary" />}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {goalAdjustments[goal].label}
                      </p>
                    </div>
                  </div>

                  {/* Macronutrient Recommendations */}
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Preporučena Raspodjela Makronutrijenata</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Proteini</p>
                        <p className="text-xl font-bold text-blue-600">
                          {weight ? Math.round(parseFloat(weight) * 2.2) : '-'}g
                        </p>
                        <p className="text-xs text-muted-foreground">~2.2g/kg</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Masti</p>
                        <p className="text-xl font-bold text-yellow-600">
                          {weight ? Math.round(parseFloat(weight) * 1) : '-'}g
                        </p>
                        <p className="text-xs text-muted-foreground">~1g/kg</p>
                      </div>
                      <div className="text-center p-3 bg-green-500/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Ugljikohidrati</p>
                        <p className="text-xl font-bold text-green-600">
                          {weight && averageTarget 
                            ? Math.round((averageTarget - (parseFloat(weight) * 2.2 * 4) - (parseFloat(weight) * 1 * 9)) / 4)
                            : '-'}g
                        </p>
                        <p className="text-xs text-muted-foreground">Preostale kalorije</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Unesite težinu, visinu i dob za izračun energetskih potreba.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
