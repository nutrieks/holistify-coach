import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { DayTypeSelector } from "./DayTypeSelector";
import { MacroDisplay } from "./MacroDisplay";
import { MealCard } from "./MealCard";
import { TrainingCard } from "./TrainingCard";
import { daysOfWeek, calculateDailyMacros, getFormattedDayDate } from "@/utils/nutritionUtils";
import { format, addDays } from "date-fns";
import { hr } from "date-fns/locale";

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

interface DayData {
  dayOfWeek: number;
  trainingDayType: 'no_training' | 'light_training' | 'moderate_training' | 'heavy_training';
  meals: MealEntry[];
  trainingSessions: TrainingSession[];
}

interface WeeklyViewProps {
  weekData: DayData[];
  baseMacros: { calories: number; protein: number; carbs: number; fats: number };
  currentWeekStart?: Date;
  onAddMeal?: (dayOfWeek: number) => void;
  onAddTraining?: (dayOfWeek: number) => void;
  onMealClick?: (meal: MealEntry) => void;
  onTrainingClick?: (training: TrainingSession) => void;
  onEditMeal?: (meal: MealEntry) => void;
  onEditTraining?: (training: TrainingSession) => void;
  onDeleteMeal?: (mealId: string) => void;
  onDeleteTraining?: (trainingId: string) => void;
  onDayTypeChange?: (dayOfWeek: number, type: 'no_training' | 'light_training' | 'moderate_training' | 'heavy_training') => void;
  editable?: boolean;
}

export function WeeklyView({
  weekData,
  baseMacros,
  currentWeekStart = new Date(),
  onAddMeal,
  onAddTraining,
  onMealClick,
  onTrainingClick,
  onEditMeal,
  onEditTraining,
  onDeleteMeal,
  onDeleteTraining,
  onDayTypeChange,
  editable = false
}: WeeklyViewProps) {

  return (
    <div className="space-y-4">
      <ScrollArea className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 pb-4">
          {daysOfWeek.map((day, index) => {
            const currentDate = addDays(currentWeekStart, index);
            const dayData = weekData.find(d => d.dayOfWeek === day.value) || {
              dayOfWeek: day.value,
              trainingDayType: 'no_training' as const,
              meals: [],
              trainingSessions: []
            };

            const dailyMacros = calculateDailyMacros(baseMacros, dayData.trainingDayType);
            
            const currentMacros = dayData.meals.reduce(
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
              ...dayData.meals.map(m => ({ ...m, type: 'meal' as const })),
              ...dayData.trainingSessions.map(t => ({ ...t, type: 'training' as const }))
            ].sort((a, b) => {
              const timeA = a.scheduledTime || '00:00';
              const timeB = b.scheduledTime || '00:00';
              return timeA.localeCompare(timeB);
            });

            return (
              <Card
                key={day.value}
                className="bg-card border-border min-h-[600px] flex flex-col"
              >
                {/* Day Header */}
                <div className="p-4 border-b border-border space-y-3">
                  {/* Datum i Naziv Dana */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{day.short} {format(currentDate, 'd', { locale: hr })}</h3>
                      <p className="text-xs text-muted-foreground">{format(currentDate, 'MMMM', { locale: hr })}</p>
                    </div>
                    <Badge 
                      variant={dayData.trainingDayType === 'no_training' ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {dayData.trainingDayType === 'heavy_training' && '3+ Treninga'}
                      {dayData.trainingDayType === 'moderate_training' && '2 Treninga'}
                      {dayData.trainingDayType === 'light_training' && '1 Trening'}
                      {dayData.trainingDayType === 'no_training' && 'Bez Treninga'}
                    </Badge>
                  </div>

                  {/* Day Type Selector */}
                  {editable && (
                    <DayTypeSelector
                      value={dayData.trainingDayType}
                      onChange={(type) => onDayTypeChange?.(day.value, type)}
                      disabled={!editable}
                    />
                  )}

                  {/* Macro Display sa Progress Barovima */}
                  <MacroDisplay
                    current={currentMacros}
                    target={dailyMacros}
                  />
                </div>

                {/* Timeline */}
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-2">
                    {timeline.map((item, index) => (
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
                      ))}

                    {/* ADD BUTTONS - UVIJEK VIDLJIVI */}
                    {editable && (
                      <div className="space-y-2 pt-2">
                        <Button
                          variant="outline"
                          className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
                          onClick={() => onAddMeal?.(day.value)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Dodaj Obrok
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
                          onClick={() => onAddTraining?.(day.value)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Dodaj Trening
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
