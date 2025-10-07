import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNAQResults, useClientNAQHistory } from "@/hooks/useNAQScoring";
import { useNAQProgress } from "@/hooks/useNAQProgress";
import { NAQClientResults } from "./NAQClientResults";
import { NAQProgressChart } from "./NAQProgressChart";
import { AssignQuestionnaireModal } from "@/components/AssignQuestionnaireModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, TrendingUp, AlertTriangle, Send } from "lucide-react";
import { format } from "date-fns";
import { hr } from "date-fns/locale";
import { useState } from "react";

interface ClientNAQDashboardProps {
  clientId: string;
}

export function ClientNAQDashboard({ clientId }: ClientNAQDashboardProps) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  const { data: naqProgress, isLoading: isLoadingProgress } = useNAQProgress(clientId);
  
  const { data: latestSubmission, isLoading: isLoadingSubmission } = useQuery({
    queryKey: ['latest-naq-submission', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_submissions')
        .select('id, created_at, submitted_at, questionnaire_id')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: naqHistory = [] } = useClientNAQHistory(clientId);

  const renderStatusBadge = () => {
    if (!naqProgress) return null;

    switch (naqProgress.status) {
      case 'not_sent':
        return <Badge variant="destructive">Nije poslano</Badge>;
      case 'sent':
        return (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Poslano</Badge>
            <span className="text-xs text-muted-foreground">
              {naqProgress.assignedAt && format(new Date(naqProgress.assignedAt), 'dd.MM.yyyy', { locale: hr })}
            </span>
          </div>
        );
      case 'in_progress':
        return (
          <div className="flex items-center gap-3">
            <Badge variant="default">U tijeku</Badge>
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <Progress value={naqProgress.percentage} className="flex-1" />
              <span className="text-sm font-medium">{naqProgress.percentage}%</span>
            </div>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-500">Završeno</Badge>
            <span className="text-xs text-muted-foreground">
              {naqProgress.completedAt && format(new Date(naqProgress.completedAt), 'dd.MM.yyyy', { locale: hr })}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoadingSubmission || isLoadingProgress) {
    return <div className="text-center py-8">Učitavanje...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>NAQ Status</CardTitle>
            <div className="flex items-center gap-2">
              {renderStatusBadge()}
              {naqProgress?.status === 'not_sent' && (
                <Button onClick={() => setIsAssignModalOpen(true)} size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Zatraži NAQ
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {naqProgress?.status === 'completed' && latestSubmission ? (
          <NAQResultsSection latestSubmission={latestSubmission} naqHistory={naqHistory} />
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {naqProgress?.status === 'not_sent' && 'NAQ upitnik još nije poslan klijentu.'}
              {naqProgress?.status === 'sent' && 'Klijent još nije započeo ispunjavanje NAQ upitnika.'}
              {naqProgress?.status === 'in_progress' && `Klijent je ispunio ${naqProgress.percentage}% upitnika.`}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <AssignQuestionnaireModal
        open={isAssignModalOpen}
        onOpenChange={setIsAssignModalOpen}
        clientId={clientId}
        onQuestionnaireAssigned={() => setIsAssignModalOpen(false)}
      />
    </>
  );
}

function NAQResultsSection({ latestSubmission, naqHistory }: { latestSubmission: any; naqHistory: any[] }) {
  const { data: results, isLoading: isLoadingResults } = useNAQResults(latestSubmission.id);

  if (isLoadingResults) {
    return <div className="text-center py-8">Učitavanje rezultata...</div>;
  }

  if (!results) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>Rezultati se obrađuju...</AlertDescription>
      </Alert>
    );
  }

  const getOverallBurdenStatus = (burden: number) => {
    if (burden < 1) return { label: 'Nizak', color: 'text-green-600', icon: TrendingUp };
    if (burden < 2) return { label: 'Umjeren', color: 'text-yellow-600', icon: AlertTriangle };
    return { label: 'Visok', color: 'text-red-600', icon: AlertTriangle };
  };

  const burdenStatus = getOverallBurdenStatus(results.overallBurden);
  const BurdenIcon = burdenStatus.icon;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sažetak NAQ Rezultata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <BurdenIcon className={`h-6 w-6 ${burdenStatus.color}`} />
              <div>
                <p className="text-sm text-muted-foreground">Ukupno Opterećenje</p>
                <p className={`text-2xl font-bold ${burdenStatus.color}`}>
                  {results.overallBurden.toFixed(2)} - {burdenStatus.label}
                </p>
              </div>
            </div>
            {results.primaryConcerns.length > 0 && (
              <Badge variant="destructive">{results.primaryConcerns.length} prioritetnih područja</Badge>
            )}
          </div>

          {results.primaryConcerns.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Primarni Problemi:</h4>
              <div className="space-y-2">
                {results.primaryConcerns.map((concern, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="font-medium">{concern.sectionName}</span>
                    <Badge variant="destructive">{Math.round(concern.symptomBurden * 100)}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {naqHistory.length > 0 && <NAQProgressChart data={naqHistory} title="NAQ Napredak" />}

      <NAQClientResults results={results} />
    </>
  );
}
