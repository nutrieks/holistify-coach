import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Apple, Clock, Calendar, Search, Filter, Eye, ChevronDown, ChevronUp } from "lucide-react"

interface NutritionPlan {
  id: string
  plan_name: string
  date: string
  created_at: string
  coach_id: string
  client_id: string | null
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

interface EnhancedAssignNutritionPlanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  onPlanAssigned: () => void
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

export function EnhancedAssignNutritionPlanModal({ 
  open, 
  onOpenChange, 
  clientId, 
  onPlanAssigned 
}: EnhancedAssignNutritionPlanModalProps) {
  const [plans, setPlans] = useState<NutritionPlan[]>([])
  const [filteredPlans, setFilteredPlans] = useState<NutritionPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [previewPlan, setPreviewPlan] = useState<string | null>(null)
  const [previewEntries, setPreviewEntries] = useState<MealPlanEntry[]>([])
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  const fetchAvailablePlans = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('coach_id', user.id)
        .is('client_id', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPlans(data || [])
      setFilteredPlans(data || [])
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno dohvaćanje planova prehrane",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPlanPreview = async (planId: string) => {
    if (previewPlan === planId) {
      setPreviewPlan(null)
      setPreviewEntries([])
      return
    }

    setPreviewPlan(planId)
    try {
      const { data, error } = await supabase
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
        .eq('meal_plan_id', planId)
        .order('day_of_week')
        .order('meal_type')

      if (error) throw error
      setPreviewEntries(data || [])
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno učitavanje pregleda plana",
        variant: "destructive"
      })
    }
  }

  const assignPlan = async (planId: string) => {
    setAssigning(planId)
    try {
      const { error } = await supabase
        .from('meal_plans')
        .update({ 
          client_id: clientId,
          date: new Date().toISOString().split('T')[0]
        })
        .eq('id', planId)

      if (error) throw error

      toast({
        title: "Uspjeh",
        description: "Plan prehrane je uspješno dodijeljen klijentu"
      })
      
      onPlanAssigned()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješna dodjela plana prehrane",
        variant: "destructive"
      })
    } finally {
      setAssigning(null)
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

  // Filter and search logic
  useEffect(() => {
    let filtered = plans.filter(plan =>
      plan.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "created_at") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === "name") {
        return a.plan_name.localeCompare(b.plan_name)
      }
      return 0
    })

    setFilteredPlans(filtered)
  }, [plans, searchTerm, sortBy])

  useEffect(() => {
    if (open) {
      fetchAvailablePlans()
      setSearchTerm("")
      setSortBy("created_at")
      setPreviewPlan(null)
      setPreviewEntries([])
    }
  }, [open])

  const groupedEntries = previewEntries.reduce((acc, entry) => {
    if (!acc[entry.day_of_week]) {
      acc[entry.day_of_week] = {}
    }
    if (!acc[entry.day_of_week][entry.meal_type]) {
      acc[entry.day_of_week][entry.meal_type] = []
    }
    acc[entry.day_of_week][entry.meal_type].push(entry)
    return acc
  }, {} as Record<number, Record<string, MealPlanEntry[]>>)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5" />
            Dodijeli Plan Prehrane
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plans">Planovi</TabsTrigger>
            <TabsTrigger value="preview" disabled={!previewPlan}>
              Pregled {previewPlan && `(${plans.find(p => p.id === previewPlan)?.plan_name})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pretraži planove..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Najnoviji prvo</SelectItem>
                  <SelectItem value="name">Naziv A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="max-h-[50vh]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-pulse text-muted-foreground">Učitavam planove...</div>
                </div>
              ) : filteredPlans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Apple className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    {searchTerm ? "Nema planova koji odgovaraju pretraživanju" : "Nema dostupnih planova prehrane"}
                  </p>
                  {!searchTerm && (
                    <p className="text-sm">Kreirajte novi plan da biste ga mogli dodijeliti klijentu</p>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredPlans.map((plan) => (
                    <Card key={plan.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(plan.created_at).toLocaleDateString('hr-HR')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Kreiran {new Date(plan.created_at).toLocaleDateString('hr-HR')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => fetchPlanPreview(plan.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Pregled
                            </Button>
                            <Button 
                              onClick={() => assignPlan(plan.id)}
                              disabled={assigning === plan.id}
                              size="sm"
                            >
                              {assigning === plan.id ? "Dodeljujem..." : "Dodijeli"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="preview">
            {previewPlan && (
              <ScrollArea className="max-h-[60vh]">
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
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}