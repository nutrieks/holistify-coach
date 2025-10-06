import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

interface DayData {
  dayOfWeek: number;
  trainingDayType: 'no_training' | 'light_training' | 'moderate_training' | 'heavy_training';
  meals: MealEntry[];
  trainingSessions: TrainingSession[];
}

interface WeeklyViewProps {
  weekData: DayData[];
  baseMacros: { calories: number; protein: number; carbs: number; fats: number };
  onAddMeal?: (dayOfWeek: number) => void;
  onAddTraining?: (dayOfWeek: number) => void;
  onMealClick?: (meal: MealEntry) => void;
  onTrainingClick?: (training: TrainingSession) => void;
  onDayTypeChange?: (dayOfWeek: number, type: 'no_training' | 'light_training' | 'moderate_training' | 'heavy_training') => void;
  editable?: boolean;
}

export function WeeklyView({
  weekData,
  baseMacros,
  onAddMeal,
  onAddTraining,
  onMealClick,
  onTrainingClick,
  onDayTypeChange,
  editable = false
}: WeeklyViewProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <ScrollArea className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 pb-4">
          {daysOfWeek.map((day) => {
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
                onMouseEnter={() => setHoveredDay(day.value)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Day Header */}
                <div className="p-4 border-b border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-foreground">{day.label}</h3>
                    {editable && hoveredDay === day.value && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onAddMeal?.(day.value)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Day Type Selector */}
                  <DayTypeSelector
                    value={dayData.trainingDayType}
                    onChange={(type) => onDayTypeChange?.(day.value, type)}
                    disabled={!editable}
                  />

                  {/* Macro Display */}
                  <MacroDisplay
                    current={currentMacros}
                    target={dailyMacros}
                    showProgress={true}
                  />
                </div>

                {/* Timeline */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {timeline.length === 0 ? (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        Nema planiranih obroka ili treninga
                      </div>
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
                            />
                          )}
                        </div>
                      ))
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
