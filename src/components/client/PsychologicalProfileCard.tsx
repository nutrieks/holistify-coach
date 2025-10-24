import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PsychologicalProfileCardProps {
  clientId: string;
}

export default function PsychologicalProfileCard({ clientId }: PsychologicalProfileCardProps) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['psychological-profile', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_psychological_profile')
        .select('*')
        .eq('client_id', clientId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Učitavanje psihološkog profila...</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Psihološki Profil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-2">Psihološki profil još nije kreiran.</p>
            <p className="text-sm text-muted-foreground">
              Profil će biti automatski generiran nakon što klijent ispuni Inicijalni Coaching Upitnik.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStressColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/10 text-green-500';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-500';
      case 'high': return 'bg-red-500/10 text-red-500';
      default: return 'bg-muted';
    }
  };

  const getDeficitSpeedColor = (speed: string) => {
    switch (speed) {
      case 'slow': return 'bg-green-500/10 text-green-500';
      case 'moderate': return 'bg-blue-500/10 text-blue-500';
      case 'fast': return 'bg-orange-500/10 text-orange-500';
      default: return 'bg-muted';
    }
  };

  const getFoodRelationshipLabel = (score: number) => {
    if (score >= 8) return { text: 'Izvrsno', color: 'text-green-500' };
    if (score >= 6) return { text: 'Dobro', color: 'text-blue-500' };
    if (score >= 4) return { text: 'Umjereno', color: 'text-yellow-500' };
    return { text: 'Izazovno', color: 'text-red-500' };
  };

  const foodRelationship = profile.food_relationship_score 
    ? getFoodRelationshipLabel(profile.food_relationship_score)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Psihološki Profil
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generiran iz Inicijalnog Coaching Upitnika
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Food Relationship Score */}
        {profile.food_relationship_score !== null && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Odnos prema Hrani</p>
              <Badge variant="outline" className={foodRelationship?.color}>
                {foodRelationship?.text}
              </Badge>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-xs text-muted-foreground">Score</span>
                <span className="text-xl font-bold">{profile.food_relationship_score}/10</span>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
                <div
                  style={{ width: `${(profile.food_relationship_score / 10) * 100}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    profile.food_relationship_score >= 7 ? 'bg-green-500' :
                    profile.food_relationship_score >= 4 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Stress Level */}
        {profile.stress_level && (
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Razina Stresa</p>
              <p className="text-xl font-semibold capitalize">{profile.stress_level}</p>
            </div>
            <Badge className={getStressColor(profile.stress_level)}>
              {profile.stress_level === 'low' ? 'Niska' : 
               profile.stress_level === 'moderate' ? 'Umjerena' : 
               'Visoka'}
            </Badge>
          </div>
        )}

        {/* Diet History Complexity */}
        {profile.diet_history_complexity !== null && (
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Povijest Dijeta</p>
              <p className="text-xl font-semibold">
                {profile.diet_history_complexity === 0 
                  ? 'Nikada' 
                  : `${profile.diet_history_complexity} ${profile.diet_history_complexity === 1 ? 'put' : 'puta'}`
                }
              </p>
            </div>
            {profile.diet_history_complexity > 5 && (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                Yo-Yo efekt
              </Badge>
            )}
          </div>
        )}

        {/* Mental Priorities */}
        {profile.mental_priorities && Array.isArray(profile.mental_priorities) && profile.mental_priorities.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-3">Mentalni Prioriteti</p>
            <div className="flex flex-wrap gap-2">
              {profile.mental_priorities.map((priority: string, idx: number) => (
                <Badge key={idx} variant="secondary">
                  {priority}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Deficit Speed */}
        {profile.recommended_deficit_speed && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Preporučena Brzina Deficita</p>
              </div>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold capitalize">
                  {profile.recommended_deficit_speed === 'slow' ? 'Spora (10-15%)' :
                   profile.recommended_deficit_speed === 'moderate' ? 'Umjerena (15-20%)' :
                   'Brza (20-25%)'}
                </p>
                <Badge className={getDeficitSpeedColor(profile.recommended_deficit_speed)}>
                  {profile.recommended_deficit_speed.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {profile.recommended_deficit_speed === 'slow' 
                  ? 'Spor pristup minimizira stres i omogućava održivo pridržavanje.' 
                  : profile.recommended_deficit_speed === 'moderate'
                  ? 'Umjeren pristup balansira brzinu i održivost.'
                  : 'Brži pristup za motivirane klijente sa visokom komplijancijom.'}
              </p>
            </div>
          </div>
        )}

        {/* Motivation Level */}
        {profile.motivation_level && (
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Razina Motivacije</p>
              <p className="text-xl font-semibold capitalize">{profile.motivation_level}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
