import { Flame, Beef, Wheat, Droplet } from "lucide-react";

interface MacroDisplayProps {
  current: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  target: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  showProgress?: boolean;
}

export function MacroDisplay({ current, target }: MacroDisplayProps) {
  return (
    <div className="space-y-1 text-xs">
      {/* Calories - Primary Line */}
      <div className="flex items-center gap-1.5">
        <Flame className="h-3 w-3 text-orange-400" />
        <span className="text-muted-foreground">Calories:</span>
        <span className="font-bold text-foreground">{current.calories}</span>
        <span className="text-muted-foreground">/ {target.calories} kcal</span>
      </div>
      
      {/* Macros - Secondary Line */}
      <div className="flex items-center gap-3 text-[11px]">
        <div className="flex items-center gap-1">
          <Wheat className="h-2.5 w-2.5 text-yellow-400" />
          <span className="text-muted-foreground">Carbs:</span>
          <span className="font-semibold">{current.carbs}</span>
          <span className="text-muted-foreground">/ {target.carbs}g</span>
        </div>
        <span className="text-muted-foreground">•</span>
        <div className="flex items-center gap-1">
          <Beef className="h-2.5 w-2.5 text-red-400" />
          <span className="text-muted-foreground">Protein:</span>
          <span className="font-semibold">{current.protein}</span>
          <span className="text-muted-foreground">/ {target.protein}g</span>
        </div>
        <span className="text-muted-foreground">•</span>
        <div className="flex items-center gap-1">
          <Droplet className="h-2.5 w-2.5 text-blue-400" />
          <span className="text-muted-foreground">Fat:</span>
          <span className="font-semibold">{current.fats}</span>
          <span className="text-muted-foreground">/ {target.fats}g</span>
        </div>
      </div>
    </div>
  );
}
