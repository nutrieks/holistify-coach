import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Coffee, Sandwich, UtensilsCrossed, Apple, Moon, Dumbbell, Pencil, Trash2 } from "lucide-react";
import { mealTypeGradients, mealTypeLabels } from "@/utils/nutritionUtils";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mealTypeIcons: Record<string, any> = {
  breakfast: Coffee,
  morning_snack: Apple,
  lunch: UtensilsCrossed,
  afternoon_snack: Apple,
  dinner: Moon,
  evening_snack: Apple,
  pre_workout: Dumbbell,
  post_workout: Dumbbell,
};

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
  onEdit?: () => void;
  onDelete?: () => void;
  editable?: boolean;
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
  onClick,
  onEdit,
  onDelete,
  editable = false
}: MealCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const gradientClass = mealTypeGradients[mealType] || 'gradient-breakfast';
  const displayName = foodName || recipeName || 'Nije dodano';
  const MealIcon = mealTypeIcons[mealType] || Coffee;

  return (
    <Card 
      className={cn(
        "p-3 hover-scale cursor-pointer transition-all duration-200 border-none relative",
        gradientClass
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit/Delete Buttons */}
      {editable && isHovered && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <Button
            size="sm"
            variant="secondary"
            className="h-7 w-7 p-0 bg-white/20 hover:bg-white/30 text-white border-none"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-7 w-7 p-0 bg-red-500/30 hover:bg-red-500/50 text-white border-none"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Left: Icon */}
        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
          <MealIcon className="h-5 w-5 text-white" />
        </div>

        {/* Middle: Details */}
        <div className="flex-1 min-w-0">
          <div className="text-white">
            <h4 className="font-bold text-sm">{mealTypeLabels[mealType] || mealType}</h4>
            <p className="text-xs opacity-80 truncate mt-0.5">{displayName}</p>
            {quantity && unit && (
              <p className="text-xs opacity-70 mt-0.5">
                {quantity} {unit}
              </p>
            )}
          </div>

          {/* Macros Breakdown */}
          <div className="flex items-center gap-2 mt-2 text-xs text-white/90">
            <span className="font-semibold">{Math.round(carbs)}g C</span>
            <span>•</span>
            <span className="font-semibold">{Math.round(protein)}g P</span>
            <span>•</span>
            <span className="font-semibold">{Math.round(fats)}g F</span>
          </div>

          {/* Notes */}
          {notes && (
            <p className="text-xs text-white/60 italic mt-2 line-clamp-2">{notes}</p>
          )}
        </div>

        {/* Right: Calories + Time */}
        <div className="flex flex-col items-end gap-1 text-white">
          <div className="text-xl font-bold">{Math.round(calories)}</div>
          <div className="text-xs opacity-80">kcal</div>
          <div className="flex items-center gap-1 text-xs opacity-80 mt-1">
            <Clock className="h-3 w-3" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
