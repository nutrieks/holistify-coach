import { useAuth } from '@/hooks/useAuth';
import { useClientDashboard } from '@/hooks/useClientDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, MessageSquare, TrendingUp, CheckCircle, Apple, Dumbbell, Clock, Users, FileText, AlertCircle, ClipboardCheck, BarChart3, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingCard } from '@/components/LoadingCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ClientNAQDashboard } from '@/components/naq/ClientNAQDashboard';
import { ContractProgressBar } from '@/components/ContractProgressBar';
import { useMicronutrientResults } from '@/hooks/useMicronutrientResults';
import { useToast } from '@/hooks/use-toast';

const ClientDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    todaysMeals,
    todaysWorkout,
    todaysHabits,
    progressData,
    unreadCount,
    isLoading,
    toggleHabit,
  } = useClientDashboard();

  // Get micronutrient results
  const { data: micronutrientData } = useMicronutrientResults(profile?.id);

  // Check for pending questionnaires and NAQ status
  const { data: pendingQuestionnaire } = useQuery({
    queryKey: ['pending-questionnaire', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null

      // Check if questionnaire was skipped
      const skippedQuestionnaires = JSON.parse(localStorage.getItem(`skipped-questionnaires-${profile.id}`) || '[]');

      // Try to find a default NAQ or active questionnaire
      // Note: clients table doesn't have initial_questionnaire_id
      console.log('No initial questionnaire assigned, checking for default NAQ...')
      
      const { data: defaultNAQ, error: naqError } = await supabase
        .from('questionnaires')
        .select('id, title, description')
        .ilike('title', '%NAQ%')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (naqError || !defaultNAQ) {
        console.log('No default NAQ found')
        return null
      }

      // Check if this default NAQ was skipped
      if (skippedQuestionnaires.includes(defaultNAQ.id)) return null

      // Check if they've already submitted the default NAQ
      const { data: naqSubmission, error: naqSubmissionError } = await supabase
        .from('client_submissions')
        .select('id')
        .eq('client_id', profile.id)
        .eq('questionnaire_id', defaultNAQ.id)
        .single()

      if (naqSubmissionError && naqSubmissionError.code !== 'PGRST116') throw naqSubmissionError
      
      // If no submission exists, return the default NAQ
      if (!naqSubmission) {
        console.log('Found default NAQ for user:', defaultNAQ)
        return defaultNAQ
      }
      
      return null
    },
    enabled: !!profile?.id
  });

  // Get all available questionnaires for the client
  const { data: allQuestionnaires } = useQuery({
    queryKey: ['client-questionnaires', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return []

      let questionnaires: any[] = []

      // Get all active questionnaires (clients table doesn't have coach_id)
      // Just get active questionnaires
      const { data: activeQuestionnaires, error: questError } = await supabase
        .from('questionnaires')
        .select('id, title, description, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!questError && activeQuestionnaires) {
        questionnaires = activeQuestionnaires;
      }

      // Get submission status for each questionnaire
      const questionnairesWithStatus = await Promise.all(
        questionnaires.map(async (q) => {
          const { data: submission } = await supabase
            .from('client_submissions')
            .select('id, created_at')
            .eq('client_id', profile.id)
            .eq('questionnaire_id', q.id)
            .single()

          return {
            ...q,
            completed: !!submission,
            completedAt: submission?.created_at || null
          }
        })
      )

      return questionnairesWithStatus
    },
    enabled: !!profile?.id
  });

  const handleSkipQuestionnaire = (questionnaireId: string) => {
    if (!profile?.id) return
    
    const skippedQuestionnaires = JSON.parse(localStorage.getItem(`skipped-questionnaires-${profile.id}`) || '[]');
    skippedQuestionnaires.push(questionnaireId);
    localStorage.setItem(`skipped-questionnaires-${profile.id}`, JSON.stringify(skippedQuestionnaires));
    
    toast({
      title: "Upitnik odgođen",
      description: "Možete ga ispuniti kasnije kroz 'Moji Upitnici' sekciju."
    });
  };

  // Calculate total calories from today's meals
  const totalCalories = todaysMeals?.reduce((sum, meal) => sum + (meal.calories || 0), 0) || 0;
  const targetCalories = 1700; // This could come from user profile or meal plan

  // Group meals by type
  const mealsByType = todaysMeals?.reduce((acc, meal) => {
    const type = meal.meal_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(meal);
    return acc;
  }, {} as Record<string, typeof todaysMeals>) || {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2"></div>
              </div>
              <div className="h-10 w-20 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LoadingCard lines={6} />
            <LoadingCard lines={4} />
          </div>
          <LoadingCard lines={4} />
          <LoadingCard lines={2} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Moj Dashboard</h1>
            <p className="text-muted-foreground">Dobrodošli, {profile?.full_name}!</p>
          </div>
          <Button variant="outline" onClick={() => signOut()}>
            Odjava
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Contract Progress Bar */}
        {profile?.id && (
          <Card>
            <CardHeader>
              <CardTitle>Trajanje suradnje</CardTitle>
            </CardHeader>
            <CardContent>
              <ContractProgressBar clientId={profile.id} showLabel={true} />
            </CardContent>
          </Card>
        )}

        {/* Pending Questionnaire Alert */}
        {pendingQuestionnaire && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <span className="font-medium">Novi upitnik čeka ispunjavanje: </span>
                <span>{pendingQuestionnaire.title}</span>
                {pendingQuestionnaire.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {pendingQuestionnaire.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleSkipQuestionnaire(pendingQuestionnaire.id)}
                >
                  Preskoči za sada
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => navigate(`/questionnaire/${pendingQuestionnaire.id}`)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Ispuni sada
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Današnji kalorije</CardTitle>
              <Apple className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCalories} / {targetCalories}</div>
              <Progress value={(totalCalories / targetCalories) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {targetCalories - totalCalories > 0 ? 
                  `Još ${targetCalories - totalCalories} kcal do cilja` :
                  'Cilj postignut!'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Današnji trening</CardTitle>
              <Dumbbell className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {todaysWorkout ? (
                <>
                  <div className="text-2xl font-bold">{todaysWorkout.session_name}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {todaysWorkout.exercises.length} vježbi zakazano
                  </p>
                  <Button size="sm" className="mt-2 w-full" onClick={() => navigate('/my-plans')}>
                    Pogledaj detalje
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">Nema treninga</div>
                  <p className="text-xs text-muted-foreground mt-2">Danas nema zakazanih treninga</p>
                  <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => navigate('/my-plans')}>
                    Pogledaj planove
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nove poruke</CardTitle>
              <MessageSquare className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {unreadCount ? 'Od vašeg trenera' : 'Nema novih poruka'}
              </p>
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => navigate('/messages')}>
                {unreadCount ? 'Pogledaj' : 'Otvori chat'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status Suradnje</p>
                  <p className="text-2xl font-bold">Aktivan</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Meals */}
          <Card>
            <CardHeader>
              <CardTitle>Današnji obroci</CardTitle>
              <CardDescription>Vaš plan prehrane za danas</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Meals for today */}
              {todaysMeals && todaysMeals.length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(mealsByType).map(([mealType, meals]) => (
                    <div key={mealType} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium capitalize">{mealType}</p>
                            <div className="text-sm text-muted-foreground">
                              {meals.map((meal, idx) => (
                                <div key={idx}>
                                  {meal.food_name || meal.recipe_name} 
                                  {meal.quantity && ` (${meal.quantity}g)`}
                                  {meal.calories && ` - ${Math.round(meal.calories)} kcal`}
                                </div>
                              ))}
                            </div>
                          </div>
                        <Button variant="outline" size="sm" onClick={() => navigate('/my-plans')}>
                          Detalji
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <p>Nema dodijeljenih obroka za danas</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/my-plans')}>
                    Pogledaj planove
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Habits */}
          <Card>
            <CardHeader>
              <CardTitle>Današnje navike</CardTitle>
              <CardDescription>Vaše dnevne aktivnosti</CardDescription>
            </CardHeader>
            <CardContent>
              {todaysHabits && todaysHabits.length > 0 ? (
                <div className="space-y-3">
                  {todaysHabits.map((habit) => (
                    <div key={habit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={habit.completed}
                          onCheckedChange={(checked) => 
                            toggleHabit(habit.id, checked as boolean)
                          }
                        />
                        <div>
                          <p className="font-medium">{habit.habit_name}</p>
                          {habit.description && (
                            <p className="text-sm text-muted-foreground">{habit.description}</p>
                          )}
                        </div>
                      </div>
                      {habit.completed ? (
                        <Badge variant="secondary">Završeno</Badge>
                      ) : (
                        <Badge variant="outline">Čeka</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <p>Nema dodijeljenih navika za danas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Tjedni napredak</CardTitle>
            <CardDescription>Pregled vaših rezultata ovog tjedna</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {progressData?.weight || '--'} kg
                </div>
                <p className="text-sm text-muted-foreground">Trenutna težina</p>
                <p className="text-xs text-muted-foreground">
                  {progressData?.weight ? 'Zadnje ažuriranje ovog tjedna' : 'Nema podataka'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {progressData?.workouts_completed || 0}
                </div>
                <p className="text-sm text-muted-foreground">Treninzi završeni ovog tjedna</p>
                <Progress 
                  value={((progressData?.workouts_completed || 0) / 4) * 100} 
                  className="mt-2"
                />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {progressData?.habits_completed || 0}
                </div>
                <p className="text-sm text-muted-foreground">Navike završene ovog tjedna</p>
                <Progress 
                  value={((progressData?.habits_completed || 0) / 7) * 100} 
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Questionnaires Section */}
        <Card>
          <CardHeader>
            <CardTitle>Moji Upitnici</CardTitle>
            <CardDescription>Dostupni upitnici i rezultati</CardDescription>
          </CardHeader>
          <CardContent>
            {allQuestionnaires && allQuestionnaires.length > 0 ? (
              <div className="space-y-3">
                {allQuestionnaires.map((questionnaire) => (
                  <div key={questionnaire.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{questionnaire.title}</p>
                      {questionnaire.description && (
                        <p className="text-sm text-muted-foreground">{questionnaire.description}</p>
                      )}
                      {questionnaire.completed && questionnaire.completedAt && (
                        <p className="text-xs text-green-600">
                          Završeno {new Date(questionnaire.completedAt).toLocaleDateString('hr-HR')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {questionnaire.completed ? (
                        <div className="flex gap-2">
                          <Badge variant="secondary">Završeno</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/questionnaire/${questionnaire.id}`)}
                          >
                            Ispuni ponovo
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => navigate(`/questionnaire/${questionnaire.id}`)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Ispuni
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nema dostupnih upitnika</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Micronutrient Analysis Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Mikronutritivna Dijagnostika
            </CardTitle>
            <CardDescription>Procjena rizika deficita mikronutrijenata</CardDescription>
          </CardHeader>
          <CardContent>
            {micronutrientData?.results && micronutrientData.results.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div>
                    <p className="font-medium">Analiza završena</p>
                    <p className="text-sm text-muted-foreground">
                      {micronutrientData.submission?.completed_at 
                        ? `Datum: ${new Date(micronutrientData.submission.completed_at).toLocaleDateString('hr-HR')}`
                        : 'N/A'}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="destructive">
                        {micronutrientData.results.filter(r => r.risk_category === 'high').length} Visok rizik
                      </Badge>
                      <Badge variant="secondary">
                        {micronutrientData.results.filter(r => r.risk_category === 'moderate').length} Umjeren rizik
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/micronutrient-questionnaire')}
                    >
                      Pregled rezultata
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-30 text-purple-600" />
                <p className="font-medium mb-2">Nema mikronutritivne analize</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Ispunite upitnik za procjenu rizika deficita mikronutrijenata
                </p>
                <Button 
                  size="sm"
                  onClick={() => navigate('/micronutrient-questionnaire')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Započni analizu
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* NAQ Dashboard */}
        {profile?.id && (
          <ClientNAQDashboard clientId={profile.id} />
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Brze akcije</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/check-in')}
              >
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Check-in</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/my-plans')}
              >
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Moji Planovi</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/messages')}
              >
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm">Poruke</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/my-progress')}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Moj napredak</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => {
                  console.log('All questionnaires:', allQuestionnaires);
                  console.log('Pending questionnaire:', pendingQuestionnaire);
                  
                  // First try to find NAQ questionnaire in allQuestionnaires
                  let naqQuestionnaire = allQuestionnaires?.find(q => 
                    q.title.toLowerCase().includes('naq') || 
                    q.title.toLowerCase().startsWith('naq')
                  );
                  
                  // If found, use it
                  if (naqQuestionnaire) {
                    navigate(`/questionnaire/${naqQuestionnaire.id}`);
                    return;
                  }
                  
                  // If not found in allQuestionnaires, check pendingQuestionnaire
                  if (pendingQuestionnaire) {
                    const pendingTitle = pendingQuestionnaire.title.toLowerCase();
                    if (pendingTitle.includes('naq') || pendingTitle.startsWith('naq')) {
                      navigate(`/questionnaire/${pendingQuestionnaire.id}`);
                      return;
                    }
                  }
                  
                  // If still not found, use the first available questionnaire as fallback
                  if (allQuestionnaires && allQuestionnaires.length > 0) {
                    console.log('Using first available questionnaire as fallback:', allQuestionnaires[0]);
                    navigate(`/questionnaire/${allQuestionnaires[0].id}`);
                  } else {
                    console.log('No questionnaires found. Available questionnaires:', allQuestionnaires);
                    toast({
                      title: "NAQ nedostupan",
                      description: allQuestionnaires?.length === 0 
                        ? "Nema dostupnih upitnika. NAQ upitnik još nije kreiran u sustavu." 
                        : "NAQ upitnik nije pronađen među dostupnim upitnicima.",
                      variant: "destructive"
                    });
                  }
                }}
              >
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">NAQ Upitnik</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;