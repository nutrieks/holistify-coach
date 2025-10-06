import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { hr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { calculateBMI, calculateWaistToHipRatio } from "@/utils/anthropometricCalculations";

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

interface AnthropometricDataHistoryProps {
  data: AnthropometricData[];
  clientGender: string | null;
}

export default function AnthropometricDataHistory({ data, clientGender }: AnthropometricDataHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Povijest Mjerenja</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Težina (kg)</TableHead>
                <TableHead>Visina (cm)</TableHead>
                <TableHead>BMI</TableHead>
                <TableHead>Body Fat %</TableHead>
                <TableHead>LBM (kg)</TableHead>
                <TableHead>FM (kg)</TableHead>
                <TableHead>Struk (cm)</TableHead>
                <TableHead>Bokovi (cm)</TableHead>
                <TableHead>WHR</TableHead>
                <TableHead>Vrat (cm)</TableHead>
                <TableHead>2D:4D</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((measurement) => {
                const bmi = measurement.height && measurement.weight
                  ? calculateBMI(measurement.weight, measurement.height)
                  : null;
                
                const whr = measurement.waist_circumference && measurement.hip_circumference
                  ? calculateWaistToHipRatio(measurement.waist_circumference, measurement.hip_circumference)
                  : null;

                const bodyFat = measurement.body_fat_navy || measurement.body_fat_manual;

                return (
                  <TableRow key={measurement.id}>
                    <TableCell className="font-medium">
                      {format(new Date(measurement.measurement_date), 'dd.MM.yyyy', { locale: hr })}
                    </TableCell>
                    <TableCell>{measurement.weight || '-'}</TableCell>
                    <TableCell>{measurement.height || '-'}</TableCell>
                    <TableCell>
                      {bmi ? (
                        <Badge variant="outline">{bmi}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {bodyFat ? (
                        <div>
                          {bodyFat}%
                          {measurement.body_fat_navy && (
                            <span className="text-xs text-muted-foreground ml-1">(Navy)</span>
                          )}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{measurement.lean_body_mass || '-'}</TableCell>
                    <TableCell>{measurement.fat_mass || '-'}</TableCell>
                    <TableCell>{measurement.waist_circumference || '-'}</TableCell>
                    <TableCell>{measurement.hip_circumference || '-'}</TableCell>
                    <TableCell>
                      {whr ? (
                        <Badge variant="outline">{whr}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{measurement.neck_circumference || '-'}</TableCell>
                    <TableCell>{measurement.digit_ratio_2d4d || '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
