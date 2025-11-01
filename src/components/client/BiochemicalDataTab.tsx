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
  
  // Insulin Sensitivity Questionnaire (10 questions, 1-5 scale)
  const [q1, setQ1] = useState(3); // Post-meal energy
  const [q2, setQ2] = useState(3); // Morning wake-up
  const [q3, setQ3] = useState(3); // Appetite stability
  const [q4, setQ4] = useState(3); // Sugar cravings
  const [q5, setQ5] = useState(3); // Post-exercise energy
  const [q6, setQ6] = useState(3); // Menstrual regularity (if applicable)
  const [q7, setQ7] = useState(3); // Mental focus
  const [q8, setQ8] = useState(3); // Sleep quality
  const [q9, setQ9] = useState(3); // Stress level
  const [q10, setQ10] = useState(3); // Water retention

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
  
  // Calculate subjective insulin sensitivity score (inverse scoring: lower = better)
  const subjectiveScore = ((50 - (q1 + q2 + q3 + q4 + q5 + q6 + q7 + q8 + q9 + q10)) / 40) * 100;
  const subjectiveRating = subjectiveScore >= 75 ? 'high' : 
                           subjectiveScore >= 50 ? 'moderate' : 
                           subjectiveScore >= 25 ? 'low' : 'very_low';

  // Calculate insulin sensitivity score
  const insulinSensitivityResult = isComplete
    ? calculateInsulinSensitivity({
        ggt: parseFloat(ggt),
        triglycerides: parseFloat(triglycerides),
        fastingGlucose: parseFloat(fastingGlucose),
        hba1c: hba1c ? parseFloat(hba1c) : undefined,
        waistCircumference: latestAnthropometricData?.waist_circumference || undefined
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

      {/* Insulin Sensitivity Questionnaire */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Insulin Sensitivity Questionnaire
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Subjektivna procjena inzulinske osjetljivosti (1 = najbolje, 5 = najgore)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question 1 */}
          <div className="space-y-2">
            <Label>1. Kako se osjećate nakon obroka bogatog ugljikohidratima?</Label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Odlično</span>
              {[1, 2, 3, 4, 5].map(val => (
                <Button
                  key={val}
                  type="button"
                  variant={q1 === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQ1(val)}
                  className="w-10 h-10"
                >
                  {val}
                </Button>
              ))}
              <span className="text-xs text-muted-foreground">Umorno/pospanije</span>
            </div>
          </div>

          {/* Question 2 */}
          <div className="space-y-2">
            <Label>2. Koliko brzo se razbudite ujutro?</Label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Odmah</span>
              {[1, 2, 3, 4, 5].map(val => (
                <Button
                  key={val}
                  type="button"
                  variant={q2 === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQ2(val)}
                  className="w-10 h-10"
                >
                  {val}
                </Button>
              ))}
              <span className="text-xs text-muted-foreground">Teško ustajanje</span>
            </div>
          </div>

          {/* Question 3 */}
          <div className="space-y-2">
            <Label>3. Kako bi opisali svoj apetit kroz dan?</Label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Stabilan</span>
              {[1, 2, 3, 4, 5].map(val => (
                <Button
                  key={val}
                  type="button"
                  variant={q3 === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQ3(val)}
                  className="w-10 h-10"
                >
                  {val}
                </Button>
              ))}
              <span className="text-xs text-muted-foreground">Česte gladi</span>
            </div>
          </div>

          {/* Question 4 */}
          <div className="space-y-2">
            <Label>4. Kako često osjećate žudnju za slatkim?</Label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Rijetko</span>
              {[1, 2, 3, 4, 5].map(val => (
                <Button
                  key={val}
                  type="button"
                  variant={q4 === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQ4(val)}
                  className="w-10 h-10"
                >
                  {val}
                </Button>
              ))}
              <span className="text-xs text-muted-foreground">Stalno</span>
            </div>
          </div>

          {/* Question 5 */}
          <div className="space-y-2">
            <Label>5. Kako se osjećate nakon vježbanja?</Label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Energično</span>
              {[1, 2, 3, 4, 5].map(val => (
                <Button
                  key={val}
                  type="button"
                  variant={q5 === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQ5(val)}
                  className="w-10 h-10"
                >
                  {val}
                </Button>
              ))}
              <span className="text-xs text-muted-foreground">Iscrpljeno dugo</span>
            </div>
          </div>

          {/* Question 6 */}
          <div className="space-y-2">
            <Label>6. Menstrualna regularnost (za žene) / Hormonska stabilnost (za muškarce)</Label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Redovna</span>
              {[1, 2, 3, 4, 5].map(val => (
                <Button
                  key={val}
                  type="button"
                  variant={q6 === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQ6(val)}
                  className="w-10 h-10"
                >
                  {val}
                </Button>
              ))}
              <span className="text-xs text-muted-foreground">Nepravilna</span>
            </div>
          </div>

          {/* Question 7 */}
          <div className="space-y-2">
            <Label>7. Kako bi opisali svoju mentalnu koncentraciju?</Label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Fokusirana</span>
              {[1, 2, 3, 4, 5].map(val => (
                <Button
                  key={val}
                  type="button"
                  variant={q7 === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQ7(val)}
                  className="w-10 h-10"
                >
                  {val}
                </Button>
              ))}
              <span className="text-xs text-muted-foreground">Magla</span>
            </div>
          </div>

          {/* Question 8 */}
          <div className="space-y-2">
            <Label>8. Koliko često se budite noću?</Label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Rijetko</span>
              {[1, 2, 3, 4, 5].map(val => (
                <Button
                  key={val}
                  type="button"
                  variant={q8 === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQ8(val)}
                  className="w-10 h-10"
                >
                  {val}
                </Button>
              ))}
              <span className="text-xs text-muted-foreground">Često</span>
            </div>
          </div>

          {/* Question 9 */}
          <div className="space-y-2">
            <Label>9. Kako biste ocijenili svoju razinu stresa?</Label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Niska</span>
              {[1, 2, 3, 4, 5].map(val => (
                <Button
                  key={val}
                  type="button"
                  variant={q9 === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQ9(val)}
                  className="w-10 h-10"
                >
                  {val}
                </Button>
              ))}
              <span className="text-xs text-muted-foreground">Visoka</span>
            </div>
          </div>

          {/* Question 10 */}
          <div className="space-y-2">
            <Label>10. Kako bi opisali zadržavanje vode u tijelu?</Label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Ne</span>
              {[1, 2, 3, 4, 5].map(val => (
                <Button
                  key={val}
                  type="button"
                  variant={q10 === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQ10(val)}
                  className="w-10 h-10"
                >
                  {val}
                </Button>
              ))}
              <span className="text-xs text-muted-foreground">Često</span>
            </div>
          </div>

          {/* Subjective Score Display */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Subjektivni Score:</p>
                <p className="text-2xl font-bold">{subjectiveScore.toFixed(0)}/100</p>
              </div>
              <Badge 
                variant="outline"
                className={
                  subjectiveRating === 'high' ? 'bg-green-500/10 text-green-500' :
                  subjectiveRating === 'moderate' ? 'bg-yellow-500/10 text-yellow-500' :
                  subjectiveRating === 'low' ? 'bg-orange-500/10 text-orange-500' :
                  'bg-red-500/10 text-red-500'
                }
              >
                {subjectiveRating.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ovaj subjektivni upitnik dopunjuje objektivne laboratorijske nalaze.
            </p>
          </div>
        </CardContent>
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
