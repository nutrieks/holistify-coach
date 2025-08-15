import { useAuth } from '@/hooks/useAuth';
import { useClientDashboard } from '@/hooks/useClientDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, MessageSquare, TrendingUp, CheckCircle, Apple, Dumbbell, Clock, Users, FileText, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingCard } from '@/components/LoadingCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ClientNAQDashboard } from '@/components/naq/ClientNAQDashboard';

const ClientDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    todaysMeals,
    todaysWorkout,
    todaysHabits,
    progressData,
    unreadCount,
    mealPlanLevel,
    weeklyFocus,
    weeklyHabits,
    weeklyRecipes,
    isLoading,
    toggleHabit,
  } = useClientDashboard();

  // Check for pending questionnaires
  const { data: pendingQuestionnaire } = useQuery({
    queryKey: ['pending-questionnaire', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null

      // First get client record to see if they have an initial questionnaire
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('initial_questionnaire_id, questionnaires(id, title, description)')
        .eq('client_id', profile.id)
        .single()

      if (clientError || !clientData?.initial_questionnaire_id) return null

      // Check if they've already submitted it
      const { data: submission, error: submissionError } = await supabase
        .from('client_submissions')
        .select('id')
        .eq('client_id', profile.id)
        .eq('questionnaire_id', clientData.initial_questionnaire_id)
        .single()

      if (submissionError && submissionError.code !== 'PGRST116') throw submissionError
      
      // If no submission exists, return the questionnaire
      if (!submission) {
        return clientData.questionnaires
      }
      
      return null
    },
    enabled: !!profile?.id
  });

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
              <Button 
                size="sm" 
                onClick={() => navigate(`/questionnaire/${pendingQuestionnaire.id}`)}
                className="ml-4 shrink-0"
              >
                <FileText className="mr-2 h-4 w-4" />
                Ispuni sada
              </Button>
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
              {/* Plan Level Indicator */}
              {mealPlanLevel && (
                <div className="mb-4 p-2 bg-muted rounded-lg">
                  <Badge variant="secondary" className="mb-2">
                    Plan Razine {mealPlanLevel}
                  </Badge>
                  {weeklyFocus && (
                    <p className="text-sm text-muted-foreground">{weeklyFocus}</p>
                  )}
                </div>
              )}

              {/* Level 1: Habits and Recipes */}
              {mealPlanLevel === 1 && (
                <div className="space-y-4">
                  {weeklyHabits.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tjedne navike</h4>
                      <div className="space-y-2">
                        {weeklyHabits.map((habit: any) => (
                          <div key={habit.id} className="p-2 border rounded">
                            <p className="text-sm font-medium">{habit.habit_name}</p>
                            {habit.description && (
                              <p className="text-xs text-muted-foreground">{habit.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {weeklyRecipes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Preporučeni recepti</h4>
                      <div className="space-y-2">
                        {weeklyRecipes.map((recipe: any) => (
                          <div key={recipe.id} className="p-2 border rounded">
                            <p className="text-sm font-medium">{recipe.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Level 2 & 3: Meals */}
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
                                {meal.food_name || meal.recipe_name || meal.category_name} 
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

        {/* NAQ Dashboard Section */}
        {profile?.id && (
          <ClientNAQDashboard clientId={profile.id} />
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Brze akcije</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;