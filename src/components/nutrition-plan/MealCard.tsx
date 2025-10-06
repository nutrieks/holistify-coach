import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame, Beef, Wheat, Droplet } from "lucide-react";
import { mealTypeGradients, mealTypeLabels } from "@/utils/nutritionUtils";
import { cn } from "@/lib/utils";

interface MealCardProps {
  mealType: string;
  time: string;
  foodName?: string;
  recipeName?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  quantity?: number;
  unit?: string;
  notes?: string;
  onClick?: () => void;
}

export function MealCard({
  mealType,
  time,
  foodName,
  recipeName,
  calories,
  protein,
  carbs,
  fats,
  quantity,
  unit,
  notes,
  onClick
}: MealCardProps) {
  const gradientClass = mealTypeGradients[mealType] || 'gradient-breakfast';
  const displayName = foodName || recipeName || 'Nije dodano';

  return (
    <Card 
      className={cn(
        "p-4 hover-scale cursor-pointer transition-all duration-200 border-none",
        gradientClass
      )}
      onClick={onClick}
    >
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-black/20 text-white border-none">
              {mealTypeLabels[mealType] || mealType}
            </Badge>
            <div className="flex items-center gap-1 text-white/90 text-sm">
              <Clock className="h-3 w-3" />
              <span>{time}</span>
            </div>
          </div>
        </div>

        {/* Food/Recipe Name */}
        <div className="text-white font-semibold text-lg">
          {displayName}
          {quantity && unit && (
            <span className="text-sm font-normal text-white/80 ml-2">
              ({quantity} {unit})
            </span>
          )}
        </div>

        {/* Macros */}
        <div className="grid grid-cols-4 gap-2">
          <div className="flex items-center gap-1 text-white/90">
            <Flame className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="text-xs opacity-70">kcal</span>
              <span className="font-semibold text-sm">{calories}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-white/90">
            <Beef className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="text-xs opacity-70">P</span>
              <span className="font-semibold text-sm">{protein}g</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-white/90">
            <Wheat className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="text-xs opacity-70">C</span>
              <span className="font-semibold text-sm">{carbs}g</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-white/90">
            <Droplet className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="text-xs opacity-70">F</span>
              <span className="font-semibold text-sm">{fats}g</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <p className="text-xs text-white/70 italic">{notes}</p>
        )}
      </div>
    </Card>
  );
}
