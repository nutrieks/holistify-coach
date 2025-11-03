import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMicronutrientResults } from "@/hooks/useMicronutrientResults";
import { LoadingCard } from "@/components/LoadingCard";
import { AlertCircle, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface MicronutrientResultsViewProps {
  clientId: string;
}

export const MicronutrientResultsView = ({ clientId }: MicronutrientResultsViewProps) => {
  const { data, isLoading } = useMicronutrientResults(clientId);

  if (isLoading) return <LoadingCard />;

  if (!data || !data.results.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mikronutritivna Dijagnostika</CardTitle>
          <CardDescription>Nema dostupnih rezultata</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getRiskIcon = (category: string) => {
    switch (category) {
      case 'none': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'low': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'moderate': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'high': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getRiskLabel = (category: string) => {
    switch (category) {
      case 'none': return 'Bez rizika';
      case 'low': return 'Nizak rizik';
      case 'moderate': return 'Umjeren rizik';
      case 'high': return 'Visok rizik';
      default: return category;
    }
  };

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'none': return 'bg-green-100 text-green-800 border-green-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      default: return '';
    }
  };

  // Categorize results
  const highRisk = data.results.filter(r => r.risk_category === 'high');
  const moderateRisk = data.results.filter(r => r.risk_category === 'moderate');
  const lowRisk = data.results.filter(r => r.risk_category === 'low');
  const noRisk = data.results.filter(r => r.risk_category === 'none');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sažetak Mikronutritivne Dijagnostike</CardTitle>
          <CardDescription>
            Analizirano: {data.results.length} nutrijenata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{highRisk.length}</div>
              <div className="text-sm text-muted-foreground">Visok rizik</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{moderateRisk.length}</div>
              <div className="text-sm text-muted-foreground">Umjeren rizik</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{lowRisk.length}</div>
              <div className="text-sm text-muted-foreground">Nizak rizik</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{noRisk.length}</div>
              <div className="text-sm text-muted-foreground">Bez rizika</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detaljni Rezultati po Nutrijentima</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.results.map((result) => (
              <div key={result.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(result.risk_category)}
                    <h3 className="font-semibold">{result.nutrient_name}</h3>
                  </div>
                  <Badge className={getRiskColor(result.risk_category)}>
                    {getRiskLabel(result.risk_category)}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Finalni Skor (FPS)</span>
                      <span className="font-medium">{result.final_weighted_score.toFixed(1)}%</span>
                    </div>
                    <Progress value={result.final_weighted_score} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Unos</div>
                      <div className="font-medium">{result.intake_score_percentage.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Simptomi</div>
                      <div className="font-medium">{result.symptom_score_percentage.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Rizik</div>
                      <div className="font-medium">{result.risk_score_percentage.toFixed(1)}%</div>
                    </div>
                  </div>

                  {result.contributing_factors && Array.isArray(result.contributing_factors) && result.contributing_factors.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm text-muted-foreground mb-1">Faktori rizika:</div>
                      <div className="flex flex-wrap gap-1">
                        {(result.contributing_factors as string[]).map((factor: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
