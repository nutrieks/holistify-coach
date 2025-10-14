import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Flame, Beef, Wheat, Droplet, Pencil, Trash2 } from "lucide-react";
import { mealTypeGradients, mealTypeLabels } from "@/utils/nutritionUtils";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

      <div className="flex flex-col gap-2">
        {/* Calories - Prominent Display */}
        <div className="text-white">
          <div className="text-2xl font-bold">{calories} Kcal</div>
          <div className="text-xs text-white/80 mt-0.5">
            {mealTypeLabels[mealType] || mealType}
          </div>
        </div>

        {/* Food/Recipe Name */}
        <div className="text-white/90 text-sm font-medium">
          {displayName}
          {quantity && unit && (
            <span className="text-xs text-white/70 ml-1">
              ({quantity} {unit})
            </span>
          )}
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 text-white/80 text-xs">
          <Clock className="h-3 w-3" />
          <span>{time}</span>
        </div>

        {/* Macros - Single Line */}
        <div className="flex items-center gap-2 text-white/90 text-xs">
          <span>{carbs}g C</span>
          <span>•</span>
          <span>{protein}g P</span>
          <span>•</span>
          <span>{fats}g F</span>
        </div>

        {/* Notes */}
        {notes && (
          <p className="text-xs text-white/60 italic mt-1">{notes}</p>
        )}
      </div>
    </Card>
  );
}
