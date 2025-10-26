import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Heart, Clock, TrendingDown, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PsychologicalDataTabProps {
  clientId: string;
}

export default function PsychologicalDataTab({ clientId }: PsychologicalDataTabProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, [clientId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("client_psychological_profile")
        .select("*")
        .eq("client_id", clientId)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading psychological profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Učitavanje psihološkog profila...</div>;
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Psihološki profil nije još kreiran.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Profil se automatski kreira nakon što klijent popuni Inicijalni Coaching Upitnik.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStressColor = (level: string) => {
    switch (level) {
      case "low": return "text-green-600 bg-green-50";
      case "moderate": return "text-yellow-600 bg-yellow-50";
      case "high": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getDeficitColor = (speed: string) => {
    switch (speed) {
      case "slow": return "text-blue-600 bg-blue-50";
      case "moderate": return "text-yellow-600 bg-yellow-50";
      case "fast": return "text-orange-600 bg-orange-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getMotivationColor = (level: string) => {
    switch (level) {
      case "high": return "text-green-600 bg-green-50";
      case "moderate": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Food Relationship Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Odnos sa Hranom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Food Relationship Score</span>
                <span className="font-bold">{profile.food_relationship_score?.toFixed(1)} / 10</span>
              </div>
              <Progress value={(profile.food_relationship_score || 0) * 10} className="h-3" />
            </div>
            <p className="text-sm text-muted-foreground">
              {profile.food_relationship_score >= 7 
                ? "Odličan odnos sa hranom - nizak rizik od relapsa" 
                : profile.food_relationship_score >= 4
                ? "Umjeren odnos sa hranom - potreban oprez i educira"
                : "Problematičan odnos sa hranom - preporučen sporiji pristup"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stress & Motivation */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Razina Stresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm">Trenutna Razina:</span>
              <Badge className={getStressColor(profile.stress_level || "moderate")}>
                {(profile.stress_level || "moderate").toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {profile.stress_level === "high" && "Visoka razina stresa može utjecati na rezultate. Preporuča se sporiji pristup."}
              {profile.stress_level === "moderate" && "Umjerena razina stresa - potrebno pratiti i prilagoditi po potrebi."}
              {profile.stress_level === "low" && "Niska razina stresa - idealni uvjeti za agresivniji pristup."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Motivacija
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm">Razina Motivacije:</span>
              <Badge className={getMotivationColor(profile.motivation_level || "moderate")}>
                {(profile.motivation_level || "moderate").toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {profile.motivation_level === "high" && "Visoka motivacija - klijent je spreman za izazove."}
              {profile.motivation_level === "moderate" && "Umjerena motivacija - potrebno održavati angažman."}
              {profile.motivation_level === "low" && "Niska motivacija - potreban pažljiviji pristup sa čestim check-inovima."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Diet History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Povijest Dijeta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm">Broj Prethodnih Dijeta:</span>
            <Badge variant={profile.diet_history_complexity >= 5 ? "destructive" : "secondary"}>
              {profile.diet_history_complexity || 0}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {profile.diet_history_complexity >= 5 
              ? "Ekstenzivna povijest dijeta - potreban oprezniji pristup kako bi se izbjegao jo-jo efekt." 
              : profile.diet_history_complexity >= 2
              ? "Umjerena povijest dijeta - potreban individualizirani pristup."
              : "Ograničena povijest dijeta - lakše je postići rezultate."}
          </p>
        </CardContent>
      </Card>

      {/* Recommended Deficit Speed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Preporučena Brzina Deficita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm">Preporučena Brzina:</span>
            <Badge className={getDeficitColor(profile.recommended_deficit_speed || "moderate")}>
              {(profile.recommended_deficit_speed || "moderate").toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {profile.recommended_deficit_speed === "slow" && "Sporiji deficit (10-15%) preporučen zbog psiholoških faktora. Fokus na održivost."}
            {profile.recommended_deficit_speed === "moderate" && "Umjereni deficit (15-20%) - balans između brzine i održivosti."}
            {profile.recommended_deficit_speed === "fast" && "Brži deficit (20-25%) - klijent može podnijeti agresivniji pristup."}
          </p>
        </CardContent>
      </Card>

      {/* Mental Priorities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Mentalni Prioriteti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile.mental_priorities && Array.isArray(profile.mental_priorities) && profile.mental_priorities.length > 0 ? (
              profile.mental_priorities.map((priority: string, idx: number) => (
                <Badge key={idx} variant="outline">
                  {priority}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nema definiranih prioriteta.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Dostupnost Vremena
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm">Tjedno Dostupno Vrijeme:</span>
            <Badge variant="secondary">
              {profile.time_availability_minutes ? `${profile.time_availability_minutes} min` : "N/A"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {profile.time_availability_minutes >= 300 && "Odlična dostupnost - može se fokusirati na kompleksnije strategije."}
            {profile.time_availability_minutes >= 150 && profile.time_availability_minutes < 300 && "Umjerena dostupnost - potrebne jednostavnije strategije."}
            {profile.time_availability_minutes < 150 && "Ograničena dostupnost - potrebne brze i praktične strategije."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
