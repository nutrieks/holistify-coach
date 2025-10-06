import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { hr } from "date-fns/locale";
import AddAnthropometricDataModal from "./AddAnthropometricDataModal";
import AnthropometricDataHistory from "./AnthropometricDataHistory";
import { calculateBMI, getBMICategory, getBodyFatCategory, getWHRRiskCategory } from "@/utils/anthropometricCalculations";

interface AnthropometricData {
  id: string;
  measurement_date: string;
  height: number | null;
  weight: number | null;
  body_fat_manual: number | null;
  body_fat_navy: number | null;
  lean_body_mass: number | null;
  fat_mass: number | null;
  waist_circumference: number | null;
  hip_circumference: number | null;
  neck_circumference: number | null;
  wrist_circumference: number | null;
  digit_ratio_2d4d: number | null;
  notes: string | null;
}

interface AnthropometricDataCardProps {
  clientId: string;
  clientGender: string | null;
  data: AnthropometricData[];
  onDataAdded: () => void;
}

export default function AnthropometricDataCard({ 
  clientId, 
  clientGender,
  data,
  onDataAdded 
}: AnthropometricDataCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const latestData = data[0];
  const previousData = data[1];

  const getTrend = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 0.1) return { icon: Minus, color: "text-muted-foreground", text: "bez promjene" };
    if (diff > 0) return { icon: TrendingUp, color: "text-red-500", text: `+${diff.toFixed(1)}` };
    return { icon: TrendingDown, color: "text-green-500", text: `${diff.toFixed(1)}` };
  };

  if (!latestData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Antropometrijski Podaci</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Još nema mjerenja za ovog klijenta.</p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj Mjerenje
          </Button>
          <AddAnthropometricDataModal
            clientId={clientId}
            clientGender={clientGender}
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            onDataAdded={onDataAdded}
          />
        </CardContent>
      </Card>
    );
  }

  const bmi = latestData.height && latestData.weight 
    ? calculateBMI(latestData.weight, latestData.height) 
    : null;

  const whr = latestData.waist_circumference && latestData.hip_circumference
    ? (latestData.waist_circumference / latestData.hip_circumference).toFixed(2)
    : null;

  const weightTrend = getTrend(latestData.weight, previousData?.weight);
  const bodyFatTrend = getTrend(latestData.body_fat_navy || latestData.body_fat_manual, 
                                 previousData?.body_fat_navy || previousData?.body_fat_manual);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Antropometrijski Podaci</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Posljednje mjerenje: {format(new Date(latestData.measurement_date), 'dd. MMM yyyy', { locale: hr })}
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Mjerenje
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Measurements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {latestData.height && (
              <div>
                <p className="text-sm text-muted-foreground">Visina</p>
                <p className="text-2xl font-bold">{latestData.height} <span className="text-sm font-normal">cm</span></p>
              </div>
            )}
            
            {latestData.weight && (
              <div>
                <p className="text-sm text-muted-foreground">Težina</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{latestData.weight} <span className="text-sm font-normal">kg</span></p>
                  {weightTrend && (
                    <Badge variant="outline" className={weightTrend.color}>
                      <weightTrend.icon className="h-3 w-3 mr-1" />
                      {weightTrend.text}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {bmi && (
              <div>
                <p className="text-sm text-muted-foreground">BMI</p>
                <p className="text-2xl font-bold">{bmi}</p>
                <p className="text-xs text-muted-foreground">{getBMICategory(bmi)}</p>
              </div>
            )}

            {(latestData.body_fat_navy || latestData.body_fat_manual) && (
              <div>
                <p className="text-sm text-muted-foreground">Body Fat %</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {latestData.body_fat_navy || latestData.body_fat_manual}%
                  </p>
                  {bodyFatTrend && (
                    <Badge variant="outline" className={bodyFatTrend.color}>
                      <bodyFatTrend.icon className="h-3 w-3 mr-1" />
                      {bodyFatTrend.text}
                    </Badge>
                  )}
                </div>
                {latestData.body_fat_navy && (
                  <p className="text-xs text-muted-foreground">
                    {getBodyFatCategory(latestData.body_fat_navy, clientGender === 'male' ? 'male' : 'female')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Body Composition */}
          {(latestData.lean_body_mass || latestData.fat_mass) && (
            <div>
              <h4 className="font-semibold mb-3">Sastav Tijela</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {latestData.lean_body_mass && (
                  <div>
                    <p className="text-sm text-muted-foreground">LBM (Nemasna masa)</p>
                    <p className="text-xl font-bold">{latestData.lean_body_mass} <span className="text-sm font-normal">kg</span></p>
                  </div>
                )}
                {latestData.fat_mass && (
                  <div>
                    <p className="text-sm text-muted-foreground">FM (Masna masa)</p>
                    <p className="text-xl font-bold">{latestData.fat_mass} <span className="text-sm font-normal">kg</span></p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Circumferences */}
          {(latestData.waist_circumference || latestData.hip_circumference || 
            latestData.neck_circumference || latestData.wrist_circumference) && (
            <div>
              <h4 className="font-semibold mb-3">Opsezi</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {latestData.waist_circumference && (
                  <div>
                    <p className="text-sm text-muted-foreground">Struk</p>
                    <p className="text-xl font-bold">{latestData.waist_circumference} <span className="text-sm font-normal">cm</span></p>
                  </div>
                )}
                {latestData.hip_circumference && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bokovi</p>
                    <p className="text-xl font-bold">{latestData.hip_circumference} <span className="text-sm font-normal">cm</span></p>
                  </div>
                )}
                {latestData.neck_circumference && (
                  <div>
                    <p className="text-sm text-muted-foreground">Vrat</p>
                    <p className="text-xl font-bold">{latestData.neck_circumference} <span className="text-sm font-normal">cm</span></p>
                  </div>
                )}
                {latestData.wrist_circumference && (
                  <div>
                    <p className="text-sm text-muted-foreground">Zapešće</p>
                    <p className="text-xl font-bold">{latestData.wrist_circumference} <span className="text-sm font-normal">cm</span></p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {whr && (
              <div>
                <p className="text-sm text-muted-foreground">WHR (Struk/Bokovi)</p>
                <p className="text-xl font-bold">{whr}</p>
                <p className="text-xs text-muted-foreground">
                  {getWHRRiskCategory(parseFloat(whr), clientGender === 'male' ? 'male' : 'female')}
                </p>
              </div>
            )}
            {latestData.digit_ratio_2d4d && (
              <div>
                <p className="text-sm text-muted-foreground">2D:4D Ratio</p>
                <p className="text-xl font-bold">{latestData.digit_ratio_2d4d}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {latestData.notes && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-1">Bilješke:</p>
              <p className="text-sm text-muted-foreground">{latestData.notes}</p>
            </div>
          )}

          {/* History Toggle */}
          {data.length > 1 && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Sakrij' : 'Prikaži'} Povijest ({data.length - 1} {data.length - 1 === 1 ? 'mjerenje' : 'mjerenja'})
            </Button>
          )}
        </CardContent>
      </Card>

      {showHistory && data.length > 1 && (
        <AnthropometricDataHistory data={data.slice(1)} clientGender={clientGender} />
      )}

      <AddAnthropometricDataModal
        clientId={clientId}
        clientGender={clientGender}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onDataAdded={onDataAdded}
      />
    </>
  );
}
