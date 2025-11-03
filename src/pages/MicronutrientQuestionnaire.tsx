import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MicronutrientQuestionnaireForm } from "@/components/micronutrient/MicronutrientQuestionnaireForm";
import { MicronutrientResultsView } from "@/components/micronutrient/MicronutrientResultsView";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useMicronutrientResults } from "@/hooks/useMicronutrientResults";

export default function MicronutrientQuestionnaire() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: results } = useMicronutrientResults(userId || undefined);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  const hasResults = results && results.results && results.results.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/client-dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Povratak
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Mikronutritivna Dijagnostika</h1>
            <p className="text-muted-foreground">Procjena rizika deficita 27 mikronutrijenata</p>
          </div>
        </div>

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
