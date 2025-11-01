import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { calculateInsulinSensitivity, calculateMusclePotential, calculateBRI, calculateFLI } from "@/utils/expertSystemCalculations";

interface MetabolicDataTabProps {
  clientId: string;
}

export default function MetabolicDataTab({ clientId }: MetabolicDataTabProps) {
  const [loading, setLoading] = useState(true);
  const [biochemicalData, setBiochemicalData] = useState<any>(null);
  const [anthropometricData, setAnthropometricData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bioRes, anthroRes] = await Promise.all([
        supabase
          .from("client_biochemical_data")
          .select("*")
          .eq("client_id", clientId)
          .order("measurement_date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("client_anthropometric_data")
          .select("*")
          .eq("client_id", clientId)
          .order("measurement_date", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      setBiochemicalData(bioRes.data);
      setAnthropometricData(anthroRes.data);
    } catch (error) {
      console.error("Error loading metabolic data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Učitavanje metaboličkih podataka...</div>;
  }

  const insulinSensitivity = biochemicalData && anthropometricData
    ? calculateInsulinSensitivity({
        ggt: biochemicalData.ggt || 50,
        triglycerides: biochemicalData.triglycerides || 150,
        fastingGlucose: biochemicalData.fasting_glucose || 90,
        hba1c: biochemicalData.hba1c || 5.5,
        waistCircumference: anthropometricData.waist_circumference || 85
      })
    : null;

  const musclePotential = anthropometricData
    ? calculateMusclePotential({
        wristCircumference: anthropometricData.wrist_circumference || 17,
        height: anthropometricData.height || 175,
        gender: anthropometricData.gender || 'male',
        leanBodyMass: anthropometricData.lean_body_mass || (anthropometricData.weight || 70) * 0.75,
        digitRatio2D4D: anthropometricData.digit_ratio_2d4d || undefined
      })
    : null;

  const getSensitivityColor = (score: string) => {
    switch (score) {
      case "high": return "text-green-600 bg-green-50";
      case "moderate": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-orange-600 bg-orange-50";
      case "very_low": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getPotentialColor = (score: string) => {
    switch (score) {
      case "high": return "text-green-600 bg-green-50";
      case "moderate": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-orange-600 bg-orange-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getBRIColor = (bri: number) => {
    if (bri < 3) return "text-green-600 bg-green-50";
    if (bri < 5) return "text-yellow-600 bg-yellow-50";
    if (bri < 7) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getBRIRisk = (bri: number) => {
    if (bri < 3) return "Nizak rizik";
    if (bri < 5) return "Umjeren rizik";
    if (bri < 7) return "Visok rizik";
    return "Vrlo visok rizik";
  };

  const getFLIColor = (fli: number) => {
    if (fli < 30) return "text-green-600 bg-green-50";
    if (fli < 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getFLIRisk = (fli: number) => {
    if (fli < 30) return "Nizak rizik";
    if (fli < 60) return "Umjeren rizik";
    return "Visok rizik";
  };

  // Calculate BRI and FLI
  const bri = anthropometricData?.height && anthropometricData?.waist_circumference
    ? calculateBRI(anthropometricData.height, anthropometricData.waist_circumference)
    : null;

  const fli = biochemicalData && anthropometricData
    ? (() => {
        const weight = anthropometricData.weight || 0;
        const height = anthropometricData.height || 0;
        const bmi = height > 0 ? weight / ((height / 100) ** 2) : 0;
        
        return biochemicalData.triglycerides && biochemicalData.ggt && anthropometricData.waist_circumference
          ? calculateFLI({
              bmi,
              waistCircumference: anthropometricData.waist_circumference,
              triglycerides: biochemicalData.triglycerides,
              ggt: biochemicalData.ggt
            })
          : null;
      })()
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* BRI Card */}
      {bri !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Body Roundness Index (BRI)</CardTitle>
            <CardDescription>Indikator tjelesne zaobljenosti i metaboličkog rizika</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{bri.toFixed(2)}</span>
              <Badge className={getBRIColor(bri)}>{getBRIRisk(bri)}</Badge>
            </div>
            <Progress value={Math.min((bri / 10) * 100, 100)} className="h-2" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Visina:</strong> {anthropometricData?.height} cm</p>
              <p><strong>Opseg struka:</strong> {anthropometricData?.waist_circumference} cm</p>
              <p className="pt-2 text-xs">
                BRI koristi visinu i opseg struka za procjenu distribucije tjelesne masti i kardiovaskularnog rizika.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FLI Card */}
      {fli !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Fatty Liver Index (FLI)</CardTitle>
            <CardDescription>Procjena rizika od masne jetre</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{fli.toFixed(1)}</span>
              <Badge className={getFLIColor(fli)}>{getFLIRisk(fli)}</Badge>
            </div>
            <Progress value={Math.min(fli, 100)} className="h-2" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Trigliceridi:</strong> {biochemicalData?.triglycerides} mg/dL</p>
              <p><strong>GGT:</strong> {biochemicalData?.ggt} U/L</p>
              <p><strong>Opseg struka:</strong> {anthropometricData?.waist_circumference} cm</p>
              <p className="pt-2 text-xs">
                FLI {"<"} 30: Nizak rizik | FLI 30-60: Umjeren rizik | FLI {">"} 60: Visok rizik od masne jetre
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insulin Sensitivity Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Osjetljivost na Inzulin
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insulinSensitivity ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Score:</span>
                <Badge className={getSensitivityColor(insulinSensitivity.score)}>
                  {insulinSensitivity.score.toUpperCase()}
                </Badge>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Numerički Score</span>
                  <span className="font-bold">{insulinSensitivity.numericScore.toFixed(1)} / 10</span>
                </div>
                <Progress value={insulinSensitivity.numericScore * 10} className="h-3" />
              </div>
              {biochemicalData && (
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">GGT</p>
                    <p className="text-lg font-bold">{biochemicalData.ggt} U/L</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Trigliceridi</p>
                    <p className="text-lg font-bold">{biochemicalData.triglycerides} mg/dL</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Glukoza Našte</p>
                    <p className="text-lg font-bold">{biochemicalData.fasting_glucose} mg/dL</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">HbA1c</p>
                    <p className="text-lg font-bold">{biochemicalData.hba1c}%</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nedostaju biokemijski ili antropometrijski podaci za izračun.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Muscle Potential Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Potencijal za Mišićnu Masu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {musclePotential ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Score:</span>
                <Badge className={getPotentialColor(musclePotential.score)}>
                  {musclePotential.score.toUpperCase()}
                </Badge>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Numerički Score</span>
                  <span className="font-bold">{musclePotential.numericScore.toFixed(1)} / 10</span>
                </div>
                <Progress value={musclePotential.numericScore * 10} className="h-3" />
              </div>
              {anthropometricData && (
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Opseg Zgloba</p>
                    <p className="text-lg font-bold">{anthropometricData.wrist_circumference} cm</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">2D:4D Ratio</p>
                    <p className="text-lg font-bold">{anthropometricData.digit_ratio_2d4d?.toFixed(3)}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">LBM</p>
                    <p className="text-lg font-bold">{anthropometricData.lean_body_mass} kg</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Frame Size</p>
                    <p className="text-lg font-bold capitalize">{anthropometricData.frame_size || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nedostaju antropometrijski podaci za izračun.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Metabolic Flexibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Metabolička Fleksibilnost
          </CardTitle>
        </CardHeader>
        <CardContent>
          {biochemicalData?.metabolic_flexibility_score ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Score</span>
                  <span className="font-bold">{biochemicalData.metabolic_flexibility_score.toFixed(1)} / 10</span>
                </div>
                <Progress value={biochemicalData.metabolic_flexibility_score * 10} className="h-3" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Metabolička fleksibilnost odražava sposobnost tijela da učinkovito prebacuje između korištenja ugljikohidrata i masti kao izvora energije.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Score još nije izračunat. Potrebni su biokemijski podaci.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
