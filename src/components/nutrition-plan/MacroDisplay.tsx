import { Progress } from "@/components/ui/progress";

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
}

export function MacroDisplay({ current, target }: MacroDisplayProps) {
  const caloriesPercent = Math.min((current.calories / target.calories) * 100, 100);
  const carbsPercent = Math.min((current.carbs / target.carbs) * 100, 100);
  const proteinPercent = Math.min((current.protein / target.protein) * 100, 100);
  const fatsPercent = Math.min((current.fats / target.fats) * 100, 100);

  return (
    <div className="space-y-3">
      {/* Calories */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">Kalorije</span>
          <span className="font-bold">
            {Math.round(current.calories)}/{Math.round(target.calories)} kcal
          </span>
        </div>
        <Progress value={caloriesPercent} className="h-2" />
      </div>

      {/* Macros */}
      <div className="space-y-2">
        {/* Carbs */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Ugljikohidrati</span>
            <span className="font-semibold">{Math.round(current.carbs)}/{Math.round(target.carbs)}g</span>
          </div>
          <Progress value={carbsPercent} className="h-1.5 progress-carbs" />
        </div>

        {/* Protein */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Proteini</span>
            <span className="font-semibold">{Math.round(current.protein)}/{Math.round(target.protein)}g</span>
          </div>
          <Progress value={proteinPercent} className="h-1.5 progress-protein" />
        </div>

        {/* Fat */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Masti</span>
            <span className="font-semibold">{Math.round(current.fats)}/{Math.round(target.fats)}g</span>
          </div>
          <Progress value={fatsPercent} className="h-1.5 progress-fats" />
        </div>
      </div>
    </div>
  );
}
