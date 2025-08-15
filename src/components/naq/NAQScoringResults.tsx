import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NAQResults, NAQScoringEngine } from "@/utils/naqScoringEngine";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface NAQScoringResultsProps {
  results: NAQResults;
  clientName?: string;
}

export function NAQScoringResults({ results, clientName }: NAQScoringResultsProps) {
  const getOverallBurdenColor = (burden: number) => {
    if (burden >= 1.5) return "hsl(var(--destructive))";
    if (burden >= 1.0) return "hsl(var(--warning))";
    return "hsl(var(--success))";
  };

  const getOverallBurdenStatus = (burden: number) => {
    if (burden >= 1.5) return "Značajno opterećenje simptomima";
    if (burden >= 1.0) return "Umjereno opterećenje simptomima";
    return "Minimalno opterećenje simptomima";
  };

  return (
    <div className="space-y-6">
      {/* Overall Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Ukupna procjena NAQ rezultata
            {clientName && <span className="text-muted-foreground">- {clientName}</span>}
          </CardTitle>
          <CardDescription>
            Sveobuhvatni pregled opterećenja simptomima prema hijerarhiji "Temelja zdravlja"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Ukupno opterećenje simptomima</span>
                <span className="text-2xl font-bold" style={{ color: getOverallBurdenColor(results.overallBurden) }}>
                  {results.overallBurden.toFixed(2)}
                </span>
              </div>
              <Progress 
                value={(results.overallBurden / 3) * 100} 
                className="h-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {getOverallBurdenStatus(results.overallBurden)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Concerns */}
      {results.primaryConcerns.length > 0 && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Prioritni sustavi za liječenje:</strong>
            <div className="mt-2 space-y-1">
              {results.primaryConcerns.map((concern, index) => (
                <div key={concern.sectionName} className="flex items-center gap-2">
                  <span className="font-medium">{index + 1}.</span>
                  <span>{concern.sectionName}</span>
                  <Badge variant="destructive">
                    Opterećenje: {concern.symptomBurden}
                  </Badge>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Hierarchy Recommendations */}
      {results.hierarchyRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Preporuke liječenja prema hijerarhiji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.hierarchyRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Detaljni rezultati po sustavima</CardTitle>
          <CardDescription>
            Opterećenje simptomima za svaki tjelesni sustav
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.scores.map((score) => (
              <div key={score.sectionName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{score.sectionName}</span>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={score.priorityLevel === 'high' ? 'destructive' : 
                             score.priorityLevel === 'medium' ? 'secondary' : 'outline'}
                    >
                      {NAQScoringEngine.getPriorityLabel(score.priorityLevel)}
                    </Badge>
                    <span className="text-lg font-semibold">
                      {score.symptomBurden}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(score.symptomBurden / 3) * 100}
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-muted-foreground min-w-fit">
                    {score.totalScore}/{score.maxPossibleScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}