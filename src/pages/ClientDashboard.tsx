import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, TrendingUp, CheckCircle, Apple, Dumbbell } from 'lucide-react';

const ClientDashboard = () => {
  const { profile, signOut } = useAuth();

  const todaysMeals = [
    { name: "Doručak", completed: true, calories: 350 },
    { name: "Ručak", completed: false, calories: 650 },
    { name: "Večera", completed: false, calories: 500 },
    { name: "Užina", completed: false, calories: 200 }
  ];

  const habits = [
    { name: "2L vode", completed: true, streak: 7 },
    { name: "10,000 koraka", completed: false, current: 6840, target: 10000 },
    { name: "8h sna", completed: true, streak: 3 },
    { name: "Meditacija", completed: false, streak: 2 }
  ];

  const weeklyProgress = {
    weight: { current: 68.5, target: 65, unit: 'kg' },
    workouts: { completed: 3, planned: 4 },
    habits: { completed: 12, total: 20 }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
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
        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Današnji kalorije</CardTitle>
              <Apple className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">350 / 1700</div>
              <Progress value={20.6} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">Još 1350 kcal do cilja</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Današnji trening</CardTitle>
              <Dumbbell className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gornji dio tijela</div>
              <p className="text-xs text-muted-foreground mt-2">Zakazano za 17:00</p>
              <Button size="sm" className="mt-2 w-full">Počni trening</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nove poruke</CardTitle>
              <MessageSquare className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground mt-2">Od vašeg trenera</p>
              <Button variant="outline" size="sm" className="mt-2 w-full">Pogledaj</Button>
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
              <div className="space-y-3">
                {todaysMeals.map((meal, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle 
                        className={`h-5 w-5 ${meal.completed ? 'text-green-600' : 'text-gray-300'}`} 
                      />
                      <div>
                        <p className="font-medium">{meal.name}</p>
                        <p className="text-sm text-muted-foreground">{meal.calories} kcal</p>
                      </div>
                    </div>
                    {meal.completed ? (
                      <Badge variant="secondary">Završeno</Badge>
                    ) : (
                      <Button variant="outline" size="sm">Označi</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Habits */}
          <Card>
            <CardHeader>
              <CardTitle>Današnje navike</CardTitle>
              <CardDescription>Vaše dnevne aktivnosti</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {habits.map((habit, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle 
                        className={`h-5 w-5 ${habit.completed ? 'text-green-600' : 'text-gray-300'}`} 
                      />
                      <div>
                        <p className="font-medium">{habit.name}</p>
                        {habit.current && habit.target && (
                          <p className="text-sm text-muted-foreground">
                            {habit.current.toLocaleString()} / {habit.target.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {habit.streak && (
                        <Badge variant="outline">{habit.streak} dana</Badge>
                      )}
                      {!habit.completed && (
                        <Button variant="outline" size="sm">Označi</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                  {weeklyProgress.weight.current} {weeklyProgress.weight.unit}
                </div>
                <p className="text-sm text-muted-foreground">Trenutna težina</p>
                <p className="text-xs text-muted-foreground">
                  Cilj: {weeklyProgress.weight.target} {weeklyProgress.weight.unit}
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {weeklyProgress.workouts.completed}/{weeklyProgress.workouts.planned}
                </div>
                <p className="text-sm text-muted-foreground">Treninzi završeni</p>
                <Progress 
                  value={(weeklyProgress.workouts.completed / weeklyProgress.workouts.planned) * 100} 
                  className="mt-2"
                />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {weeklyProgress.habits.completed}/{weeklyProgress.habits.total}
                </div>
                <p className="text-sm text-muted-foreground">Navike završene</p>
                <Progress 
                  value={(weeklyProgress.habits.completed / weeklyProgress.habits.total) * 100} 
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Brze akcije</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Check-in</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Planovi</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm">Chat</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Napredak</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;