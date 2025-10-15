import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { DayTypeSelector } from "./DayTypeSelector";
import { MacroDisplay } from "./MacroDisplay";
import { MealCard } from "./MealCard";
import { TrainingCard } from "./TrainingCard";
import { daysOfWeek, calculateDailyMacros } from "@/utils/nutritionUtils";

interface MealEntry {
  id: string;
  mealType: string;
  scheduledTime: string;
  foodName?: string;
  recipeName?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  quantity?: number;
  unit?: string;
  notes?: string;
}

interface TrainingSession {
  id: string;
  trainingType: string;
  scheduledTime: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  preWorkoutNotes?: string;
  duringWorkoutNotes?: string;
  postWorkoutNotes?: string;
}

interface DailyViewProps {
  dayOfWeek: number;
  trainingDayType: 'no_training' | 'light_training' | 'moderate_training' | 'heavy_training';
  meals: MealEntry[];
  trainingSessions: TrainingSession[];
  baseMacros: { calories: number; protein: number; carbs: number; fats: number };
  onAddMeal?: (dayOfWeek: number) => void;
  onAddTraining?: (dayOfWeek: number) => void;
  onMealClick?: (meal: MealEntry) => void;
  onTrainingClick?: (training: TrainingSession) => void;
  onEditMeal?: (meal: MealEntry) => void;
  onEditTraining?: (training: TrainingSession) => void;
  onDeleteMeal?: (mealId: string) => void;
  onDeleteTraining?: (trainingId: string) => void;
  onDayTypeChange?: (type: 'no_training' | 'light_training' | 'moderate_training' | 'heavy_training') => void;
  onPreviousDay?: () => void;
  onNextDay?: () => void;
  editable?: boolean;
}

export function DailyView({
  dayOfWeek,
  trainingDayType,
  meals,
  trainingSessions,
  baseMacros,
  onAddMeal,
  onAddTraining,
  onMealClick,
  onTrainingClick,
  onEditMeal,
  onEditTraining,
  onDeleteMeal,
  onDeleteTraining,
  onDayTypeChange,
  onPreviousDay,
  onNextDay,
  editable = false
}: DailyViewProps) {
  const day = daysOfWeek.find(d => d.value === dayOfWeek) || daysOfWeek[0];
  const dailyMacros = calculateDailyMacros(baseMacros, trainingDayType);
  
  const currentMacros = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  // Combine meals and trainings, sort by time
  const timeline = [
    ...meals.map(m => ({ ...m, type: 'meal' as const })),
    ...trainingSessions.map(t => ({ ...t, type: 'training' as const }))
  ].sort((a, b) => {
    const timeA = a.scheduledTime || '00:00';
    const timeB = b.scheduledTime || '00:00';
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="space-y-3 max-w-5xl mx-auto">
      {/* Header */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPreviousDay}
            disabled={!onPreviousDay}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-2xl font-bold text-foreground">{day.label}</h2>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onNextDay}
            disabled={!onNextDay}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {/* Day Type Selector */}
          <div className="flex justify-center">
            <DayTypeSelector
              value={trainingDayType}
              onChange={(type) => onDayTypeChange?.(type)}
              disabled={!editable}
            />
          </div>

          {/* Macro Display */}
          <MacroDisplay
            current={currentMacros}
            target={dailyMacros}
          />
        </div>

        {/* Action Buttons */}
        {editable && (
          <div className="flex gap-2 mt-3 justify-center">
            <Button onClick={() => onAddMeal?.(dayOfWeek)} variant="default" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Dodaj Obrok
            </Button>
            <Button onClick={() => onAddTraining?.(dayOfWeek)} variant="secondary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Dodaj Trening
            </Button>
          </div>
        )}
      </Card>

      {/* Timeline */}
      <ScrollArea className="h-[calc(100vh-300px)] min-h-[500px]">
        <div className="space-y-3 pr-4">
          {timeline.length === 0 ? (
            <Card className="p-8 bg-card border-border">
              <div className="text-center text-muted-foreground">
                <p className="text-base">Nema planiranih obroka ili treninga</p>
                {editable && (
                  <p className="text-sm mt-2">Kliknite na gumbe iznad za dodavanje</p>
                )}
              </div>
            </Card>
          ) : (
            timeline.map((item, index) => (
              <div key={`${item.type}-${item.id || index}`}>
                {item.type === 'meal' ? (
                  <MealCard
                    mealType={item.mealType}
                    time={item.scheduledTime || '00:00'}
                    foodName={item.foodName}
                    recipeName={item.recipeName}
                    calories={item.calories}
                    protein={item.protein}
                    carbs={item.carbs}
                    fats={item.fats}
                    quantity={item.quantity}
                    unit={item.unit}
                    notes={item.notes}
                    onClick={() => onMealClick?.(item)}
                    onEdit={() => onEditMeal?.(item)}
                    onDelete={() => onDeleteMeal?.(item.id)}
                    editable={editable}
                  />
                ) : (
                  <TrainingCard
                    trainingType={item.trainingType}
                    time={item.scheduledTime}
                    duration={item.duration}
                    intensity={item.intensity}
                    preWorkoutNotes={item.preWorkoutNotes}
                    duringWorkoutNotes={item.duringWorkoutNotes}
                    postWorkoutNotes={item.postWorkoutNotes}
                    onClick={() => onTrainingClick?.(item)}
                    onEdit={() => onEditTraining?.(item)}
                    onDelete={() => onDeleteTraining?.(item.id)}
                    editable={editable}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
