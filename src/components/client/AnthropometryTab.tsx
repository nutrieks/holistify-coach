import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  calculateBMI, 
  calculateBRI, 
  calculateBodyFatNavy, 
  calculateWaistToHipRatio,
  calculateLeanBodyMass,
  calculateFatMass
} from "@/utils/anthropometricCalculations";
import { CheckCircle, XCircle } from "lucide-react";
import BodyCompositionImageUpload from "./BodyCompositionImageUpload";

interface AnthropometryTabProps {
  clientId: string;
  initialData?: {
    gender?: string | null;
    height?: number | null;
    weight?: number | null;
    waist_circumference?: number | null;
    hip_circumference?: number | null;
    neck_circumference?: number | null;
    wrist_circumference?: number | null;
    digit_ratio_2d4d?: number | null;
  };
  onDataUpdated: () => void;
}

export default function AnthropometryTab({ clientId, initialData, onDataUpdated }: AnthropometryTabProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [gender, setGender] = useState(initialData?.gender || "");
  const [height, setHeight] = useState(initialData?.height?.toString() || "");
  const [weight, setWeight] = useState(initialData?.weight?.toString() || "");
  const [waist, setWaist] = useState(initialData?.waist_circumference?.toString() || "");
  const [hip, setHip] = useState(initialData?.hip_circumference?.toString() || "");
  const [neck, setNeck] = useState(initialData?.neck_circumference?.toString() || "");
  const [wrist, setWrist] = useState(initialData?.wrist_circumference?.toString() || "");
  const [digitRatio, setDigitRatio] = useState(initialData?.digit_ratio_2d4d?.toString() || "");

  // Check if all required fields are filled
  const isComplete = !!(gender && height && weight && waist && hip && neck);

  // Calculate metrics
  const heightNum = parseFloat(height) || 0;
  const weightNum = parseFloat(weight) || 0;
  const waistNum = parseFloat(waist) || 0;
  const hipNum = parseFloat(hip) || 0;
  const neckNum = parseFloat(neck) || 0;

  const bmi = heightNum && weightNum ? calculateBMI(weightNum, heightNum) : null;
  const bri = heightNum && waistNum ? calculateBRI(waistNum, heightNum) : null;
  const bodyFat = gender && heightNum && waistNum && neckNum
    ? calculateBodyFatNavy({
        gender: gender as 'male' | 'female',
        waist: waistNum,
        neck: neckNum,
        hip: hipNum,
        height: heightNum
      })
    : null;
  const whr = waistNum && hipNum ? calculateWaistToHipRatio(waistNum, hipNum) : null;
  const lbm = weightNum && bodyFat ? calculateLeanBodyMass(weightNum, bodyFat) : null;
  const fm = weightNum && bodyFat ? calculateFatMass(weightNum, bodyFat) : null;

  const handleSave = async () => {
    if (!isComplete) {
      toast({
        title: "Greška",
        description: "Molimo ispunite sve obavezne podatke",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // Update client with gender
      const { error: clientError } = await supabase
        .from('clients')
        .update({ gender })
        .eq('id', clientId);

      if (clientError) throw clientError;

      // Check if anthropometric data exists
      const { data: existingData } = await supabase
        .from('client_anthropometric_data')
        .select('id')
        .eq('client_id', clientId)
        .order('measurement_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      const anthropometricData = {
        client_id: clientId,
        measurement_date: new Date().toISOString().split('T')[0],
        height: heightNum,
        weight: weightNum,
        waist_circumference: waistNum,
        hip_circumference: hipNum,
        neck_circumference: neckNum,
        wrist_circumference: parseFloat(wrist) || null,
        digit_ratio_2d4d: parseFloat(digitRatio) || null,
        body_fat_navy: bodyFat,
        lean_body_mass: lbm,
        fat_mass: fm
      };

      if (existingData) {
        // Update existing
        const { error } = await supabase
          .from('client_anthropometric_data')
          .update(anthropometricData)
          .eq('id', existingData.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('client_anthropometric_data')
          .insert(anthropometricData);

        if (error) throw error;
      }

      toast({
        title: "Uspješno",
        description: "Antropometrijski podaci su spremljeni"
      });

      onDataUpdated();
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Greška",
        description: error.message || "Greška pri spremanju podataka",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Status Antropometrijskih Podataka</CardTitle>
            {isComplete ? (
              <Badge variant="default" className="bg-green-500 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Ispunjeno
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                Nepotpuno
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Input Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Početni Antropometrijski Podaci</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Spol *</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Odaberite spol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Muško</SelectItem>
                  <SelectItem value="female">Žensko</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Height */}
            <div className="space-y-2">
              <Label htmlFor="height">Visina (cm) *</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="npr. 175"
              />
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight">Težina (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="npr. 75.5"
              />
            </div>

            {/* Waist */}
            <div className="space-y-2">
              <Label htmlFor="waist">Opseg Struka (cm) *</Label>
              <Input
                id="waist"
                type="number"
                step="0.1"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="npr. 85"
              />
            </div>

            {/* Hip */}
            <div className="space-y-2">
              <Label htmlFor="hip">Opseg Bokova (cm) *</Label>
              <Input
                id="hip"
                type="number"
                step="0.1"
                value={hip}
                onChange={(e) => setHip(e.target.value)}
                placeholder="npr. 95"
              />
            </div>

            {/* Neck */}
            <div className="space-y-2">
              <Label htmlFor="neck">Opseg Vrata (cm) *</Label>
              <Input
                id="neck"
                type="number"
                step="0.1"
                value={neck}
                onChange={(e) => setNeck(e.target.value)}
                placeholder="npr. 38"
              />
            </div>

            {/* Wrist */}
            <div className="space-y-2">
              <Label htmlFor="wrist">Opseg Zapešća (cm)</Label>
              <Input
                id="wrist"
                type="number"
                step="0.1"
                value={wrist}
                onChange={(e) => setWrist(e.target.value)}
                placeholder="npr. 17"
              />
            </div>

            {/* Digit Ratio */}
            <div className="space-y-2">
              <Label htmlFor="digitRatio">2D:4D Ratio</Label>
              <Input
                id="digitRatio"
                type="number"
                step="0.01"
                value={digitRatio}
                onChange={(e) => setDigitRatio(e.target.value)}
                placeholder="npr. 0.95"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Spremanje..." : "Spremi Podatke"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calculated Metrics */}
      {isComplete && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">BMI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bmi?.toFixed(1) || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Body Mass Index</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">BRI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bri?.toFixed(2) || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Body Roundness Index</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Body Fat %</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bodyFat?.toFixed(1) || "N/A"}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Navy metoda</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">WHR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {whr?.toFixed(2) || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Waist-to-Hip Ratio</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">LBM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lbm?.toFixed(1) || "N/A"} kg
              </div>
              <p className="text-xs text-muted-foreground mt-1">Lean Body Mass</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">FM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {fm?.toFixed(1) || "N/A"} kg
              </div>
              <p className="text-xs text-muted-foreground mt-1">Fat Mass</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Body Composition Upload */}
      <BodyCompositionImageUpload 
        clientId={clientId}
        onAnalysisComplete={async (bodyFatPercentage) => {
          // Try to update the latest anthropometric data with AI-estimated BF
          const { data: latestData } = await supabase
            .from('client_anthropometric_data')
            .select('id')
            .eq('client_id', clientId)
            .order('measurement_date', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestData) {
            const { error } = await supabase
              .from('client_anthropometric_data')
              .update({ body_fat_manual: bodyFatPercentage })
              .eq('id', latestData.id);

            if (!error) {
              toast({
                title: "Uspješno",
                description: `%BF (${bodyFatPercentage}%) je spremljen u zadnje mjerenje.`,
              });
              onDataUpdated();
            } else {
              toast({
                title: "Greška",
                description: "Nije moguće spremiti procijenjeni %BF.",
                variant: "destructive",
              });
            }
          } else {
            toast({
              title: "Info",
              description: "Prvo dodajte antropometrijsko mjerenje, zatim koristite AI analizu.",
            });
          }
        }}
      />
    </div>
  );
}
