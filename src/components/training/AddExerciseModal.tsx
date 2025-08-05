import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

interface AddExerciseModalProps {
  isOpen: boolean
  onClose: () => void
}

const muscleGroups = [
  "Prsa",
  "Leđa", 
  "Ramena",
  "Ruke",
  "Noge",
  "Core",
  "Kardio",
  "Cijelo tijelo",
  "Ostalo"
]

export function AddExerciseModal({ isOpen, onClose }: AddExerciseModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    video_url: "",
    muscle_group: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const { profile } = useAuth()

  const addExerciseMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("exercise_database")
        .insert([{
          ...data,
          coach_id: profile?.id
        }])
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
      toast.success("Vježba je uspješno dodana")
      onClose()
      setFormData({ name: "", description: "", video_url: "", muscle_group: "" })
    },
    onError: (error) => {
      toast.error("Greška pri dodavanju vježbe")
      console.error("Error adding exercise:", error)
    },
    onSettled: () => {
      setIsSubmitting(false)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("Ime vježbe je obavezno")
      return
    }
    
    setIsSubmitting(true)
    addExerciseMutation.mutate(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dodaj novu vježbu</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ime vježbe *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Unesite ime vježbe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="muscle_group">Grupa mišića</Label>
            <Select
              value={formData.muscle_group}
              onValueChange={(value) => setFormData({ ...formData, muscle_group: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Odaberite grupu mišića" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Unesite opis vježbe"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL</Label>
            <Input
              id="video_url"
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Odustani
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Dodajem..." : "Dodaj vježbu"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}