import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { NAQResults, NAQScoringEngine } from "@/utils/naqScoringEngine";
import { Heart, TrendingUp, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NAQClientResultsProps {
  results: NAQResults;
  submissionDate?: string;
  onRetakeQuestionnaire?: () => void;
}

export function NAQClientResults({ results, submissionDate, onRetakeQuestionnaire }: NAQClientResultsProps) {
  const navigate = useNavigate();

  const getMotivationalMessage = (burden: number) => {
    if (burden >= 1.5) {
      return "Vaši rezultati pokazuju područja koja trebaju pažnju. Vaš trener će s vama razraditi personalizirani plan.";
    }
    if (burden >= 1.0) {
      return "Vaše zdravlje je na dobrom putu! Postoji prostor za poboljšanje u nekoliko područja.";
    }
    return "Odličan rezultat! Vaše tijelo funkcionira vrlo dobro. Nastavite s ovim navikama!";
  };

  const getProgressColor = (burden: number) => {
    if (burden >= 1.5) return "text-destructive";
    if (burden >= 1.0) return "text-warning";
    return "text-success";
  };

  const topConcerns = results.scores
    .filter(score => score.priorityLevel !== 'low')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Vaši NAQ rezultati
          </CardTitle>
          {submissionDate && (
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Datum ispunjavanja: {new Date(submissionDate).toLocaleDateString('hr-HR')}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getProgressColor(results.overallBurden)}`}>
                {results.overallBurden.toFixed(1)}
              </div>
              <p className="text-muted-foreground">
                {getMotivationalMessage(results.overallBurden)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Areas to Focus */}
      {topConcerns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ključna područja za poboljšanje
            </CardTitle>
            <CardDescription>
              Vaš trener će se usredotočiti na ova područja u vašem planu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topConcerns.map((concern, index) => (
                <div key={concern.sectionName} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{concern.sectionName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Opterećenje: {concern.symptomBurden}
                      </p>
                    </div>
                  </div>
                  <Badge variant={concern.priorityLevel === 'high' ? 'destructive' : 'secondary'}>
                    {NAQScoringEngine.getPriorityLabel(concern.priorityLevel)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simple Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Pregled svih područja</CardTitle>
          <CardDescription>
            Vaša trenutna situacija po tjelesnim sustavima
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.scores.map((score) => (
              <div key={score.sectionName} className="flex items-center justify-between">
                <span className="text-sm font-medium flex-1">{score.sectionName}</span>
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <Progress 
                    value={(score.symptomBurden / 3) * 100}
                    className="w-20 h-2"
                  />
                  <Badge 
                    variant={score.priorityLevel === 'high' ? 'destructive' : 
                           score.priorityLevel === 'medium' ? 'secondary' : 'outline'}
                    className="min-w-fit text-xs"
                  >
                    {score.symptomBurden.toFixed(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Encouraging Note */}
      <Alert className="border-success/50 bg-success/10">
        <Heart className="h-4 w-4 text-success" />
        <AlertDescription>
          <strong>Dobra vijest!</strong> Vaš trener će koristiti ove rezultate za kreiranje 
          personaliziranog plana koji će poboljšati vaše zdravlje korak po korak. 
          Redovito praćenje napretka pomoći će vam da vidite poboljšanja tijekom vremena.
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={() => navigate('/messages')} className="flex-1">
          Razgovaraj s trenerom
        </Button>
        {onRetakeQuestionnaire && (
          <Button variant="outline" onClick={onRetakeQuestionnaire} className="flex-1">
            Ispuni ponovno
          </Button>
        )}
      </div>
    </div>
  );
}