import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const trainingTypeOptions = [
  { value: 'cardio', label: 'Kardio' },
  { value: 'strength', label: 'Snaga' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'flexibility', label: 'Fleksibilnost' },
  { value: 'sports', label: 'Sport' },
];

const intensityOptions = [
  { value: 'low', label: 'Nizak' },
  { value: 'medium', label: 'Srednji' },
  { value: 'high', label: 'Visok' },
];

interface EditTrainingSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: {
    id: string;
    training_type: string;
    intensity: string;
    scheduled_time: string;
    duration_minutes: number;
    pre_workout_notes?: string;
    during_workout_notes?: string;
    post_workout_notes?: string;
  };
  onSessionUpdated: () => void;
}

export function EditTrainingSessionModal({ 
  open, 
  onOpenChange, 
  session, 
  onSessionUpdated 
}: EditTrainingSessionModalProps) {
  const { toast } = useToast();
  const [trainingType, setTrainingType] = useState(session.training_type);
  const [intensity, setIntensity] = useState(session.intensity);
  const [scheduledTime, setScheduledTime] = useState(session.scheduled_time);
  const [duration, setDuration] = useState(session.duration_minutes.toString());
  const [preWorkoutNotes, setPreWorkoutNotes] = useState(session.pre_workout_notes || "");
  const [duringWorkoutNotes, setDuringWorkoutNotes] = useState(session.during_workout_notes || "");
  const [postWorkoutNotes, setPostWorkoutNotes] = useState(session.post_workout_notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTrainingType(session.training_type);
      setIntensity(session.intensity);
      setScheduledTime(session.scheduled_time);
      setDuration(session.duration_minutes.toString());
      setPreWorkoutNotes(session.pre_workout_notes || "");
      setDuringWorkoutNotes(session.during_workout_notes || "");
      setPostWorkoutNotes(session.post_workout_notes || "");
    }
  }, [open, session]);

  const handleSubmit = async () => {
    if (!trainingType || !intensity || !scheduledTime || !duration) {
      toast({
        title: "Greška",
        description: "Molimo ispunite sva obavezna polja",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('training_sessions')
        .update({
          training_type: trainingType,
          intensity: intensity,
          scheduled_time: scheduledTime,
          duration_minutes: parseInt(duration),
          pre_workout_notes: preWorkoutNotes || null,
          during_workout_notes: duringWorkoutNotes || null,
          post_workout_notes: postWorkoutNotes || null,
        })
        .eq('id', session.id);

      if (error) throw error;

      toast({
        title: "Uspjeh",
        description: "Trening je uspješno ažuriran",
      });

      onSessionUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating training session:', error);
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom ažuriranja treninga",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Uredi Trening</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Training Type */}
          <div className="space-y-2">
            <Label>Tip Treninga *</Label>
            <Select value={trainingType} onValueChange={setTrainingType}>
              <SelectTrigger>
                <SelectValue placeholder="Odaberi tip treninga" />
              </SelectTrigger>
              <SelectContent>
                {trainingTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Intensity */}
          <div className="space-y-2">
            <Label>Intenzitet *</Label>
            <Select value={intensity} onValueChange={setIntensity}>
              <SelectTrigger>
                <SelectValue placeholder="Odaberi intenzitet" />
              </SelectTrigger>
              <SelectContent>
                {intensityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scheduled Time */}
          <div className="space-y-2">
            <Label>Vrijeme *</Label>
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Trajanje (minute) *</Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="npr. 60"
            />
          </div>

          {/* Pre-Workout Notes */}
          <div className="space-y-2">
            <Label>Napomene Prije Treninga</Label>
            <Textarea
              value={preWorkoutNotes}
              onChange={(e) => setPreWorkoutNotes(e.target.value)}
              placeholder="Napomene o prehrani prije treninga..."
              rows={2}
            />
          </div>

          {/* During Workout Notes */}
          <div className="space-y-2">
            <Label>Napomene Tijekom Treninga</Label>
            <Textarea
              value={duringWorkoutNotes}
              onChange={(e) => setDuringWorkoutNotes(e.target.value)}
              placeholder="Napomene o hidrataciji, suplementima..."
              rows={2}
            />
          </div>

          {/* Post-Workout Notes */}
          <div className="space-y-2">
            <Label>Napomene Nakon Treninga</Label>
            <Textarea
              value={postWorkoutNotes}
              onChange={(e) => setPostWorkoutNotes(e.target.value)}
              placeholder="Napomene o oporavku, prehrani..."
              rows={2}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Odustani
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Spremanje..." : "Spremi Promjene"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
