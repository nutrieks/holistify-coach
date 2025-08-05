import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { AddExerciseModal } from "./AddExerciseModal"
import { EditExerciseModal } from "./EditExerciseModal"
import { toast } from "sonner"

export function ExerciseDatabase() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState(null)
  const queryClient = useQueryClient()

  const { data: exercises, isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercise_database")
        .select("*")
        .order("name")
      
      if (error) throw error
      return data
    }
  })

  const deleteExerciseMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      const { error } = await supabase
        .from("exercise_database")
        .delete()
        .eq("id", exerciseId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
      toast.success("Vježba je uspješno obrisana")
    },
    onError: (error) => {
      toast.error("Greška pri brisanju vježbe")
      console.error("Error deleting exercise:", error)
    }
  })

  const filteredExercises = exercises?.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.muscle_group?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleDelete = async (exerciseId: string) => {
    if (window.confirm("Jeste li sigurni da želite obrisati ovu vježbu?")) {
      deleteExerciseMutation.mutate(exerciseId)
    }
  }

  if (isLoading) {
    return <div>Učitavanje...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Pretraži vježbe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj novu vježbu
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => (
          <Card key={exercise.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{exercise.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingExercise(exercise)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(exercise.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {exercise.muscle_group && (
                <Badge variant="secondary" className="w-fit">
                  {exercise.muscle_group}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {exercise.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {exercise.description}
                </p>
              )}
              {exercise.video_url && (
                <a
                  href={exercise.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Pogledaj video
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? "Nema rezultata za pretragu." : "Nema dodanih vježbi."}
        </div>
      )}

      <AddExerciseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editingExercise && (
        <EditExerciseModal
          exercise={editingExercise}
          isOpen={!!editingExercise}
          onClose={() => setEditingExercise(null)}
        />
      )}
    </div>
  )
}