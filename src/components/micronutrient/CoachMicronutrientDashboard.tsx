import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingCard } from "@/components/LoadingCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

export const CoachMicronutrientDashboard = () => {
  const navigate = useNavigate();

  const { data: clientResults, isLoading } = useQuery({
    queryKey: ['coach-micronutrient-overview'],
    queryFn: async () => {
      // Get all completed submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from('client_micronutrient_submissions')
        .select('id, client_id, completed_at')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (submissionsError) throw submissionsError;
      if (!submissions || submissions.length === 0) return [];

      // Get client info
      const clientIds = [...new Set(submissions.map(s => s.client_id))];
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, user_id, full_name, email')
        .in('user_id', clientIds);

      if (clientsError) throw clientsError;

      // Map clients by client_id (not user_id)
      const clientsMap = new Map(clients?.map(c => [c.user_id, c]) || []);

      // For each submission, get result summary
      const enrichedData = await Promise.all(
        submissions.map(async (submission) => {
          const { data: results } = await supabase
            .from('client_micronutrient_results')
            .select('risk_category')
            .eq('submission_id', submission.id);

          const high = results?.filter(r => r.risk_category === 'high').length || 0;
          const moderate = results?.filter(r => r.risk_category === 'moderate').length || 0;
          const low = results?.filter(r => r.risk_category === 'low').length || 0;
          const none = results?.filter(r => r.risk_category === 'none').length || 0;

          const client = clientsMap.get(submission.client_id);

          return {
            ...submission,
            client,
            riskSummary: { high, moderate, low, none }
          };
        })
      );

      return enrichedData;
    }
  });

  if (isLoading) return <LoadingCard />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mikronutritivna Dijagnostika - Pregled Klijenata</CardTitle>
        <CardDescription>
          Prikaz svih dovršenih mikronutritivnih analiza
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clientResults && clientResults.length > 0 ? (
            clientResults.map((result) => (
              <div
                key={result.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{result.client?.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{result.client?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dovršeno: {new Date(result.completed_at).toLocaleDateString('hr-HR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      {result.riskSummary.high > 0 && (
                        <Badge variant="destructive">
                          {result.riskSummary.high} visok
                        </Badge>
                      )}
                      {result.riskSummary.moderate > 0 && (
                        <Badge className="bg-orange-100 text-orange-800">
                          {result.riskSummary.moderate} umjeren
                        </Badge>
                      )}
                      {result.riskSummary.low > 0 && (
                        <Badge variant="secondary">
                          {result.riskSummary.low} nizak
                        </Badge>
                      )}
                      {result.riskSummary.none > 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          {result.riskSummary.none} bez rizika
                        </Badge>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/admin/clients/${result.client?.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Pogledaj
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nema dovršenih mikronutritivnih analiza
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
