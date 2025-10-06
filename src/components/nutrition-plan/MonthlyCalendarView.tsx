import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Utensils } from "lucide-react";
import { trainingDayTypes } from "@/utils/nutritionUtils";
import { cn } from "@/lib/utils";

interface DayData {
  date: Date;
  dayOfWeek: number;
  trainingDayType: 'no_training' | 'light_training' | 'moderate_training' | 'heavy_training';
  totalCalories: number;
  mealCount: number;
  trainingCount: number;
}

interface MonthlyCalendarViewProps {
  monthData: DayData[];
  currentDate: Date;
  onDayClick?: (date: Date) => void;
}

export function MonthlyCalendarView({
  monthData,
  currentDate,
  onDayClick
}: MonthlyCalendarViewProps) {
  const monthName = currentDate.toLocaleDateString('hr-HR', { month: 'long', year: 'numeric' });
  const daysOfWeek = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];

  // Get first day of month and total days
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7;

  // Create calendar grid
  const calendarDays: (DayData | null)[] = [];
  
  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add all days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayData = monthData.find(d => 
      d.date.getDate() === day &&
      d.date.getMonth() === currentDate.getMonth() &&
      d.date.getFullYear() === currentDate.getFullYear()
    );

    calendarDays.push(dayData || {
      date,
      dayOfWeek: (date.getDay() + 6) % 7,
      trainingDayType: 'no_training',
      totalCalories: 0,
      mealCount: 0,
      trainingCount: 0
    });
  }

  return (
    <div className="space-y-4">
      {/* Month Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground capitalize">{monthName}</h2>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4 bg-card border-border">
        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((dayData, index) => {
            if (!dayData) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const trainingType = trainingDayTypes.find(t => t.value === dayData.trainingDayType);
            const isToday = new Date().toDateString() === dayData.date.toDateString();

            return (
              <Card
                key={index}
                className={cn(
                  "aspect-square p-2 cursor-pointer transition-all duration-200 hover-scale",
                  "border-2",
                  isToday && "ring-2 ring-primary"
                )}
                style={{
                  background: trainingType?.gradient || 'hsl(var(--card))',
                  borderColor: isToday ? 'hsl(var(--primary))' : 'hsl(var(--border))'
                }}
                onClick={() => onDayClick?.(dayData.date)}
              >
                <div className="flex flex-col h-full justify-between">
                  {/* Day Number */}
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">
                      {dayData.date.getDate()}
                    </span>
                  </div>

                  {/* Day Info */}
                  <div className="space-y-1">
                    {/* Calories */}
                    {dayData.totalCalories > 0 && (
                      <div className="flex items-center gap-1 text-white/90">
                        <Flame className="h-3 w-3" />
                        <span className="text-xs font-semibold">{dayData.totalCalories}</span>
                      </div>
                    )}

                    {/* Meal Count */}
                    {dayData.mealCount > 0 && (
                      <div className="flex items-center gap-1 text-white/90">
                        <Utensils className="h-3 w-3" />
                        <span className="text-xs">{dayData.mealCount}</span>
                      </div>
                    )}

                    {/* Training Badge */}
                    {dayData.trainingCount > 0 && (
                      <Badge className="bg-black/20 text-white text-xs px-1 py-0 h-4 border-none">
                        {dayData.trainingCount} T
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
