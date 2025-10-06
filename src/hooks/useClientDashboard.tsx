import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TodaysMeal {
  id: string;
  meal_type: string;
  food_name?: string;
  recipe_name?: string;
  category_name?: string;
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

  // Fetch today's meals and plan data
  const { data: mealPlanData, isLoading: mealsLoading } = useQuery({
    queryKey: ['todaysMeals', user?.id, today],
    queryFn: async () => {
      if (!user?.id) return { meals: [] };

      const { data: mealPlan } = await supabase
        .from('meal_plans')
        .select('id, name, notes')
        .eq('client_id', user.id)
        .eq('is_active', true)
        .single();

      if (!mealPlan) return { meals: [] };

      // Fetch meal entries
      const { data: entries } = await supabase
        .from('meal_plan_entries')
        .select(`
          id,
          meal_type,
          quantity,
          unit,
          notes,
          food_id,
          recipe_id,
          day_of_week
        `)
        .eq('meal_plan_id', mealPlan.id)
        .eq('day_of_week', dayOfWeek);

      if (!entries) return { meals: [] };

      // Fetch food and recipe details for entries
      const meals = await Promise.all(entries.map(async (entry) => {
        let food_name, recipe_name, calories;

        if (entry.food_id) {
          const { data: food } = await supabase
            .from('food_database')
            .select('name, calories')
            .eq('id', entry.food_id)
            .single();
          food_name = food?.name;
          calories = food?.calories;
        }

        if (entry.recipe_id) {
          const { data: recipe } = await supabase
            .from('recipes')
            .select('name, total_calories')
            .eq('id', entry.recipe_id)
            .single();
          recipe_name = recipe?.name;
          calories = recipe?.total_calories;
        }

        return {
          id: entry.id,
          meal_type: entry.meal_type,
          food_name,
          recipe_name,
          quantity: entry.quantity,
          calories
        };
      }));

      return { meals };
    },
    enabled: !!user?.id,
  });

  const todaysMeals = mealPlanData?.meals || [];

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
        .select('id, session_name, day_of_week, exercises')
        .eq('training_plan_id', trainingPlan.id)
        .eq('day_of_week', dayOfWeek)
        .single();

      if (!session) return null;

      // Parse exercises from JSONB column
      const exercises = Array.isArray(session.exercises) 
        ? session.exercises.map((ex: any) => ({
            exercise_name: ex.name || ex.exercise_name || '',
            sets: ex.sets,
            reps: ex.reps,
          }))
        : [];

      return {
        id: session.id,
        session_name: session.session_name,
        day_of_week: session.day_of_week,
        exercises
      };
    },
    enabled: !!user?.id,
  });

  // Fetch today's habits - disabled as client_habits doesn't have completed/date columns
  const { data: todaysHabits, isLoading: habitsLoading } = useQuery({
    queryKey: ['todaysHabits', user?.id, today],
    queryFn: async (): Promise<ClientHabit[]> => {
      if (!user?.id) return [];

      const { data: clientHabits } = await supabase
        .from('client_habits')
        .select(`
          id,
          habit_id,
          is_active,
          habits (name, description)
        `)
        .eq('client_id', user.id)
        .eq('is_active', true);

      // Return habits without completion tracking
      return clientHabits?.map(habit => ({
        id: habit.id,
        habit_id: habit.habit_id,
        habit_name: habit.habits?.name || '',
        description: habit.habits?.description,
        completed: false, // No completion tracking in schema
        date: today,
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
      
      // Habits don't have completion tracking in current schema
      const habitsCompleted = 0;

      return {
        weight: latestWeight ? parseFloat(latestWeight) : undefined,
        workouts_completed: workoutsThisWeek,
        habits_completed: habitsCompleted,
      };
    },
    enabled: !!user?.id,
  });

  // Toggle habit - disabled as schema doesn't support completion tracking
  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, completed }: { habitId: string, completed: boolean }) => {
      // Placeholder - client_habits doesn't have completed column
      console.log('Habit toggle not implemented:', habitId, completed);
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({
        title: "Info",
        description: "Praćenje navika trenutno nije dostupno.",
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