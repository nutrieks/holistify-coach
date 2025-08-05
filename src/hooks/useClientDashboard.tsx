import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TodaysMeal {
  id: string;
  meal_type: string;
  food_name?: string;
  recipe_name?: string;
  quantity?: number;
  calories?: number;
}

interface TodaysWorkout {
  id: string;
  session_name: string;
  day_of_week: number;
  exercises: Array<{
    exercise_name: string;
    sets?: number;
    reps?: number;
  }>;
}

interface ClientHabit {
  id: string;
  habit_id: string;
  habit_name: string;
  description?: string;
  completed: boolean;
  date: string;
}

interface ProgressData {
  weight?: number;
  workouts_completed?: number;
  habits_completed?: number;
}

export function useClientDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Fetch today's meals
  const { data: todaysMeals, isLoading: mealsLoading } = useQuery({
    queryKey: ['todaysMeals', user?.id, today],
    queryFn: async (): Promise<TodaysMeal[]> => {
      if (!user?.id) return [];

      const { data: mealPlan } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('client_id', user.id)
        .gte('date', today)
        .lte('date', today)
        .single();

      if (!mealPlan) return [];

      const { data: entries } = await supabase
        .from('meal_plan_entries')
        .select(`
          id,
          meal_type,
          quantity,
          day_of_week,
          food_database (name, calories, serving_size_grams),
          recipes (name, recipe_ingredients (quantity, food_database (calories, serving_size_grams)))
        `)
        .eq('meal_plan_id', mealPlan.id)
        .eq('day_of_week', dayOfWeek);

      return entries?.map(entry => ({
        id: entry.id,
        meal_type: entry.meal_type,
        food_name: entry.food_database?.name,
        recipe_name: entry.recipes?.name,
        quantity: entry.quantity,
        calories: entry.food_database?.calories || 
                 entry.recipes?.recipe_ingredients?.reduce((sum: number, ing: any) => 
                   sum + (ing.food_database?.calories || 0) * (ing.quantity || 0) / 100, 0)
      })) || [];
    },
    enabled: !!user?.id,
  });

  // Fetch today's workout
  const { data: todaysWorkout, isLoading: workoutLoading } = useQuery({
    queryKey: ['todaysWorkout', user?.id, dayOfWeek],
    queryFn: async (): Promise<TodaysWorkout | null> => {
      if (!user?.id) return null;

      const { data: trainingPlan } = await supabase
        .from('training_plans')
        .select('id')
        .eq('client_id', user.id)
        .gte('start_date', today)
        .lte('end_date', today)
        .single();

      if (!trainingPlan) return null;

      const { data: session } = await supabase
        .from('workout_sessions')
        .select(`
          id,
          session_name,
          day_of_week,
          workout_exercises (
            sets,
            reps,
            exercise_database (name)
          )
        `)
        .eq('training_plan_id', trainingPlan.id)
        .eq('day_of_week', dayOfWeek)
        .single();

      if (!session) return null;

      return {
        id: session.id,
        session_name: session.session_name,
        day_of_week: session.day_of_week,
        exercises: session.workout_exercises?.map((ex: any) => ({
          exercise_name: ex.exercise_database?.name || '',
          sets: ex.sets,
          reps: ex.reps,
        })) || []
      };
    },
    enabled: !!user?.id,
  });

  // Fetch today's habits
  const { data: todaysHabits, isLoading: habitsLoading } = useQuery({
    queryKey: ['todaysHabits', user?.id, today],
    queryFn: async (): Promise<ClientHabit[]> => {
      if (!user?.id) return [];

      const { data: habits } = await supabase
        .from('client_habits')
        .select(`
          id,
          habit_id,
          completed,
          date,
          habits (habit_name, description)
        `)
        .eq('client_id', user.id)
        .eq('date', today);

      return habits?.map(habit => ({
        id: habit.id,
        habit_id: habit.habit_id,
        habit_name: habit.habits?.habit_name || '',
        description: habit.habits?.description,
        completed: habit.completed,
        date: habit.date,
      })) || [];
    },
    enabled: !!user?.id,
  });

  // Fetch progress data
  const { data: progressData } = useQuery({
    queryKey: ['progressData', user?.id],
    queryFn: async (): Promise<ProgressData> => {
      if (!user?.id) return {};

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: progress } = await supabase
        .from('progress_tracking')
        .select('metric_type, value, date')
        .eq('client_id', user.id)
        .gte('date', weekStartStr)
        .order('date', { ascending: false });

      const latestWeight = progress?.find(p => p.metric_type === 'weight')?.value;
      const workoutsThisWeek = progress?.filter(p => p.metric_type === 'workout_completed').length || 0;
      
      // Count completed habits this week
      const { data: weeklyHabits } = await supabase
        .from('client_habits')
        .select('completed')
        .eq('client_id', user.id)
        .gte('date', weekStartStr);

      const habitsCompleted = weeklyHabits?.filter(h => h.completed).length || 0;

      return {
        weight: latestWeight ? parseFloat(latestWeight) : undefined,
        workouts_completed: workoutsThisWeek,
        habits_completed: habitsCompleted,
      };
    },
    enabled: !!user?.id,
  });

  // Mutation to toggle habit completion
  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, completed }: { habitId: string, completed: boolean }) => {
      const { error } = await supabase
        .from('client_habits')
        .update({ completed })
        .eq('id', habitId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaysHabits'] });
      queryClient.invalidateQueries({ queryKey: ['progressData'] });
      toast({
        title: "Uspješno ažurirano",
        description: "Stanje navike je ažurirano.",
      });
    },
    onError: () => {
      toast({
        title: "Greška",
        description: "Došlo je do greške pri ažuriranju navike.",
        variant: "destructive",
      });
    },
  });

  // Fetch unread messages count
  const { data: unreadCount } = useQuery({
    queryKey: ['unreadMessages', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 0;

      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .is('read_at', null);

      return count || 0;
    },
    enabled: !!user?.id,
  });

  return {
    todaysMeals,
    todaysWorkout,
    todaysHabits,
    progressData,
    unreadCount,
    isLoading: mealsLoading || workoutLoading || habitsLoading,
    toggleHabit: (habitId: string, completed: boolean) => 
      toggleHabitMutation.mutate({ habitId, completed }),
  };
}