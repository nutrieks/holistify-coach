import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MonthlyCalendarView } from "./MonthlyCalendarView"
import { WeeklyView } from "./WeeklyView"
import { DailyView } from "./DailyView"
import { AddMealToTimelineModal } from "./AddMealToTimelineModal"
import { AddTrainingSessionModal } from "./AddTrainingSessionModal"
import { EditMealModal } from "./EditMealModal"
import { EditTrainingSessionModal } from "./EditTrainingSessionModal"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { Calendar, CalendarDays, CalendarClock, Plus } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"

interface NutritionPlanViewerProps {
  planId: string | null;
  clientId: string;
  editable?: boolean;
  onPlanCreated?: (planId: string) => void;
}

export function NutritionPlanViewer({ planId, clientId, editable = false, onPlanCreated }: NutritionPlanViewerProps) {
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'daily'>('weekly')
  const [loading, setLoading] = useState(true)
  const [planData, setPlanData] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)
  const { toast } = useToast()
  
  // Modal states
  const [addMealModalOpen, setAddMealModalOpen] = useState(false)
  const [addTrainingModalOpen, setAddTrainingModalOpen] = useState(false)
  const [editMealModalOpen, setEditMealModalOpen] = useState(false)
  const [editTrainingModalOpen, setEditTrainingModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const [selectedMeal, setSelectedMeal] = useState<any>(null)
  const [selectedTraining, setSelectedTraining] = useState<any>(null)
  const [deleteItem, setDeleteItem] = useState<{ type: 'meal' | 'training', id: string } | null>(null)

  useEffect(() => {
    if (planId) {
      fetchPlanData()
    } else {
      setLoading(false)
      setPlanData(null)
    }
  }, [planId])

  const fetchPlanData = async () => {
    if (!planId) return;
    
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

  const handleEditMeal = (meal: any) => {
    setSelectedMeal(meal)
    setEditMealModalOpen(true)
  }

  const handleEditTraining = (training: any) => {
    setSelectedTraining(training)
    setEditTrainingModalOpen(true)
  }

  const handleDeleteMeal = (mealId: string) => {
    setDeleteItem({ type: 'meal', id: mealId })
    setDeleteConfirmOpen(true)
  }

  const handleDeleteTraining = (trainingId: string) => {
    setDeleteItem({ type: 'training', id: trainingId })
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteItem) return

    try {
      if (deleteItem.type === 'meal') {
        const { error } = await supabase
          .from('meal_plan_entries')
          .delete()
          .eq('id', deleteItem.id)

        if (error) throw error

        toast({
          title: "Uspjeh",
          description: "Obrok je uspješno obrisan",
        })
      } else {
        const { error } = await supabase
          .from('training_sessions')
          .delete()
          .eq('id', deleteItem.id)

        if (error) throw error

        toast({
          title: "Uspjeh",
          description: "Trening je uspješno obrisan",
        })
      }

      fetchPlanData()
    } catch (error) {
      console.error('Error deleting:', error)
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom brisanja",
        variant: "destructive",
      })
    } finally {
      setDeleteItem(null)
    }
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

  const handleCreatePlan = async () => {
    setIsCreatingPlan(true);
    try {
      const { data: newPlan, error } = await supabase
        .from('meal_plans')
        .insert({
          client_id: clientId,
          name: 'Novi Plan',
          daily_calories_target: 2000,
          daily_protein_target: 150,
          daily_carbs_target: 200,
          daily_fats_target: 70,
          training_integration: true,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Uspjeh",
        description: "Plan je uspješno kreiran",
      });

      onPlanCreated?.(newPlan.id);
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Greška",
        description: "Nije moguće kreirati plan",
        variant: "destructive"
      });
    } finally {
      setIsCreatingPlan(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // If no plan exists, show empty weekly grid with create button
  if (!planId || !planData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Još nema kreiranog plana prehrane</p>
          {editable && (
            <Button onClick={handleCreatePlan} disabled={isCreatingPlan}>
              <Plus className="h-4 w-4 mr-2" />
              {isCreatingPlan ? 'Kreiram...' : 'Kreiraj Novi Plan'}
            </Button>
          )}
        </div>
        
        {/* Show empty weekly grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {Array.from({ length: 7 }, (_, i) => {
            const dayLabels = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja'];
            return (
              <Card key={i} className="bg-card border-border min-h-[400px] flex flex-col">
                <div className="p-3 border-b border-border">
                  <h3 className="font-bold text-base text-foreground">{dayLabels[i]}</h3>
                </div>
                <div className="flex-1 flex items-center justify-center p-4">
                  <p className="text-muted-foreground text-sm text-center">
                    Kreiraj plan za dodavanje obroka
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
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
        foodId: e.food_id,
        recipeId: e.recipe_id,
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
              onEditMeal={handleEditMeal}
              onEditTraining={handleEditTraining}
              onDeleteMeal={handleDeleteMeal}
              onDeleteTraining={handleDeleteTraining}
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
            onAddMeal={handleAddMeal}
            onAddTraining={handleAddTraining}
            onEditMeal={handleEditMeal}
            onEditTraining={handleEditTraining}
            onDeleteMeal={handleDeleteMeal}
            onDeleteTraining={handleDeleteTraining}
            onDayTypeChange={(type) => handleDayTypeChange(currentDay?.dayOfWeek || 0, type)}
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

          {selectedMeal && (
            <EditMealModal
              open={editMealModalOpen}
              onOpenChange={setEditMealModalOpen}
              mealEntry={{
                id: selectedMeal.id,
                meal_type: selectedMeal.mealType,
                scheduled_time: selectedMeal.scheduledTime,
                food_id: selectedMeal.foodId,
                recipe_id: selectedMeal.recipeId,
                quantity: selectedMeal.quantity,
                unit: selectedMeal.unit,
                notes: selectedMeal.notes,
                foodName: selectedMeal.foodName,
                recipeName: selectedMeal.recipeName
              }}
              onMealUpdated={fetchPlanData}
            />
          )}

          {selectedTraining && (
            <EditTrainingSessionModal
              open={editTrainingModalOpen}
              onOpenChange={setEditTrainingModalOpen}
              session={{
                id: selectedTraining.id,
                training_type: selectedTraining.trainingType,
                intensity: selectedTraining.intensity,
                scheduled_time: selectedTraining.scheduledTime,
                duration_minutes: selectedTraining.duration,
                pre_workout_notes: selectedTraining.preWorkoutNotes,
                during_workout_notes: selectedTraining.duringWorkoutNotes,
                post_workout_notes: selectedTraining.postWorkoutNotes
              }}
              onSessionUpdated={fetchPlanData}
            />
          )}

          <ConfirmDialog
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
            title="Potvrda Brisanja"
            description={`Jeste li sigurni da želite obrisati ovaj ${deleteItem?.type === 'meal' ? 'obrok' : 'trening'}?`}
            onConfirm={handleConfirmDelete}
            confirmText="Obriši"
            cancelText="Odustani"
            variant="destructive"
          />
        </>
      )}
    </div>
  )
}
