import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"

interface Exercise {
  id: string
  name: string
  muscle_group: string
  description?: string
  video_url?: string
}

interface AddExerciseToSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddExercise: (exercise: Exercise, sets: number, reps: number, rest: number) => void
}

export function AddExerciseToSessionModal({ isOpen, onClose, onAddExercise }: AddExerciseToSessionModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(12)
  const [rest, setRest] = useState(60)

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercise_database")
        .select("*")
        .order("name")
      
      if (error) throw error
      return data || []
    }
  })

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.muscle_group?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddExercise = () => {
    if (selectedExercise) {
      onAddExercise(selectedExercise, sets, reps, rest)
      setSelectedExercise(null)
      setSets(3)
      setReps(12)
      setRest(60)
      onClose()
    }
  }

  const resetForm = () => {
    setSelectedExercise(null)
    setSets(3)
    setReps(12)
    setRest(60)
    setSearchTerm("")
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Dodaj Vježbu u Sesiju</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Left side - Exercise selection */}
          <div className="flex-1 flex flex-col">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pretraži vježbe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="text-center py-8">Učitavanje vježbi...</div>
              ) : filteredExercises.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nema pronađenih vježbi
                </div>
              ) : (
                filteredExercises.map((exercise) => (
                  <Card
                    key={exercise.id}
                    className={`cursor-pointer transition-colors ${
                      selectedExercise?.id === exercise.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{exercise.name}</h4>
                          {exercise.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {exercise.description}
                            </p>
                          )}
                        </div>
                        {exercise.muscle_group && (
                          <Badge variant="secondary" className="ml-2">
                            {exercise.muscle_group}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Right side - Exercise parameters */}
          <div className="w-80 border-l pl-6">
            <h3 className="font-semibold mb-4">Parametri Vježbe</h3>
            
            {selectedExercise ? (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium">{selectedExercise.name}</h4>
                  {selectedExercise.muscle_group && (
                    <Badge variant="secondary" className="mt-2">
                      {selectedExercise.muscle_group}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="sets">Serije</Label>
                    <Input
                      id="sets"
                      type="number"
                      min="1"
                      max="10"
                      value={sets}
                      onChange={(e) => setSets(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reps">Ponavljanja</Label>
                    <Input
                      id="reps"
                      type="number"
                      min="1"
                      max="100"
                      value={reps}
                      onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rest">Odmor (s)</Label>
                    <Input
                      id="rest"
                      type="number"
                      min="0"
                      max="300"
                      value={rest}
                      onChange={(e) => setRest(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddExercise} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Dodaj Vježbu
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Odustani
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Odaberite vježbu za postavke parametara
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}