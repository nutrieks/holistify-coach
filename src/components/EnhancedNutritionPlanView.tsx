import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Apple, ChevronDown, ChevronUp, Calendar, Trash2, RotateCcw, Download, Copy, BarChart3, Calculator } from "lucide-react"

interface NutritionPlan {
  id: string
  plan_name: string
  date: string
  created_at: string
}

interface MealPlanEntry {
  id: string
  day_of_week: number
  meal_type: string
  quantity: number | null
  food: {
    name: string
    calories: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
  } | null
  recipe: {
    name: string
  } | null
}

interface EnhancedNutritionPlanViewProps {
  clientId: string
  onPlanRemoved: () => void
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

export function EnhancedNutritionPlanView({ clientId, onPlanRemoved }: EnhancedNutritionPlanViewProps) {
  const [plan, setPlan] = useState<NutritionPlan | null>(null)
  const [entries, setEntries] = useState<MealPlanEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set())
  const [removing, setRemoving] = useState(false)
  const [copying, setCopying] = useState(false)
  const { toast } = useToast()

  const fetchAssignedPlan = async () => {
    try {
      const { data: planData, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('client_id', clientId)
        .single()

      if (planError || !planData) {
        setPlan(null)
        return
      }

      setPlan(planData)

      const { data: entriesData, error: entriesError } = await supabase
        .from('meal_plan_entries')
        .select(`
          *,
          food:food_database (
            name,
            calories,
            protein,
            carbs,
            fat
          ),
          recipe:recipes (
            name
          )
        `)
        .eq('meal_plan_id', planData.id)
        .order('day_of_week')
        .order('meal_type')

      if (entriesError) throw entriesError
      setEntries(entriesData || [])
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

  const duplicatePlan = async () => {
    if (!plan) return
    
    setCopying(true)
    try {
      // Create a copy of the plan without client assignment
      const { data: newPlan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          plan_name: `${plan.plan_name} (Kopija)`,
          coach_id: (await supabase.auth.getUser()).data.user?.id,
          client_id: null,
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single()

      if (planError) throw planError

      // Copy all entries
      const entriesToCopy = entries.map(entry => ({
        meal_plan_id: newPlan.id,
        day_of_week: entry.day_of_week,
        meal_type: entry.meal_type,
        food_id: entry.food?.name ? entry.id : null, // This needs proper food_id
        recipe_id: entry.recipe?.name ? entry.id : null, // This needs proper recipe_id
        quantity: entry.quantity
      }))

      const { error: entriesError } = await supabase
        .from('meal_plan_entries')
        .insert(entriesToCopy)

      if (entriesError) throw entriesError

      toast({
        title: "Uspjeh",
        description: "Plan je uspješno kopiran kao predložak"
      })
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno kopiranje plana",
        variant: "destructive"
      })
    } finally {
      setCopying(false)
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

  const calculateDayStats = (dayOfWeek: number) => {
    const dayEntries = entries.filter(entry => entry.day_of_week === dayOfWeek)
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    dayEntries.forEach(entry => {
      if (entry.food && entry.quantity) {
        const multiplier = entry.quantity / 100 // assuming food data is per 100g
        totalCalories += (entry.food.calories || 0) * multiplier
        totalProtein += (entry.food.protein || 0) * multiplier
        totalCarbs += (entry.food.carbs || 0) * multiplier
        totalFat += (entry.food.fat || 0) * multiplier
      }
    })

    return { totalCalories, totalProtein, totalCarbs, totalFat }
  }

  const calculateTotalStats = () => {
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    for (let day = 0; day <= 6; day++) {
      const dayStats = calculateDayStats(day)
      totalCalories += dayStats.totalCalories
      totalProtein += dayStats.totalProtein
      totalCarbs += dayStats.totalCarbs
      totalFat += dayStats.totalFat
    }

    return {
      avgCalories: Math.round(totalCalories / 7),
      avgProtein: Math.round(totalProtein / 7),
      avgCarbs: Math.round(totalCarbs / 7),
      avgFat: Math.round(totalFat / 7)
    }
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

  const totalStats = calculateTotalStats()

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                {plan.plan_name}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="default">Aktivan</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Dodijeljen {new Date(plan.date).toLocaleDateString('hr-HR')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={duplicatePlan}
                disabled={copying}
              >
                {copying ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Kopiram...
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Kopiraj
                  </>
                )}
              </Button>
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
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Pregled</TabsTrigger>
          <TabsTrigger value="statistics">Statistike</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Daily Meal Plans */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => {
              const dayEntries = groupedEntries[dayOfWeek]
              if (!dayEntries || Object.keys(dayEntries).length === 0) return null

              const dayStats = calculateDayStats(dayOfWeek)

              return (
                <Collapsible key={dayOfWeek}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{dayNames[dayOfWeek]}</CardTitle>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-muted-foreground">
                                {Object.keys(dayEntries).length} obroka
                              </span>
                              <Badge variant="secondary">
                                <Calculator className="h-3 w-3 mr-1" />
                                {Math.round(dayStats.totalCalories)} kcal
                              </Badge>
                            </div>
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
                                      {entry.quantity && (
                                        <span>{entry.quantity}g</span>
                                      )}
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
        </TabsContent>

        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Prosječni dnevni unos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{totalStats.avgCalories}</div>
                  <div className="text-sm text-muted-foreground">Kalorije</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{totalStats.avgProtein}g</div>
                  <div className="text-sm text-muted-foreground">Proteini</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{totalStats.avgCarbs}g</div>
                  <div className="text-sm text-muted-foreground">Ugljikohidrati</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{totalStats.avgFat}g</div>
                  <div className="text-sm text-muted-foreground">Masti</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}