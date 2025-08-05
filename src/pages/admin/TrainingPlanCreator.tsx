import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/AdminLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, ArrowLeft } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

const daysOfWeek = [
  { value: 1, label: "Ponedjeljak" },
  { value: 2, label: "Utorak" },
  { value: 3, label: "Srijeda" },
  { value: 4, label: "Četvrtak" },
  { value: 5, label: "Petak" },
  { value: 6, label: "Subota" },
  { value: 0, label: "Nedjelja" }
]

interface WorkoutSession {
  sessionName: string
  dayOfWeek: number
  exercises: WorkoutExercise[]
}

interface WorkoutExercise {
  exerciseId: string
  exerciseName: string
  sets: number
  reps: number
  restPeriod: number
}

export default function TrainingPlanCreator() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [planName, setPlanName] = useState("")
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [exercises, setExercises] = useState<any[]>([])

  useEffect(() => {
    fetchExercises()
  }, [])

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from('exercise_database')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching exercises:', error)
      return
    }
    
    setExercises(data || [])
  }

  const addSession = () => {
    setSessions([...sessions, {
      sessionName: "",
      dayOfWeek: 1,
      exercises: []
    }])
  }

  const removeSession = (sessionIndex: number) => {
    setSessions(sessions.filter((_, i) => i !== sessionIndex))
  }

  const updateSession = (sessionIndex: number, field: string, value: any) => {
    const updated = [...sessions]
    updated[sessionIndex] = { ...updated[sessionIndex], [field]: value }
    setSessions(updated)
  }

  const addExercise = (sessionIndex: number) => {
    const updated = [...sessions]
    updated[sessionIndex].exercises.push({
      exerciseId: "",
      exerciseName: "",
      sets: 3,
      reps: 12,
      restPeriod: 60
    })
    setSessions(updated)
  }

  const removeExercise = (sessionIndex: number, exerciseIndex: number) => {
    const updated = [...sessions]
    updated[sessionIndex].exercises = updated[sessionIndex].exercises.filter((_, i) => i !== exerciseIndex)
    setSessions(updated)
  }

  const updateExercise = (sessionIndex: number, exerciseIndex: number, field: string, value: any) => {
    const updated = [...sessions]
    updated[sessionIndex].exercises[exerciseIndex] = {
      ...updated[sessionIndex].exercises[exerciseIndex],
      [field]: value
    }

    if (field === 'exerciseId' && value) {
      const exercise = exercises.find(e => e.id === value)
      updated[sessionIndex].exercises[exerciseIndex].exerciseName = exercise?.name || ""
    }

    setSessions(updated)
  }

  const handleSubmit = async () => {
    if (!planName.trim()) {
      toast({
        title: "Greška",
        description: "Molim unesite ime plana",
        variant: "destructive"
      })
      return
    }

    if (sessions.length === 0) {
      toast({
        title: "Greška",
        description: "Molim dodajte barem jednu sesiju",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Create training plan
      const { data: plan, error: planError } = await supabase
        .from('training_plans')
        .insert({
          plan_name: planName,
          coach_id: (await supabase.auth.getUser()).data.user?.id,
          client_id: null, // Will be assigned when coach creates plan for specific client
          start_date: new Date().toISOString().split('T')[0],
          end_date: null
        })
        .select()
        .single()

      if (planError) throw planError

      // Create workout sessions and exercises
      for (const session of sessions) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('workout_sessions')
          .insert({
            training_plan_id: plan.id,
            session_name: session.sessionName,
            day_of_week: session.dayOfWeek
          })
          .select()
          .single()

        if (sessionError) throw sessionError

        if (session.exercises.length > 0) {
          const exerciseData = session.exercises.map(exercise => ({
            workout_session_id: sessionData.id,
            exercise_id: exercise.exerciseId,
            sets: exercise.sets,
            reps: exercise.reps,
            rest_period_seconds: exercise.restPeriod
          }))

          const { error: exercisesError } = await supabase
            .from('workout_exercises')
            .insert(exerciseData)

          if (exercisesError) throw exercisesError
        }
      }

      toast({
        title: "Uspjeh",
        description: "Plan treninga je uspješno kreiran"
      })

      navigate('/admin/training')
    } catch (error) {
      console.error('Error creating training plan:', error)
      toast({
        title: "Greška",
        description: "Dogodila se greška prilikom kreiranja plana",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Kreator Plana Treninga">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/training">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Natrag na Training Library
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kreiranje Novog Plana Treninga</CardTitle>
            <CardDescription>
              Kreirajte prilagođeni plan treninga za svoje klijente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="planName">Ime Plana</Label>
              <Input
                id="planName"
                placeholder="Unesite ime plana..."
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Trening Sesije</h3>
                <Button onClick={addSession} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj Sesiju
                </Button>
              </div>

              {sessions.map((session, sessionIndex) => (
                <Card key={sessionIndex} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <Label>Ime Sesije</Label>
                        <Input
                          placeholder="npr. Push Day, Pull Day..."
                          value={session.sessionName}
                          onChange={(e) => updateSession(sessionIndex, 'sessionName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Dan</Label>
                        <Select 
                          value={session.dayOfWeek.toString()} 
                          onValueChange={(value) => updateSession(sessionIndex, 'dayOfWeek', parseInt(value))}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {daysOfWeek.map(day => (
                              <SelectItem key={day.value} value={day.value.toString()}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSession(sessionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Vježbe</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addExercise(sessionIndex)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Dodaj Vježbu
                        </Button>
                      </div>

                      {session.exercises.map((exercise, exerciseIndex) => (
                        <Card key={exerciseIndex} className="p-3 bg-muted/50">
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                            <div className="md:col-span-2">
                              <Label className="text-xs">Vježba</Label>
                              <Select
                                value={exercise.exerciseId}
                                onValueChange={(value) => updateExercise(sessionIndex, exerciseIndex, 'exerciseId', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Odaberite vježbu" />
                                </SelectTrigger>
                                <SelectContent>
                                  {exercises.map(ex => (
                                    <SelectItem key={ex.id} value={ex.id}>
                                      {ex.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Serije</Label>
                              <Input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => updateExercise(sessionIndex, exerciseIndex, 'sets', parseInt(e.target.value))}
                                min="1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Ponavljanja</Label>
                              <Input
                                type="number"
                                value={exercise.reps}
                                onChange={(e) => updateExercise(sessionIndex, exerciseIndex, 'reps', parseInt(e.target.value))}
                                min="1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Odmor (s)</Label>
                              <Input
                                type="number"
                                value={exercise.restPeriod}
                                onChange={(e) => updateExercise(sessionIndex, exerciseIndex, 'restPeriod', parseInt(e.target.value))}
                                min="0"
                              />
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeExercise(sessionIndex, exerciseIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}

              {sessions.length === 0 && (
                <Card className="p-8 text-center text-muted-foreground">
                  <p>Dodajte trening sesije za kreiranje plana treninga</p>
                </Card>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                {loading ? "Spremam..." : "Kreiraj Plan"}
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin/training')}>
                Odustani
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}