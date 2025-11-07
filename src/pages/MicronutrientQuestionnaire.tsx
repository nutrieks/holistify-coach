import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Info, AlertTriangle } from "lucide-react";
import { MicronutrientQuestionnaireForm } from "@/components/micronutrient/MicronutrientQuestionnaireForm";
import { MicronutrientResultsView } from "@/components/micronutrient/MicronutrientResultsView";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useMicronutrientResults } from "@/hooks/useMicronutrientResults";
import { useQuery } from "@tanstack/react-query";

export default function MicronutrientQuestionnaire() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: results } = useMicronutrientResults(userId || undefined);

  // Check if questionnaire is assigned to the client
  const { data: assignment, isLoading: assignmentLoading } = useQuery({
    queryKey: ['micronutrient-assignment', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assigned_micronutrient_questionnaires')
        .select('*, micronutrient_questionnaires(*)')
        .eq('client_id', userId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      } else {
        navigate('/auth');
      }
      setLoading(false);
    });
  }, [navigate]);

  if (loading || assignmentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  // If no assignment found, show message
  if (!assignment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl py-8 space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/client')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Povratak
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Upitnik nije dodijeljen</AlertTitle>
            <AlertDescription>
              Mikronutritivna analiza vam još nije dodijeljena od strane vašeg coacha. 
              Molimo kontaktirajte coacha kako bi vam dodijelio upitnik.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const hasResults = results && results.results && results.results.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/client')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Povratak
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Mikronutritivna Dijagnostika</h1>
            <p className="text-muted-foreground">Procjena rizika deficita 27 mikronutrijenata</p>
          </div>
        </div>

        {!hasResults && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>O ovoj analizi</AlertTitle>
            <AlertDescription>
              Ova analiza procjenjuje rizik deficita 27 ključnih mikronutrijenata kroz pitanja o:
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Vašoj prehrani i prehrambenim navikama</li>
                <li>Simptomima koji mogu ukazivati na deficite</li>
                <li>Životnim navikama i faktorima rizika</li>
              </ul>
              <p className="mt-3 font-medium">
                ⏱️ Upitnik traje ~15-20 minuta. Vaš napredak se automatski sprema.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {hasResults ? (
          <div className="space-y-6">
            <MicronutrientResultsView clientId={userId} />
            
            <Card>
              <CardHeader>
                <CardTitle>Želite popuniti novi upitnik?</CardTitle>
                <CardDescription>
                  Možete pratiti svoj napredak kroz vrijeme popunjavanjem upitnika periodično
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => window.location.reload()}>
                  Započni novi upitnik
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <MicronutrientQuestionnaireForm 
            clientId={userId}
            onComplete={() => {
              // Reload to show results
              window.location.reload();
            }}
          />
        )}
      </div>
    </div>
  );
}
