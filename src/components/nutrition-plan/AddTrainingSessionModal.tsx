import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

const trainingTypes = [
  { value: 'cardio', label: 'Kardio' },
  { value: 'strength', label: 'Snaga' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'flexibility', label: 'Fleksibilnost' },
  { value: 'sport', label: 'Sport' },
  { value: 'other', label: 'Ostalo' },
]

const intensityLevels = [
  { value: 'light', label: 'Lagano' },
  { value: 'moderate', label: 'Umjereno' },
  { value: 'high', label: 'Visoko' },
]

interface AddTrainingSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planId: string
  dayOfWeek: number
  onSessionAdded: () => void
}

export function AddTrainingSessionModal({
  open,
  onOpenChange,
  planId,
  dayOfWeek,
  onSessionAdded
}: AddTrainingSessionModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [trainingType, setTrainingType] = useState('strength')
  const [intensity, setIntensity] = useState('moderate')
  const [scheduledTime, setScheduledTime] = useState('17:00')
  const [duration, setDuration] = useState('60')
  const [preWorkoutNotes, setPreWorkoutNotes] = useState('')
  const [duringWorkoutNotes, setDuringWorkoutNotes] = useState('')
  const [postWorkoutNotes, setPostWorkoutNotes] = useState('')

  const handleSubmit = async () => {
    if (!duration || parseInt(duration) <= 0) {
      toast({
        title: "Greška",
        description: "Unesite ispravno trajanje",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const sessionData = {
        meal_plan_id: planId,
        day_of_week: dayOfWeek,
        training_type: trainingType,
        intensity: intensity,
        scheduled_time: scheduledTime,
        duration_minutes: parseInt(duration),
        pre_workout_notes: preWorkoutNotes || null,
        during_workout_notes: duringWorkoutNotes || null,
        post_workout_notes: postWorkoutNotes || null,
        gradient_color: 'gradient-training'
      }

      const { error } = await supabase
        .from('training_sessions')
        .insert(sessionData)

      if (error) throw error

      toast({
        title: "Uspjeh",
        description: "Trening je dodan"
      })

      onSessionAdded()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error('Error adding training:', error)
      toast({
        title: "Greška",
        description: "Nije moguće dodati trening",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTrainingType('strength')
    setIntensity('moderate')
    setScheduledTime('17:00')
    setDuration('60')
    setPreWorkoutNotes('')
    setDuringWorkoutNotes('')
    setPostWorkoutNotes('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj Trening Sesiju</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Training Type & Intensity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tip Treninga *</Label>
              <Select value={trainingType} onValueChange={setTrainingType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {trainingTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Intenzitet *</Label>
              <Select value={intensity} onValueChange={setIntensity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {intensityLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Vrijeme *</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Trajanje (minute) *</Label>
              <Input
                type="number"
                placeholder="60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                step="1"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Napomene Prije Treninga</Label>
            <Textarea
              placeholder="npr. Priprema, zagrijavanje..."
              value={preWorkoutNotes}
              onChange={(e) => setPreWorkoutNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label>Napomene Tijekom Treninga</Label>
            <Textarea
              placeholder="npr. Vježbe, setovi, ponavljanja..."
              value={duringWorkoutNotes}
              onChange={(e) => setDuringWorkoutNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label>Napomene Nakon Treninga</Label>
            <Textarea
              placeholder="npr. Hlađenje, istezanje..."
              value={postWorkoutNotes}
              onChange={(e) => setPostWorkoutNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                resetForm()
              }}
              disabled={loading}
            >
              Odustani
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Dodajem..." : "Dodaj Trening"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
