import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Dumbbell, ChevronDown, ChevronUp, Zap, Pencil, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

      <div className="p-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/10 text-white border-none">
                  <Dumbbell className="h-3 w-3 mr-1" />
                  Trening
                </Badge>
                <div className="flex items-center gap-1 text-white/90 text-sm">
                  <Clock className="h-3 w-3" />
                  <span>{time}</span>
                </div>
              </div>
              <CollapsibleTrigger asChild>
                <button 
                  className="text-white/70 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                  }}
                >
                  {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </CollapsibleTrigger>
            </div>

            {/* Training Name */}
            <div className="text-white font-semibold text-lg">
              {trainingType}
            </div>

            {/* Duration & Intensity */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-white/90">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{duration} min</span>
              </div>
              <Badge className={intensityColors[intensity]}>
                <Zap className="h-3 w-3 mr-1" />
                {intensityLabels[intensity]} Intenzitet
              </Badge>
            </div>

            {/* During Workout Notes */}
            {duringWorkoutNotes && (
              <div className="bg-white/5 rounded-lg p-2 mt-1">
                <p className="text-xs text-white/80">
                  <span className="font-semibold">Tijekom treninga:</span> {duringWorkoutNotes}
                </p>
              </div>
            )}

            {/* Expandable Pre/Post Workout Nutrition */}
            <CollapsibleContent className="space-y-2 pt-2">
              {preWorkoutNotes && (
                <div className="bg-gradient-preworkout/20 rounded-lg p-3 border border-white/10">
                  <p className="text-xs font-semibold text-white mb-1">🍽️ Prije Treninga</p>
                  <p className="text-xs text-white/80">{preWorkoutNotes}</p>
                </div>
              )}
              {postWorkoutNotes && (
                <div className="bg-gradient-postworkout/20 rounded-lg p-3 border border-white/10">
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
