import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calculator, Flame, Zap, Activity, Utensils } from "lucide-react";
import { calculateREE } from "@/utils/anthropometricCalculations";

interface EnergyCalculationTabProps {
  clientGender: string | null;
  latestWeight: number | null;
  latestHeight: number | null;
  latestLBM: number | null;
  clientAge: number | null;
}

export default function EnergyCalculationTabSimplified({
  clientGender,
  latestWeight,
  latestHeight,
  latestLBM,
  clientAge,
}: EnergyCalculationTabProps) {
  const [weight, setWeight] = useState(latestWeight?.toString() || "");
  const [height, setHeight] = useState(latestHeight?.toString() || "");
  const [age, setAge] = useState(clientAge?.toString() || "");
  const [lbm, setLbm] = useState(latestLBM?.toString() || "");

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

  // REE Formula
  const calculateREEFormula = (): number | null => {
    if (!weight || !height || !age || !clientGender) return null;
    
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    
    return calculateREE(w, h, a, clientGender as 'male' | 'female');
  };

  const bmr1 = calculateHarrisBenedict();
  const bmr2 = calculateMifflinStJeor();
  const bmr3 = calculateKatchMcArdle();
  const bmr4 = calculateREEFormula();

  const averageBMR = [bmr1, bmr2, bmr3, bmr4].filter(v => v !== null).length > 0
    ? [bmr1, bmr2, bmr3, bmr4].filter(v => v !== null).reduce((a, b) => a! + b!, 0)! / 
      [bmr1, bmr2, bmr3, bmr4].filter(v => v !== null).length
    : null;

  // Calculate TEF, NEAT, EA
  const calculateTEF = (): number | null => {
    if (!averageBMR) return null;
    // TEF is approximately 10% of total caloric intake (estimated from BMR * 1.2)
    return Math.round((averageBMR * 1.2) * 0.10);
  };

  const calculateNEAT = (): number | null => {
    if (!averageBMR) return null;
    // NEAT varies widely, estimating ~15-30% of BMR for sedentary to moderate activity
    // Using 20% as middle ground
    return Math.round(averageBMR * 0.20);
  };

  const calculateEA = (): number | null => {
    if (!averageBMR) return null;
    // Exercise Activity varies greatly, estimating ~10-25% of BMR
    // Using 15% as moderate exercise estimate
    return Math.round(averageBMR * 0.15);
  };

  const tef = calculateTEF();
  const neat = calculateNEAT();
  const ea = calculateEA();

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
        </CardContent>
      </Card>

      {/* BMR Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            BMR - Bazalni Metabolizam (4 formule)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Harris-Benedict</p>
              <p className="text-xl font-bold">{bmr1 ? Math.round(bmr1) : '-'}</p>
              <p className="text-xs text-muted-foreground">kcal/dan</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Mifflin-St Jeor</p>
              <p className="text-xl font-bold">{bmr2 ? Math.round(bmr2) : '-'}</p>
              <p className="text-xs text-muted-foreground">kcal/dan</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Katch-McArdle</p>
              <p className="text-xl font-bold">{bmr3 ? Math.round(bmr3) : '-'}</p>
              <p className="text-xs text-muted-foreground">kcal/dan</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">REE Formula</p>
              <p className="text-xl font-bold">{bmr4 ? Math.round(bmr4) : '-'}</p>
              <p className="text-xs text-muted-foreground">kcal/dan</p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg border-2 border-primary">
              <p className="text-xs text-muted-foreground mb-1">Prosjek</p>
              <p className="text-2xl font-bold text-primary">{averageBMR ? Math.round(averageBMR) : '-'}</p>
              <p className="text-xs text-muted-foreground">kcal/dan</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Energy Components */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TEF Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Utensils className="h-4 w-4 text-blue-500" />
              TEF
            </CardTitle>
            <p className="text-xs text-muted-foreground">Thermic Effect of Food</p>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {tef ? `${tef} kcal` : '-'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">~10% ukupnog unosa</p>
            </div>
          </CardContent>
        </Card>

        {/* NEAT Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-green-500" />
              NEAT
            </CardTitle>
            <p className="text-xs text-muted-foreground">Non-Exercise Activity</p>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {neat ? `${neat} kcal` : '-'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">~20% BMR</p>
            </div>
          </CardContent>
        </Card>

        {/* EA Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-yellow-500" />
              EA
            </CardTitle>
            <p className="text-xs text-muted-foreground">Exercise Activity</p>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {ea ? `${ea} kcal` : '-'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">~15% BMR</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {!weight || !height || !age ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Unesite težinu, visinu i dob za izračun energetskih potreba.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
