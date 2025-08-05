import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/AdminLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, ArrowLeft } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { AddExerciseToSessionModal } from "@/components/AddExerciseToSessionModal"

const daysOfWeek = [
  { value: 1, label: "Ponedjeljak" },
  { value: 2, label: "Utorak" },
  { value: 3, label: "Srijeda" },
  { value: 4, label: "Četvrtak" },
  { value: 5, label: "Petak" },
  { value: 6, label: "Subota" },
  { value: 0, label: "Nedjelja" }
]

interface WorkoutExercise {
  id: string
  exerciseId: string
  exerciseName: string
  muscleGroup: string
  sets: number
  reps: number
  rest: number
}

interface WorkoutSession {
  id: string
  name: string
  exercises: WorkoutExercise[]
}

interface DayPlan {
  sessions: WorkoutSession[]
}

interface WeekPlan {
  [day: number]: DayPlan
}

export default function TrainingPlanCreator() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [planName, setPlanName] = useState("")
  const [isTemplate, setIsTemplate] = useState(false)
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({})
  const [addExerciseModalOpen, setAddExerciseModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  // Initialize empty week plan
  useEffect(() => {
    const initPlan: WeekPlan = {}
    daysOfWeek.forEach(day => {
      initPlan[day.value] = { sessions: [] }
    })
    setWeekPlan(initPlan)
  }, [])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const handleAddSession = (day: number) => {
    const newSession: WorkoutSession = {
      id: generateId(),
      name: "",
      exercises: []
    }

    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        sessions: [...prev[day].sessions, newSession]
      }
    }))
  }

  const handleRemoveSession = (day: number, sessionId: string) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        sessions: prev[day].sessions.filter(session => session.id !== sessionId)
      }
    }))
  }

  const handleUpdateSessionName = (day: number, sessionId: string, name: string) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        sessions: prev[day].sessions.map(session =>
          session.id === sessionId ? { ...session, name } : session
        )
      }
    }))
  }

  const handleAddExercise = (day: number, sessionId: string) => {
    setSelectedDay(day)
    setSelectedSessionId(sessionId)
    setAddExerciseModalOpen(true)
  }

  const handleExerciseAdded = (exercise: any, sets: number, reps: number, rest: number) => {
    if (selectedDay !== null && selectedSessionId !== null) {
      const newExercise: WorkoutExercise = {
        id: generateId(),
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroup: exercise.muscle_group || "",
        sets,
        reps,
        rest
      }

      setWeekPlan(prev => ({
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          sessions: prev[selectedDay].sessions.map(session =>
            session.id === selectedSessionId
              ? { ...session, exercises: [...session.exercises, newExercise] }
              : session
          )
        }
      }))
    }
  }

  const handleRemoveExercise = (day: number, sessionId: string, exerciseId: string) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        sessions: prev[day].sessions.map(session =>
          session.id === sessionId
            ? { ...session, exercises: session.exercises.filter(ex => ex.id !== exerciseId) }
            : session
        )
      }
    }))
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

    // Check if at least one session with exercises is added
    const hasAnySession = Object.values(weekPlan).some(dayPlan =>
      dayPlan.sessions.some(session => session.exercises.length > 0)
    )

    if (!hasAnySession) {
      toast({
        title: "Greška",
        description: "Molim dodajte barem jednu sesiju s vježbama",
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
          client_id: null, // Will be assigned when coach assigns plan to specific client
          start_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single()

      if (planError) throw planError

      // Create workout sessions and exercises
      for (const [day, dayPlan] of Object.entries(weekPlan)) {
        for (const session of dayPlan.sessions) {
          if (session.exercises.length > 0 && session.name.trim()) {
            const { data: sessionData, error: sessionError } = await supabase
              .from('workout_sessions')
              .insert({
                training_plan_id: plan.id,
                session_name: session.name,
                day_of_week: parseInt(day)
              })
              .select()
              .single()

            if (sessionError) throw sessionError

            const exerciseData = session.exercises.map(exercise => ({
              workout_session_id: sessionData.id,
              exercise_id: exercise.exerciseId,
              sets: exercise.sets,
              reps: exercise.reps,
              rest_period_seconds: exercise.rest
            }))

            const { error: exercisesError } = await supabase
              .from('workout_exercises')
              .insert(exerciseData)

            if (exercisesError) throw exercisesError
          }
        }
      }

      toast({
        title: "Uspjeh",
        description: `Plan treninga "${planName}" je uspješno kreiran`
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
              Kreirajte tjedni plan treninga organizovan po danima i sesijama
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="planName">Ime Plana</Label>
                <Input
                  id="planName"
                  placeholder="npr. Push Pull Legs - Tjedan 1"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <Checkbox
                  id="isTemplate"
                  checked={isTemplate}
                  onCheckedChange={(checked) => setIsTemplate(checked as boolean)}
                />
                <Label htmlFor="isTemplate">Spremi kao predložak</Label>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Tjedni Plan Treninga</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {daysOfWeek.map((day) => (
                  <Card key={day.value} className="h-fit">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{day.label}</CardTitle>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddSession(day.value)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {weekPlan[day.value]?.sessions.map((session) => (
                        <div key={session.id} className="space-y-3 p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Ime sesije..."
                              value={session.name}
                              onChange={(e) => handleUpdateSessionName(day.value, session.id, e.target.value)}
                              className="text-sm"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveSession(day.value, session.id)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground">Vježbe</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddExercise(day.value, session.id)}
                                className="h-6 px-2 text-xs"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {session.exercises.map((exercise) => (
                              <div
                                key={exercise.id}
                                className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                              >
                                <div className="flex-1">
                                  <span className="font-medium">{exercise.exerciseName}</span>
                                  <div className="flex gap-1 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {exercise.sets}x{exercise.reps}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {exercise.rest}s
                                    </Badge>
                                    {exercise.muscleGroup && (
                                      <Badge variant="outline" className="text-xs">
                                        {exercise.muscleGroup}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveExercise(day.value, session.id, exercise.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            ))}

                            {session.exercises.length === 0 && (
                              <p className="text-xs text-muted-foreground p-2 text-center">
                                Nema dodanih vježbi
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {weekPlan[day.value]?.sessions.length === 0 && (
                        <p className="text-sm text-muted-foreground p-4 text-center">
                          Nema sesija za ovaj dan
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
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

        <AddExerciseToSessionModal
          isOpen={addExerciseModalOpen}
          onClose={() => setAddExerciseModalOpen(false)}
          onAddExercise={handleExerciseAdded}
        />
      </div>
    </AdminLayout>
  )
}