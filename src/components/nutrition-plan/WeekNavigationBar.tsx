import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Copy, Clipboard } from "lucide-react";
import { format, addDays } from "date-fns";
import { hr } from "date-fns/locale";

interface WeekNavigationBarProps {
  currentWeekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onCopyWeek?: () => void;
  onPasteWeek?: () => void;
}

export function WeekNavigationBar({ 
  currentWeekStart, 
  onPreviousWeek, 
  onNextWeek,
  onCopyWeek,
  onPasteWeek
}: WeekNavigationBarProps) {
  const weekEnd = addDays(currentWeekStart, 6);

  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
      {/* Left: Week Range */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onPreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center min-w-[200px]">
          <p className="text-sm font-semibold">
            {format(currentWeekStart, 'do', { locale: hr })} - {format(weekEnd, 'do MMMM yyyy', { locale: hr })}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Right: Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCopyWeek}>
          <Copy className="h-4 w-4 mr-2" />
          Kopiraj Tjedan
        </Button>
        <Button variant="outline" size="sm" onClick={onPasteWeek}>
          <Clipboard className="h-4 w-4 mr-2" />
          Zalijepi Tjedan
        </Button>
      </div>
    </div>
  );
}
