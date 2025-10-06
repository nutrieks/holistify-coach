import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MonthlyCalendarView } from "./MonthlyCalendarView"
import { WeeklyView } from "./WeeklyView"
import { DailyView } from "./DailyView"
import { AddMealToTimelineModal } from "./AddMealToTimelineModal"
import { AddTrainingSessionModal } from "./AddTrainingSessionModal"
import { Calendar, CalendarDays, CalendarClock } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"

interface NutritionPlanViewerProps {
  planId: string;
  clientId: string;
  editable?: boolean;
}

export function NutritionPlanViewer({ planId, clientId, editable = false }: NutritionPlanViewerProps) {
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'daily'>('weekly')
  const [loading, setLoading] = useState(true)
  const [planData, setPlanData] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { toast } = useToast()
  
  // Modal states
  const [addMealModalOpen, setAddMealModalOpen] = useState(false)
  const [addTrainingModalOpen, setAddTrainingModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number>(1)

  useEffect(() => {
    fetchPlanData()
  }, [planId])

  const fetchPlanData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_entries!inner (
            *,
            food:food_database (*),
            recipe:recipes (*)
          )
        `)
        .eq('id', planId)
        .single();

      if (error) throw error;

      const { data: trainings } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('meal_plan_id', planId);

      const { data: dailyTypes } = await supabase
        .from('daily_training_types')
        .select('*')
        .eq('meal_plan_id', planId);

      setPlanData({
        plan: data,
        entries: data.meal_plan_entries || [],
        trainings: trainings || [],
        dailyTypes: dailyTypes || []
      });
    } catch (error) {
      console.error('Error fetching plan data:', error);
      toast({
        title: "Greška",
        description: "Nije moguće učitati plan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = (dayOfWeek: number) => {
    setSelectedDay(dayOfWeek)
    setAddMealModalOpen(true)
  }

  const handleAddTraining = (dayOfWeek: number) => {
    setSelectedDay(dayOfWeek)
    setAddTrainingModalOpen(true)
  }

  const handleMealAdded = () => {
    fetchPlanData()
  }

  const handleTrainingAdded = () => {
    fetchPlanData()
  }

  const handleDayTypeChange = async (dayOfWeek: number, type: 'no_training' | 'light_training' | 'moderate_training' | 'heavy_training') => {
    try {
      const { data: existing } = await supabase
        .from('daily_training_types')
        .select('id')
        .eq('meal_plan_id', planId)
        .eq('day_of_week', dayOfWeek)
        .maybeSingle()

      if (existing) {
        const { error } = await supabase
          .from('daily_training_types')
          .update({ training_day_type: type })
          .eq('id', existing.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('daily_training_types')
          .insert({
            meal_plan_id: planId,
            day_of_week: dayOfWeek,
            training_day_type: type
          })

        if (error) throw error
      }

      fetchPlanData()
    } catch (error) {
      console.error('Error updating day type:', error)
      toast({
        title: "Greška",
        description: "Nije moguće ažurirati tip dana",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!planData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nema dostupnih podataka</p>
      </div>
    );
  }

  // Mock base macros - replace with actual data
  const baseMacros = {
    calories: planData.plan.daily_calories_target || 2000,
    protein: planData.plan.daily_protein_target || 150,
    carbs: planData.plan.daily_carbs_target || 200,
    fats: planData.plan.daily_fats_target || 70
  };

  // Prepare week data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const dayType = planData.dailyTypes.find((dt: any) => dt.day_of_week === i);
    const dayMeals = planData.entries
      .filter((e: any) => e.day_of_week === i)
      .map((e: any) => ({
        id: e.id,
        mealType: e.meal_type,
        scheduledTime: e.scheduled_time || '00:00',
        foodName: e.food?.name,
        recipeName: e.recipe?.name,
        calories: e.food?.calories || e.recipe?.total_calories || 0,
        protein: e.food?.protein || e.recipe?.total_protein || 0,
        carbs: e.food?.carbs || e.recipe?.total_carbs || 0,
        fats: e.food?.fats || e.recipe?.total_fats || 0,
        quantity: e.quantity,
        unit: e.unit,
        notes: e.notes
      }));

    const dayTrainings = planData.trainings
      .filter((t: any) => t.day_of_week === i)
      .map((t: any) => ({
        id: t.id,
        trainingType: t.training_type,
        scheduledTime: t.scheduled_time,
        duration: t.duration_minutes,
        intensity: t.intensity,
        preWorkoutNotes: t.pre_workout_notes,
        duringWorkoutNotes: t.during_workout_notes,
        postWorkoutNotes: t.post_workout_notes
      }));

    return {
      dayOfWeek: i,
      trainingDayType: dayType?.training_day_type || 'no_training',
      meals: dayMeals,
      trainingSessions: dayTrainings
    };
  });

  const currentDay = weekData[selectedDate.getDay()];

  return (
    <div className="space-y-6">
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Mjesečno</span>
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>Tjedno</span>
          </TabsTrigger>
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            <span>Dnevno</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="mt-6">
          <MonthlyCalendarView
            monthData={[]}
            currentDate={selectedDate}
            onDayClick={(date) => {
              setSelectedDate(date);
              setViewMode('weekly');
            }}
          />
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
            <WeeklyView 
              weekData={weekData}
              baseMacros={baseMacros}
              editable={editable}
              onAddMeal={handleAddMeal}
              onAddTraining={handleAddTraining}
              onDayTypeChange={handleDayTypeChange}
            />
        </TabsContent>

        <TabsContent value="daily" className="mt-6">
          <DailyView
            dayOfWeek={currentDay?.dayOfWeek || 0}
            trainingDayType={currentDay?.trainingDayType || 'no_training'}
            meals={currentDay?.meals || []}
            trainingSessions={currentDay?.trainingSessions || []}
            baseMacros={baseMacros}
            editable={editable}
            onPreviousDay={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              setSelectedDate(newDate);
            }}
            onNextDay={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              setSelectedDate(newDate);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {editable && (
        <>
          <AddMealToTimelineModal
            open={addMealModalOpen}
            onOpenChange={setAddMealModalOpen}
            planId={planId}
            dayOfWeek={selectedDay}
            onMealAdded={handleMealAdded}
          />

          <AddTrainingSessionModal
            open={addTrainingModalOpen}
            onOpenChange={setAddTrainingModalOpen}
            planId={planId}
            dayOfWeek={selectedDay}
            onSessionAdded={handleTrainingAdded}
          />
        </>
      )}
    </div>
  )
}
