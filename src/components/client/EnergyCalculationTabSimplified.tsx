import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Calculator, Flame, Utensils, Activity, Zap } from "lucide-react";

interface EnergyCalculationTabProps {
  clientId: string;
}

export default function EnergyCalculationTabSimplified({ clientId }: EnergyCalculationTabProps) {
  // Fetch client data
  const { data: clientData, isLoading } = useQuery({
    queryKey: ['client-energy-data', clientId],
    queryFn: async () => {
      // Get client info
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('gender, date_of_birth')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      // Get latest anthropometric data
      const { data: anthro, error: anthroError } = await supabase
        .from('client_anthropometric_data')
        .select('weight, height, lean_body_mass')
        .eq('client_id', clientId)
        .order('measurement_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (anthroError) throw anthroError;

      // Calculate age from date_of_birth
      let age = null;
      if (client.date_of_birth) {
        const birthDate = new Date(client.date_of_birth);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      return {
        gender: client.gender,
        age,
        weight: anthro?.weight || null,
        height: anthro?.height || null,
        lbm: anthro?.lean_body_mass || null
      };
    },
    enabled: !!clientId
  });

  if (isLoading) {
    return <div className="text-center py-8">Učitavanje...</div>;
  }

  const weightNum = clientData?.weight || 0;
  const heightNum = clientData?.height || 0;
  const ageNum = clientData?.age || 0;
  const lbmNum = clientData?.lbm || 0;
  const gender = clientData?.gender;

  const hasRequiredData = !!(weightNum && heightNum && ageNum && gender);

  const calculateHarrisBenedict = () => {
    if (!gender || !weightNum || !heightNum || !ageNum) return 0;
    
    if (gender === 'male') {
      return 88.362 + (13.397 * weightNum) + (4.799 * heightNum) - (5.677 * ageNum);
    } else {
      return 447.593 + (9.247 * weightNum) + (3.098 * heightNum) - (4.330 * ageNum);
    }
  };

  const calculateMifflinStJeor = () => {
    if (!gender || !weightNum || !heightNum || !ageNum) return 0;
    
    if (gender === 'male') {
      return (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) + 5;
    } else {
      return (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) - 161;
    }
  };

  const calculateKatchMcArdle = () => {
    if (!lbmNum) return 0;
    return 370 + (21.6 * lbmNum);
  };

  const calculateREEFormula = () => {
    if (!weightNum) return 0;
    return 293 + (25 * weightNum);
  };

  const harrisBenedict = calculateHarrisBenedict();
  const mifflinStJeor = calculateMifflinStJeor();
  const katchMcArdle = calculateKatchMcArdle();
  const reeFormula = calculateREEFormula();

  // Average BMR (excluding Katch-McArdle if LBM is not available)
  const validBMRs = [harrisBenedict, mifflinStJeor, reeFormula].filter(bmr => bmr > 0);
  if (lbmNum > 0) validBMRs.push(katchMcArdle);
  
  const averageBMR = validBMRs.length > 0 
    ? validBMRs.reduce((a, b) => a + b, 0) / validBMRs.length 
    : 0;

  // Calculate TEF, NEAT, EA, TDEE based on average BMR
  const tef = averageBMR * 0.10; // 10% of BMR
  const neat = averageBMR * 0.15; // 15% of BMR
  const ea = averageBMR * 0.20; // 20% of BMR (moderate activity)
  const tdee = averageBMR + tef + neat + ea;

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Status Energetskih Izračuna</CardTitle>
            {hasRequiredData ? (
              <Badge variant="default" className="bg-green-500 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Spremno
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                Nedostaju podaci
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {!hasRequiredData && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              Molimo unesite podatke u kartici <strong>Antropometrija</strong> kako bi se izračunale energetske potrebe.
            </p>
          </CardContent>
        </Card>
      )}

      {hasRequiredData && (
        <>
          {/* BMR Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                BMR - Bazalni Metabolizam (4 formule)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Harris-Benedict</p>
                  <p className="text-xl font-bold">{harrisBenedict.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">kcal/dan</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Mifflin-St Jeor</p>
                  <p className="text-xl font-bold">{mifflinStJeor.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">kcal/dan</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Katch-McArdle</p>
                  <p className="text-xl font-bold">{lbmNum > 0 ? katchMcArdle.toFixed(0) : 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">kcal/dan</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">REE Formula</p>
                  <p className="text-xl font-bold">{reeFormula.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">kcal/dan</p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg border-2 border-primary">
                  <p className="text-xs text-muted-foreground mb-1">Prosjek</p>
                  <p className="text-2xl font-bold text-primary">{averageBMR.toFixed(0)}</p>
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
                <CardTitle>TEF - Thermic Effect of Food</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {tef.toFixed(0)} kcal
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Kalorije iz probave (~10% BMR)
                </p>
              </CardContent>
            </Card>

            {/* NEAT Card */}
            <Card>
              <CardHeader>
                <CardTitle>NEAT - Non-Exercise Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {neat.toFixed(0)} kcal
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Dnevne aktivnosti (~15% BMR)
                </p>
              </CardContent>
            </Card>

            {/* EA Card */}
            <Card>
              <CardHeader>
                <CardTitle>EA - Exercise Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {ea.toFixed(0)} kcal
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Kalorije iz vježbanja (~20% BMR)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* TDEE Card */}
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                TDEE - Total Daily Energy Expenditure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary text-center">
                {tdee.toFixed(0)} kcal
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Ukupna dnevna potrošnja energije (BMR + TEF + NEAT + EA)
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
