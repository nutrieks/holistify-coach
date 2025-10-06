import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

export function MacroDisplay({ current, target, showProgress = true }: MacroDisplayProps) {
  const caloriesPercent = (current.calories / target.calories) * 100;
  const proteinPercent = (current.protein / target.protein) * 100;
  const carbsPercent = (current.carbs / target.carbs) * 100;
  const fatsPercent = (current.fats / target.fats) * 100;

  return (
    <Card className="p-4 bg-card/50 backdrop-blur border-border">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Calories */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-xs text-muted-foreground">Kalorije</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {current.calories} / {target.calories}
          </div>
          {showProgress && (
            <Progress value={Math.min(caloriesPercent, 100)} className="h-1" />
          )}
        </div>

        {/* Protein */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Beef className="h-4 w-4 text-red-400" />
            <span className="text-xs text-muted-foreground">Proteini</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {current.protein}g / {target.protein}g
          </div>
          {showProgress && (
            <Progress value={Math.min(proteinPercent, 100)} className="h-1" />
          )}
        </div>

        {/* Carbs */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Wheat className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-muted-foreground">Ugljikohidrati</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {current.carbs}g / {target.carbs}g
          </div>
          {showProgress && (
            <Progress value={Math.min(carbsPercent, 100)} className="h-1" />
          )}
        </div>

        {/* Fats */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Droplet className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-muted-foreground">Masti</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {current.fats}g / {target.fats}g
          </div>
          {showProgress && (
            <Progress value={Math.min(fatsPercent, 100)} className="h-1" />
          )}
        </div>
      </div>
    </Card>
  );
}
