import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Dumbbell, ChevronDown, ChevronUp, Zap, Pencil, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface TrainingCardProps {
  trainingType: string;
  time: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  preWorkoutNotes?: string;
  duringWorkoutNotes?: string;
  postWorkoutNotes?: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  editable?: boolean;
}

export function TrainingCard({
  trainingType,
  time,
  duration,
  intensity,
  preWorkoutNotes,
  duringWorkoutNotes,
  postWorkoutNotes,
  onClick,
  onEdit,
  onDelete,
  editable = false
}: TrainingCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const intensityColors = {
    low: 'bg-green-500/20 text-green-300',
    medium: 'bg-yellow-500/20 text-yellow-300',
    high: 'bg-red-500/20 text-red-300'
  };

  const intensityLabels = {
    low: 'Nizak',
    medium: 'Srednji',
    high: 'Visok'
  };

  return (
    <Card 
      className="gradient-training border-none hover-scale cursor-pointer transition-all duration-200 relative"
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

      <div className="p-3">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex flex-col gap-2">
            {/* Header with TP badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded">
                  TP
                </div>
                <CollapsibleTrigger asChild>
                  <button 
                    className="text-white/70 hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(!isOpen);
                    }}
                  >
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </CollapsibleTrigger>
              </div>
              <Badge className={cn("text-xs", intensityColors[intensity])}>
                <Zap className="h-2.5 w-2.5 mr-1" />
                {intensityLabels[intensity]}
              </Badge>
            </div>

            {/* Training Type - Main Title */}
            <div className="text-white font-bold text-lg">
              {trainingType}
            </div>

            {/* Time Range */}
            <div className="flex items-center gap-1 text-white/80 text-xs">
              <Clock className="h-3 w-3" />
              <span>{time}</span>
              {duration && <span className="text-white/60 ml-1">({duration} min)</span>}
            </div>

            {/* During Workout Notes */}
            {duringWorkoutNotes && (
              <div className="bg-white/10 rounded p-2 mt-1">
                <p className="text-xs text-white/90">{duringWorkoutNotes}</p>
              </div>
            )}

            {/* Expandable Pre/Post Workout Nutrition */}
            <CollapsibleContent className="space-y-2 pt-2">
              {preWorkoutNotes && (
                <div className="bg-white/5 rounded p-2 border border-white/10">
                  <p className="text-xs font-semibold text-white mb-1">🍽️ Prije Treninga</p>
                  <p className="text-xs text-white/80">{preWorkoutNotes}</p>
                </div>
              )}
              {postWorkoutNotes && (
                <div className="bg-white/5 rounded p-2 border border-white/10">
                  <p className="text-xs font-semibold text-white mb-1">🥤 Nakon Treninga</p>
                  <p className="text-xs text-white/80">{postWorkoutNotes}</p>
                </div>
              )}
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </Card>
  );
}
