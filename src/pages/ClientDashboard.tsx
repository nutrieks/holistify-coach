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
import { ContractProgressBar } from '@/components/ContractProgressBar';
import { useToast } from '@/hooks/use-toast';

const ClientDashboard = () => {
  const { profile } = useAuth();
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


  // Check for assigned questionnaires count
  const { data: assignedCount } = useQuery({
    queryKey: ['assigned-count', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return 0;
      
      const { count: standardCount } = await supabase
        .from('assigned_questionnaires')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', profile.id)
        .neq('status', 'completed');
      
      const { count: microCount } = await supabase
        .from('assigned_micronutrient_questionnaires')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', profile.id)
        .neq('status', 'completed');
      
      return (standardCount || 0) + (microCount || 0);
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Contract Progress Bar */}
      {profile?.id && (
        <Card className="card-neon">
          <CardHeader>
            <CardTitle>Trajanje suradnje</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractProgressBar clientId={profile.id} showLabel={true} />
          </CardContent>
        </Card>
      )}


      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-neon">
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

        <Card className="card-neon">
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

        <Card className="card-neon">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nove poruke</CardTitle>
              <MessageSquare className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {unreadCount ? 'Od vašeg savjetnika' : 'Nema novih poruka'}
              </p>
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => navigate('/messages')}>
                {unreadCount ? 'Pogledaj' : 'Otvori chat'}
              </Button>
            </CardContent>
        </Card>

        <Card className="card-neon">
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
        <Card className="card-neon">
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
        <Card className="card-neon">
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
      <Card className="card-neon">
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

      {/* Questionnaires CTA */}
      <Card className="card-neon">
          <CardHeader>
            <CardTitle>Upitnici</CardTitle>
            <CardDescription>Pristupite dodijeljenim upitnicima</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {assignedCount && assignedCount > 0 ? (
                    <>Imate <span className="font-semibold text-primary">{assignedCount}</span> {assignedCount === 1 ? 'upitnik' : 'upitnika'} za ispunjavanje</>
                  ) : (
                    'Trenutno nemate dodijeljenih upitnika'
                  )}
                </p>
              </div>
              <Button onClick={() => navigate('/forms')}>
                <FileText className="mr-2 h-4 w-4" />
                Moji Upitnici
              </Button>
            </div>
          </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="card-neon">
          <CardHeader>
            <CardTitle>Brze akcije</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate('/check-in')}>
              <ClipboardCheck className="h-8 w-8 mb-2" />
              <span className="font-medium">Check-in</span>
              <span className="text-xs text-muted-foreground">Ažurirajte napredak</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate('/my-progress')}>
              <BarChart3 className="h-8 w-8 mb-2" />
              <span className="font-medium">Moj napredak</span>
              <span className="text-xs text-muted-foreground">Pregledajte statistiku</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate('/forms')}>
              <FileText className="h-8 w-8 mb-2" />
              <span className="font-medium">Upitnici</span>
              <span className="text-xs text-muted-foreground">Pristupite upitnicima</span>
            </Button>
          </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;