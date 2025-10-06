import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Apple, ChevronDown, ChevronUp, Calendar, Trash2, RotateCcw } from "lucide-react"

interface NutritionPlan {
  id: string
  name: string
  client_id: string
  start_date: string | null
  end_date: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  daily_calories_target: number | null
  daily_protein_target: number | null
  daily_carbs_target: number | null
  daily_fats_target: number | null
}

interface MealPlanEntry {
  id: string
  day_of_week: number
  meal_type: string
  quantity: number | null
  food: {
    name: string
    calories: number | null
  } | null
  recipe: {
    name: string
  } | null
}

interface NutritionPlanViewProps {
  clientId: string
  onPlanRemoved: () => void
  readOnly?: boolean
}

const dayNames = [
  'Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'
]

const mealTypeNames = {
  'breakfast': 'Doručak',
  'lunch': 'Ručak',
  'dinner': 'Večera',
  'snack': 'Užina'
}

export function NutritionPlanView({ clientId, onPlanRemoved, readOnly = false }: NutritionPlanViewProps) {
  const [plan, setPlan] = useState<NutritionPlan | null>(null)
  const [entries, setEntries] = useState<MealPlanEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set())
  const [removing, setRemoving] = useState(false)
  const { toast } = useToast()

  const fetchAssignedPlan = async () => {
    try {
      const { data: planData, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle()

      if (planError || !planData) {
        setPlan(null)
        return
      }

      setPlan(planData)

      // Fetch meal plan entries
      const { data: entriesData, error: entriesError } = await supabase
          .from('meal_plan_entries')
          .select(`
            *,
            food:food_database (
              name,
              calories
            ),
            recipe:recipes (
              name
            )
          `)
          .eq('meal_plan_id', planData.id)
          .order('day_of_week')
          .order('meal_type')

      if (entriesError) throw entriesError
      setEntries(entriesData as any || [])
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno dohvaćanje plana prehrane",
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
        .from('meal_plans')
        .update({ client_id: null })
        .eq('id', plan.id)

      if (error) throw error

      toast({
        title: "Uspjeh",
        description: "Plan prehrane je uklonjen s klijenta"
      })
      
      onPlanRemoved()
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno uklanjanje plana prehrane",
        variant: "destructive"
      })
    } finally {
      setRemoving(false)
    }
  }

  const toggleDay = (dayOfWeek: number) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(dayOfWeek)) {
      newExpanded.delete(dayOfWeek)
    } else {
      newExpanded.add(dayOfWeek)
    }
    setExpandedDays(newExpanded)
  }

  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.day_of_week]) {
      acc[entry.day_of_week] = {}
    }
    if (!acc[entry.day_of_week][entry.meal_type]) {
      acc[entry.day_of_week][entry.meal_type] = []
    }
    acc[entry.day_of_week][entry.meal_type].push(entry)
    return acc
  }, {} as Record<number, Record<string, MealPlanEntry[]>>)

  useEffect(() => {
    fetchAssignedPlan()
  }, [clientId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-muted-foreground">Učitavam plan prehrane...</div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Apple className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nema dodijeljenog plana prehrane</p>
        <p className="text-sm">Dodijeli plan prehrane ovom klijentu</p>
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
                <Apple className="h-5 w-5" />
                {plan.name}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="default">Aktivan</Badge>
                {plan.start_date && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Dodijeljen {new Date(plan.start_date).toLocaleDateString('hr-HR')}
                  </div>
                )}
              </div>
              {plan.notes && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <h4 className="font-medium text-sm mb-1">Bilješke:</h4>
                  <p className="text-sm">{plan.notes}</p>
                </div>
              )}
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

      {/* Daily Meal Plans */}
      {entries.length > 0 ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => {
            const dayEntries = groupedEntries[dayOfWeek]
            if (!dayEntries || Object.keys(dayEntries).length === 0) return null

            return (
              <Collapsible key={dayOfWeek}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{dayNames[dayOfWeek]}</CardTitle>
                          <span className="text-sm text-muted-foreground">
                            {Object.keys(dayEntries).length} obroka
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => toggleDay(dayOfWeek)}>
                          {expandedDays.has(dayOfWeek) ? (
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
                      <div className="space-y-4">
                        {Object.entries(dayEntries).map(([mealType, mealEntries]) => (
                          <div key={mealType} className="space-y-2">
                            <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                              {mealTypeNames[mealType as keyof typeof mealTypeNames] || mealType}
                            </h4>
                            <div className="space-y-2">
                              {mealEntries.map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                  <div>
                                    <h5 className="font-medium">
                                      {entry.food?.name || entry.recipe?.name || 'Nepoznato'}
                                    </h5>
                                    {entry.food?.calories && (
                                      <p className="text-sm text-muted-foreground">
                                        {entry.food.calories} kcal po 100g
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-sm">
                                    {entry.quantity && <span>{entry.quantity}g</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            <p>Nema dodanih obroka u ovom planu prehrane</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}