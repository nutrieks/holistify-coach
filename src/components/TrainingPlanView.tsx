import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Dumbbell, ChevronDown, ChevronUp, Calendar, Trash2, Clock, RotateCcw } from "lucide-react"

interface TrainingPlan {
  id: string
  name: string
  client_id: string
  start_date: string | null
  end_date: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Exercise {
  exercise_id: string
  sets: number
  reps: string
  rest_seconds: number
  notes?: string
}

interface WorkoutSession {
  id: string
  session_name: string
  day_of_week: number
  exercises: Exercise[]
  notes: string | null
}

interface TrainingPlanViewProps {
  clientId: string
  onPlanRemoved: () => void
  readOnly?: boolean
}

const dayNames = [
  'Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'
]

export function TrainingPlanView({ clientId, onPlanRemoved, readOnly = false }: TrainingPlanViewProps) {
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
  const [removing, setRemoving] = useState(false)
  const { toast } = useToast()

  const fetchAssignedPlan = async () => {
    try {
      const { data: planData, error: planError } = await supabase
        .from('training_plans')
        .select('*')
        .eq('client_id', clientId)
        .single()

      if (planError || !planData) {
        setPlan(null)
        return
      }

      setPlan(planData)

      const { data: sessionsData, error: sessionsError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('training_plan_id', planData.id)
        .order('day_of_week')

      if (sessionsError) throw sessionsError
      
      // Parse exercises from JSONB and fetch exercise details
      const sessionsWithExercises = await Promise.all((sessionsData || []).map(async (session) => {
        const exercises = session.exercises as any
        const exerciseIds = Array.isArray(exercises) 
          ? exercises.map((ex: any) => ex.exercise_id).filter(Boolean)
          : []
        
        if (exerciseIds.length === 0) {
          return { ...session, exercises: [] }
        }
        
        const { data: exerciseDetails } = await supabase
          .from('exercise_database')
          .select('id, name, muscle_group')
          .in('id', exerciseIds)
        
        const exercisesWithDetails = Array.isArray(exercises)
          ? exercises.map((ex: any) => {
              const detail = exerciseDetails?.find((d: any) => d.id === ex.exercise_id)
              return {
                ...ex,
                exercise: detail || { name: 'Nepoznato', muscle_group: null }
              }
            })
          : []
        
        return {
          ...session,
          exercises: exercisesWithDetails
        }
      }))
      
      setSessions(sessionsWithExercises as any)
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno dohvaćanje plana treninga",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const removePlan = async () => {
    if (!plan) return
    
    setRemoving(true)
    try {
      const { error } = await supabase
        .from('training_plans')
        .update({ client_id: null, start_date: null, end_date: null })
        .eq('id', plan.id)

      if (error) throw error

      toast({
        title: "Uspjeh",
        description: "Plan treninga je uklonjen s klijenta"
      })
      
      onPlanRemoved()
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno uklanjanje plana treninga",
        variant: "destructive"
      })
    } finally {
      setRemoving(false)
    }
  }

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions)
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId)
    } else {
      newExpanded.add(sessionId)
    }
    setExpandedSessions(newExpanded)
  }

  useEffect(() => {
    fetchAssignedPlan()
  }, [clientId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-muted-foreground">Učitavam plan treninga...</div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nema dodijeljenog plana treninga</p>
        <p className="text-sm">Dodijeli plan treninga ovom klijentu</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                {plan.name}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="default">Aktivan</Badge>
                {plan.start_date && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Započet {new Date(plan.start_date).toLocaleDateString('hr-HR')}
                  </div>
                )}
              </div>
            </div>
            {!readOnly && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={removePlan}
                disabled={removing}
              >
                {removing ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Uklanjam...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Ukloni Plan
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Workout Sessions */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <Collapsible key={session.id}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{session.session_name}</CardTitle>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge variant="outline">{dayNames[session.day_of_week]}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {session.exercises.length} vježbi
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toggleSession(session.id)}>
                      {expandedSessions.has(session.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {session.exercises.map((exercise: any, idx: number) => (
                      <div key={`${exercise.exercise_id}-${idx}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <h4 className="font-medium">{exercise.exercise?.name || 'Nepoznato'}</h4>
                          {exercise.exercise?.muscle_group && (
                            <p className="text-sm text-muted-foreground">{exercise.exercise.muscle_group}</p>
                          )}
                          {exercise.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{exercise.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          {exercise.sets && (
                            <span>{exercise.sets} serija</span>
                          )}
                          {exercise.reps && (
                            <span>{exercise.reps} ponavljanja</span>
                          )}
                          {exercise.rest_seconds && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor(exercise.rest_seconds / 60)}min
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}