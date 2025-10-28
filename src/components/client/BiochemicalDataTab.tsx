import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Droplet, Activity, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculateInsulinSensitivity } from "@/utils/expertSystemCalculations";

interface BiochemicalDataTabProps {
  clientId: string;
  latestAnthropometricData?: {
    waist_circumference?: number | null;
    body_fat_navy?: number | null;
  };
  onDataUpdated: () => void;
}

export default function BiochemicalDataTab({ 
  clientId, 
  latestAnthropometricData,
  onDataUpdated 
}: BiochemicalDataTabProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRecalcPrompt, setShowRecalcPrompt] = useState(false);
  
  // Form state
  const [ggt, setGgt] = useState("");
  const [triglycerides, setTriglycerides] = useState("");
  const [fastingGlucose, setFastingGlucose] = useState("");
  const [hba1c, setHba1c] = useState("");
  const [notes, setNotes] = useState("");

  // Load existing data
  useEffect(() => {
    loadBiochemicalData();
  }, [clientId]);

  const loadBiochemicalData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_biochemical_data')
        .select('*')
        .eq('client_id', clientId)
        .order('measurement_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setGgt(data.ggt?.toString() || "");
        setTriglycerides(data.triglycerides?.toString() || "");
        setFastingGlucose(data.fasting_glucose?.toString() || "");
        setHba1c(data.hba1c?.toString() || "");
        setNotes(data.notes || "");
      }
    } catch (error: any) {
      console.error('Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isComplete = !!(ggt && triglycerides && fastingGlucose);

  // Calculate insulin sensitivity score
  const insulinSensitivityResult = isComplete
    ? calculateInsulinSensitivity({
        ggt: parseFloat(ggt),
        triglycerides: parseFloat(triglycerides),
        fastingGlucose: parseFloat(fastingGlucose),
        hba1c: hba1c ? parseFloat(hba1c) : undefined,
        waistCircumference: latestAnthropometricData?.waist_circumference || undefined,
        bodyFat: latestAnthropometricData?.body_fat_navy || undefined
      })
    : null;

  const handleSave = async () => {
    if (!isComplete) {
      toast({
        title: "Greška",
        description: "Molimo ispunite sve obavezne podatke (GGT, Trigliceridi, GUK)",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // Check if data exists
      const { data: existingData } = await supabase
        .from('client_biochemical_data')
        .select('id')
        .eq('client_id', clientId)
        .order('measurement_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      const biochemicalData = {
        client_id: clientId,
        measurement_date: new Date().toISOString().split('T')[0],
        ggt: parseFloat(ggt),
        triglycerides: parseFloat(triglycerides),
        fasting_glucose: parseFloat(fastingGlucose),
        hba1c: hba1c ? parseFloat(hba1c) : null,
        insulin_sensitivity_score: insulinSensitivityResult?.numericScore || null,
        metabolic_flexibility_score: null, // TODO: Add calculation
        notes
      };

      if (existingData) {
        const { error } = await supabase
          .from('client_biochemical_data')
          .update(biochemicalData)
          .eq('id', existingData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('client_biochemical_data')
          .insert(biochemicalData);

        if (error) throw error;
      }

      toast({
        title: "Uspješno",
        description: "Biokemijski podaci su spremljeni. Razmislite o re-kalkulaciji Expert System preporuka."
      });

      setShowRecalcPrompt(true);
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Učitavanje...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Re-calculation Prompt */}
      {showRecalcPrompt && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Biokemijski podaci su ažurirani. Preporučujemo re-kalkulaciju u Expert System tabu kako bi preporuke bile točne.
            <Button
              size="sm"
              variant="link"
              onClick={() => setShowRecalcPrompt(false)}
              className="ml-2"
            >
              Zatvori
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Badge */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5" />
              Status Biokemijskih Podataka
            </CardTitle>
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
          <CardTitle>Biokemijski Markeri</CardTitle>
          <p className="text-sm text-muted-foreground">
            Unesite najnovije laboratorijske nalaze
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GGT */}
            <div className="space-y-2">
              <Label htmlFor="ggt">GGT (Gama-glutamil transferaza) *</Label>
              <div className="flex gap-2">
                <Input
                  id="ggt"
                  type="number"
                  step="0.1"
                  value={ggt}
                  onChange={(e) => setGgt(e.target.value)}
                  placeholder="npr. 25"
                />
                <span className="text-sm text-muted-foreground flex items-center">U/L</span>
              </div>
              <p className="text-xs text-muted-foreground">Normalno: 0-55 U/L</p>
            </div>

            {/* Triglycerides */}
            <div className="space-y-2">
              <Label htmlFor="triglycerides">Trigliceridi *</Label>
              <div className="flex gap-2">
                <Input
                  id="triglycerides"
                  type="number"
                  step="0.1"
                  value={triglycerides}
                  onChange={(e) => setTriglycerides(e.target.value)}
                  placeholder="npr. 1.5"
                />
                <span className="text-sm text-muted-foreground flex items-center">mmol/L</span>
              </div>
              <p className="text-xs text-muted-foreground">Optimalno: &lt;1.7 mmol/L</p>
            </div>

            {/* Fasting Glucose */}
            <div className="space-y-2">
              <Label htmlFor="fastingGlucose">GUK Natašte *</Label>
              <div className="flex gap-2">
                <Input
                  id="fastingGlucose"
                  type="number"
                  step="0.1"
                  value={fastingGlucose}
                  onChange={(e) => setFastingGlucose(e.target.value)}
                  placeholder="npr. 5.2"
                />
                <span className="text-sm text-muted-foreground flex items-center">mmol/L</span>
              </div>
              <p className="text-xs text-muted-foreground">Normalno: 3.9-5.6 mmol/L</p>
            </div>

            {/* HbA1c */}
            <div className="space-y-2">
              <Label htmlFor="hba1c">HbA1c (Glikirani hemoglobin)</Label>
              <div className="flex gap-2">
                <Input
                  id="hba1c"
                  type="number"
                  step="0.1"
                  value={hba1c}
                  onChange={(e) => setHba1c(e.target.value)}
                  placeholder="npr. 5.4"
                />
                <span className="text-sm text-muted-foreground flex items-center">%</span>
              </div>
              <p className="text-xs text-muted-foreground">Normalno: &lt;5.7%</p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Bilješke</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dodatne bilješke o nalazima..."
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Spremanje..." : "Spremi Podatke"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calculated Insulin Sensitivity */}
      {insulinSensitivityResult && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Procjena Inzulinske Osjetljivosti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold capitalize">
                  {insulinSensitivityResult.score === 'high' ? 'Visoka' :
                   insulinSensitivityResult.score === 'moderate' ? 'Umjerena' :
                   insulinSensitivityResult.score === 'low' ? 'Niska' :
                   'Vrlo Niska'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Score: {insulinSensitivityResult.numericScore}/100
                </p>
              </div>
              <Badge 
                variant="outline" 
                className={
                  insulinSensitivityResult.score === 'high' ? 'bg-green-500/10 text-green-500' :
                  insulinSensitivityResult.score === 'moderate' ? 'bg-yellow-500/10 text-yellow-500' :
                  insulinSensitivityResult.score === 'low' ? 'bg-orange-500/10 text-orange-500' :
                  'bg-red-500/10 text-red-500'
                }
              >
                {insulinSensitivityResult.score.toUpperCase()}
              </Badge>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Interpretacija:</h4>
              <p className="text-sm text-muted-foreground">
                {insulinSensitivityResult.score === 'high' 
                  ? 'Odlična inzulinska osjetljivost. Tijelo učinkovito upravlja šećerima i energijom.'
                  : insulinSensitivityResult.score === 'moderate'
                  ? 'Umjerena inzulinska osjetljivost. Ima prostora za poboljšanje kroz prehranu i aktivnost.'
                  : insulinSensitivityResult.score === 'low'
                  ? 'Smanjena inzulinska osjetljivost. Potrebne su prehrambene prilagodbe i povećana aktivnost.'
                  : 'Značajno smanjena inzulinska osjetljivost. Preporučuje se konzultacija s liječnikom i pažljivo planiranje prehrane.'}
              </p>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Preporuke:</h4>
              <ul className="space-y-2 text-sm">
                {insulinSensitivityResult.score !== 'high' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Povećajte unos vlakana i proteina</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Smanjite brze ugljikohidrate i prerađenu hranu</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Redovna tjelesna aktivnost (30+ min dnevno)</span>
                    </li>
                  </>
                )}
                {insulinSensitivityResult.score === 'high' && (
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Nastavite s trenutnim zdravim navikama</span>
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
