import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  calculateBodyFatNavy,
  calculateLeanBodyMass,
  calculateFatMass,
  calculateBMI,
  getBMICategory,
  getBodyFatCategory,
} from "@/utils/anthropometricCalculations";

interface AddAnthropometricDataModalProps {
  clientId: string;
  clientGender: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataAdded: () => void;
}

export default function AddAnthropometricDataModal({
  clientId,
  clientGender,
  open,
  onOpenChange,
  onDataAdded,
}: AddAnthropometricDataModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [measurementDate, setMeasurementDate] = useState(new Date().toISOString().split('T')[0]);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyFatManual, setBodyFatManual] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [neck, setNeck] = useState("");
  const [wrist, setWrist] = useState("");
  const [digitRatio, setDigitRatio] = useState("");
  const [notes, setNotes] = useState("");

  // Calculated fields
  const [bodyFatNavy, setBodyFatNavy] = useState<number | null>(null);
  const [leanBodyMass, setLeanBodyMass] = useState<number | null>(null);
  const [fatMass, setFatMass] = useState<number | null>(null);
  const [bmi, setBmi] = useState<number | null>(null);

  // Auto-calculate Navy body fat when relevant fields change
  useEffect(() => {
    if (height && waist && neck && (clientGender !== 'female' || hip)) {
      const params = {
        gender: (clientGender === 'male' ? 'male' : 'female') as 'male' | 'female',
        waist: parseFloat(waist),
        neck: parseFloat(neck),
        hip: hip ? parseFloat(hip) : undefined,
        height: parseFloat(height),
      };
      const calculated = calculateBodyFatNavy(params);
      setBodyFatNavy(calculated);
    } else {
      setBodyFatNavy(null);
    }
  }, [height, waist, neck, hip, clientGender]);

  // Auto-calculate BMI
  useEffect(() => {
    if (height && weight) {
      const calculated = calculateBMI(parseFloat(weight), parseFloat(height));
      setBmi(calculated);
    } else {
      setBmi(null);
    }
  }, [height, weight]);

  // Auto-calculate LBM and FM
  useEffect(() => {
    if (weight) {
      const bodyFatToUse = bodyFatNavy || (bodyFatManual ? parseFloat(bodyFatManual) : null);
      if (bodyFatToUse) {
        const lbm = calculateLeanBodyMass(parseFloat(weight), bodyFatToUse);
        const fm = calculateFatMass(parseFloat(weight), bodyFatToUse);
        setLeanBodyMass(lbm);
        setFatMass(fm);
      } else {
        setLeanBodyMass(null);
        setFatMass(null);
      }
    } else {
      setLeanBodyMass(null);
      setFatMass(null);
    }
  }, [weight, bodyFatNavy, bodyFatManual]);

  const resetForm = () => {
    setMeasurementDate(new Date().toISOString().split('T')[0]);
    setHeight("");
    setWeight("");
    setBodyFatManual("");
    setWaist("");
    setHip("");
    setNeck("");
    setWrist("");
    setDigitRatio("");
    setNotes("");
    setBodyFatNavy(null);
    setLeanBodyMass(null);
    setFatMass(null);
    setBmi(null);
  };

  const handleSubmit = async () => {
    if (!weight && !height) {
      toast({
        title: "Greška",
        description: "Molimo unesite barem težinu ili visinu.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("client_anthropometric_data")
        .insert({
          client_id: clientId,
          measurement_date: measurementDate,
          height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null,
          body_fat_manual: bodyFatManual ? parseFloat(bodyFatManual) : null,
          body_fat_navy: bodyFatNavy,
          lean_body_mass: leanBodyMass,
          fat_mass: fatMass,
          waist_circumference: waist ? parseFloat(waist) : null,
          hip_circumference: hip ? parseFloat(hip) : null,
          neck_circumference: neck ? parseFloat(neck) : null,
          wrist_circumference: wrist ? parseFloat(wrist) : null,
          digit_ratio_2d4d: digitRatio ? parseFloat(digitRatio) : null,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "Uspjeh",
        description: "Antropometrijski podaci uspješno dodani.",
      });

      resetForm();
      onOpenChange(false);
      onDataAdded();
    } catch (error: any) {
      toast({
        title: "Greška",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Antropometrijsko Mjerenje</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Measurement Date */}
          <div>
            <Label>Datum Mjerenja *</Label>
            <Input
              type="date"
              value={measurementDate}
              onChange={(e) => setMeasurementDate(e.target.value)}
              required
            />
          </div>

          {/* Basic Measurements */}
          <div>
            <h4 className="font-semibold mb-3">Osnovna Mjerenja</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Visina (cm)</Label>
                <Input
                  type="number"
                  placeholder="175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="100"
                  max="250"
                  step="0.1"
                />
              </div>
              <div>
                <Label>Težina (kg) *</Label>
                <Input
                  type="number"
                  placeholder="75"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="30"
                  max="300"
                  step="0.1"
                  required
                />
              </div>
            </div>
            {bmi && (
              <div className="mt-2">
                <Badge variant="outline">
                  BMI: {bmi} - {getBMICategory(bmi)}
                </Badge>
              </div>
            )}
          </div>

          {/* Body Fat */}
          <div>
            <h4 className="font-semibold mb-3">Body Fat %</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Manualno Unesen (%)</Label>
                <Input
                  type="number"
                  placeholder="15.5"
                  value={bodyFatManual}
                  onChange={(e) => setBodyFatManual(e.target.value)}
                  min="3"
                  max="50"
                  step="0.1"
                />
              </div>
              {bodyFatNavy && (
                <div className="flex items-end">
                  <div className="flex-1">
                    <Label className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Navy Formula (%)
                    </Label>
                    <div className="h-10 flex items-center px-3 bg-muted rounded-md">
                      <span className="font-semibold">{bodyFatNavy}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {bodyFatNavy && (
              <div className="mt-2">
                <Badge variant="outline">
                  {getBodyFatCategory(bodyFatNavy, clientGender === 'male' ? 'male' : 'female')}
                </Badge>
              </div>
            )}
          </div>

          {/* Circumferences for Navy Formula */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Opsezi (za Navy formulu)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Struk (cm)</Label>
                <Input
                  type="number"
                  placeholder="85"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  min="50"
                  max="200"
                  step="0.1"
                />
              </div>
              <div>
                <Label>Vrat (cm)</Label>
                <Input
                  type="number"
                  placeholder="38"
                  value={neck}
                  onChange={(e) => setNeck(e.target.value)}
                  min="20"
                  max="60"
                  step="0.1"
                />
              </div>
              {clientGender === 'female' && (
                <div>
                  <Label>Bokovi (cm) - Za žene</Label>
                  <Input
                    type="number"
                    placeholder="95"
                    value={hip}
                    onChange={(e) => setHip(e.target.value)}
                    min="60"
                    max="200"
                    step="0.1"
                  />
                </div>
              )}
              {clientGender !== 'female' && hip !== "" && (
                <div>
                  <Label>Bokovi (cm)</Label>
                  <Input
                    type="number"
                    placeholder="95"
                    value={hip}
                    onChange={(e) => setHip(e.target.value)}
                    min="60"
                    max="200"
                    step="0.1"
                  />
                </div>
              )}
              <div>
                <Label>Zapešće (cm)</Label>
                <Input
                  type="number"
                  placeholder="16"
                  value={wrist}
                  onChange={(e) => setWrist(e.target.value)}
                  min="10"
                  max="30"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Body Composition */}
          {(leanBodyMass || fatMass) && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Izračunati Sastav Tijela
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {leanBodyMass && (
                  <div>
                    <Label>LBM - Nemasna Masa (kg)</Label>
                    <div className="h-10 flex items-center px-3 bg-muted rounded-md">
                      <span className="font-semibold">{leanBodyMass} kg</span>
                    </div>
                  </div>
                )}
                {fatMass && (
                  <div>
                    <Label>FM - Masna Masa (kg)</Label>
                    <div className="h-10 flex items-center px-3 bg-muted rounded-md">
                      <span className="font-semibold">{fatMass} kg</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Metrics */}
          <div>
            <h4 className="font-semibold mb-3">Dodatni Podaci</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Omjer Prsta 2D:4D</Label>
                <Input
                  type="number"
                  placeholder="0.95"
                  value={digitRatio}
                  onChange={(e) => setDigitRatio(e.target.value)}
                  min="0.5"
                  max="1.5"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Bilješke</Label>
            <Textarea
              placeholder="Dodatne bilješke o mjerenju..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Odustani
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Spremanje..." : "Spremi Mjerenje"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
