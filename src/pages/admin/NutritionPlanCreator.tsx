import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/AdminLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowLeft, Trash2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { AddMealModal } from "@/components/AddMealModal"
import { AddCategoryModal } from "@/components/AddCategoryModal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const daysOfWeek = [
  { value: 1, label: "Ponedjeljak" },
  { value: 2, label: "Utorak" },
  { value: 3, label: "Srijeda" },
  { value: 4, label: "Četvrtak" },
  { value: 5, label: "Petak" },
  { value: 6, label: "Subota" },
  { value: 0, label: "Nedjelja" }
]

const mealTypes = [
  { key: "doručak", label: "Doručak" },
  { key: "ručak", label: "Ručak" },
  { key: "večera", label: "Večera" },
  { key: "užina", label: "Užina" }
]

interface MealItem {
  id: string
  type: 'food' | 'recipe' | 'category'
  name: string
  quantity: number
}

interface DayPlan {
  [mealType: string]: MealItem[]
}

interface WeekPlan {
  [day: number]: DayPlan
}

export default function NutritionPlanCreator() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [planName, setPlanName] = useState("")
  const [planLevel, setPlanLevel] = useState<1 | 2 | 3>(3)
  const [isTemplate, setIsTemplate] = useState(false)
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({})
  const [addMealModalOpen, setAddMealModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null)
  
  // Level 1 specific state
  const [weeklyFocus, setWeeklyFocus] = useState("")
  const [selectedHabits, setSelectedHabits] = useState<string[]>([])
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([])
  
  // Level 2 specific state
  const [categoryPlan, setCategoryPlan] = useState<WeekPlan>({})
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false)
  
  // Data for selects
  const [habits, setHabits] = useState<any[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch habits
        const { data: habitsData } = await supabase
          .from('habits')
          .select('*')
          .eq('coach_id', user.id)

        // Fetch recipes
        const { data: recipesData } = await supabase
          .from('recipes')
          .select('*')
          .eq('coach_id', user.id)

        // Fetch food categories
        const { data: categoriesData } = await supabase
          .from('food_categories')
          .select('*')
          .eq('coach_id', user.id)

        setHabits(habitsData || [])
        setRecipes(recipesData || [])
        setCategories(categoriesData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  // Initialize empty week plan
  useEffect(() => {
    const initPlan: WeekPlan = {}
    daysOfWeek.forEach(day => {
      initPlan[day.value] = {}
      mealTypes.forEach(meal => {
        initPlan[day.value][meal.key] = []
      })
    })
    setWeekPlan(initPlan)
    setCategoryPlan(initPlan)
  }, [])

  const handleAddMeal = (day: number, mealType: string) => {
    setSelectedDay(day)
    setSelectedMealType(mealType)
    setAddMealModalOpen(true)
  }

  const handleMealAdded = (item: { type: 'food' | 'recipe'; id: string; name: string; quantity: number }) => {
    if (selectedDay !== null && selectedMealType !== null) {
      const newMealItem: MealItem = {
        id: item.id,
        type: item.type,
        name: item.name,
        quantity: item.quantity
      }

      setWeekPlan(prev => ({
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          [selectedMealType]: [...(prev[selectedDay]?.[selectedMealType] || []), newMealItem]
        }
      }))
    }
  }

  const handleRemoveMeal = (day: number, mealType: string, index: number) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: prev[day][mealType].filter((_, i) => i !== index)
      }
    }))
  }

  const handleCategoryAdded = (item: { id: string; name: string; quantity: number }) => {
    if (selectedDay !== null && selectedMealType !== null) {
      const newCategoryItem: MealItem = {
        id: item.id,
        type: 'category',
        name: item.name,
        quantity: item.quantity
      }

      setCategoryPlan(prev => ({
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          [selectedMealType]: [...(prev[selectedDay]?.[selectedMealType] || []), newCategoryItem]
        }
      }))
    }
  }

  const handleRemoveCategory = (day: number, mealType: string, index: number) => {
    setCategoryPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: prev[day][mealType].filter((_, i) => i !== index)
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

    // Validation based on plan level
    if (planLevel === 1) {
      if (!weeklyFocus.trim()) {
        toast({
          title: "Greška",
          description: "Molim unesite tjedni fokus",
          variant: "destructive"
        })
        return
      }
    } else if (planLevel === 2) {
      const hasAnyCategory = Object.values(categoryPlan).some(dayPlan =>
        Object.values(dayPlan).some(meals => Array.isArray(meals) && meals.length > 0)
      )
      if (!hasAnyCategory) {
        toast({
          title: "Greška",
          description: "Molim dodajte barem jednu kategoriju",
          variant: "destructive"
        })
        return
      }
    } else {
      const hasAnyMeal = Object.values(weekPlan).some(dayPlan =>
        Object.values(dayPlan).some(meals => Array.isArray(meals) && meals.length > 0)
      )
      if (!hasAnyMeal) {
        toast({
          title: "Greška",
          description: "Molim dodajte barem jedan obrok",
          variant: "destructive"
        })
        return
      }
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Create meal plan with new fields
      const planData: any = {
        plan_name: planName,
        coach_id: user.id,
        client_id: null,
        date: new Date().toISOString().split('T')[0],
        plan_level: planLevel
      }

      // Add level-specific data
      if (planLevel === 1) {
        planData.weekly_focus = weeklyFocus
        planData.weekly_habit_ids = selectedHabits
        planData.weekly_recipe_ids = selectedRecipes
      }

      const { data: plan, error: planError } = await supabase
        .from('meal_plans')
        .insert(planData)
        .select()
        .single()

      if (planError) throw planError

      // Create meal plan entries based on level
      if (planLevel === 2) {
        // For level 2, use categories
        const planEntries: any[] = []
        Object.entries(categoryPlan).forEach(([day, dayPlan]) => {
          Object.entries(dayPlan).forEach(([mealType, items]) => {
            if (Array.isArray(items)) {
              items.forEach(item => {
                planEntries.push({
                  meal_plan_id: plan.id,
                  day_of_week: parseInt(day),
                  meal_type: mealType,
                  food_category_id: item.id,
                  quantity: item.quantity
                })
              })
            }
          })
        })

        if (planEntries.length > 0) {
          const { error: entriesError } = await supabase
            .from('meal_plan_entries')
            .insert(planEntries)

          if (entriesError) throw entriesError
        }
      } else if (planLevel === 3) {
        // For level 3, use specific foods/recipes
        const planEntries: any[] = []
        Object.entries(weekPlan).forEach(([day, dayPlan]) => {
          Object.entries(dayPlan).forEach(([mealType, meals]) => {
            if (Array.isArray(meals)) {
              meals.forEach(meal => {
                planEntries.push({
                  meal_plan_id: plan.id,
                  day_of_week: parseInt(day),
                  meal_type: mealType,
                  food_id: meal.type === 'food' ? meal.id : null,
                  recipe_id: meal.type === 'recipe' ? meal.id : null,
                  quantity: meal.quantity
                })
              })
            }
          })
        })

        if (planEntries.length > 0) {
          const { error: entriesError } = await supabase
            .from('meal_plan_entries')
            .insert(planEntries)

          if (entriesError) throw entriesError
        }
      }

      toast({
        title: "Uspjeh",
        description: `Plan prehrane "${planName}" je uspješno kreiran`
      })

      navigate('/admin/nutrition')
    } catch (error) {
      console.error('Error creating nutrition plan:', error)
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
    <AdminLayout title="Kreator Plana Prehrane">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/nutrition">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Natrag na Nutrition Library
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kreiranje Novog Plana Prehrane</CardTitle>
            <CardDescription>
              Kreirajte tjedni plan prehrane organiziran po danima i obrocima
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="planName">Ime Plana</Label>
                <Input
                  id="planName"
                  placeholder="npr. Ljetna definicija - Tjedan 1"
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
              <div>
                <Label htmlFor="planLevel">Razina Plana</Label>
                <Select 
                  value={planLevel.toString()} 
                  onValueChange={(value) => setPlanLevel(parseInt(value) as 1 | 2 | 3)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Odaberite razinu plana" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Razina 1: Tjedni Fokus & Navike</SelectItem>
                    <SelectItem value="2">Razina 2: Fleksibilni Plan (kategorije)</SelectItem>
                    <SelectItem value="3">Razina 3: Specifični Jelovnik</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {planLevel === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tjedni Fokus & Navike</h3>
                  
                  <div>
                    <Label htmlFor="weeklyFocus">Fokus Tjedna</Label>
                    <Textarea
                      id="weeklyFocus"
                      placeholder="npr. Povećaj unos vlakana, Smanji šećer..."
                      value={weeklyFocus}
                      onChange={(e) => setWeeklyFocus(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Preporučene Navike</Label>
                    <Select value="" onValueChange={(value) => {
                      if (!selectedHabits.includes(value)) {
                        setSelectedHabits([...selectedHabits, value])
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Dodaj naviku" />
                      </SelectTrigger>
                      <SelectContent>
                        {habits.filter(h => !selectedHabits.includes(h.id)).map(habit => (
                          <SelectItem key={habit.id} value={habit.id}>
                            {habit.habit_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedHabits.map(habitId => {
                        const habit = habits.find(h => h.id === habitId)
                        return habit ? (
                          <Badge key={habitId} variant="secondary" className="flex items-center gap-1">
                            {habit.habit_name}
                            <button
                              onClick={() => setSelectedHabits(selectedHabits.filter(id => id !== habitId))}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                              ×
                            </button>
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>

                  <div>
                    <Label>Preporučeni Recepti</Label>
                    <Select value="" onValueChange={(value) => {
                      if (!selectedRecipes.includes(value)) {
                        setSelectedRecipes([...selectedRecipes, value])
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Dodaj recept" />
                      </SelectTrigger>
                      <SelectContent>
                        {recipes.filter(r => !selectedRecipes.includes(r.id)).map(recipe => (
                          <SelectItem key={recipe.id} value={recipe.id}>
                            {recipe.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedRecipes.map(recipeId => {
                        const recipe = recipes.find(r => r.id === recipeId)
                        return recipe ? (
                          <Badge key={recipeId} variant="secondary" className="flex items-center gap-1">
                            {recipe.name}
                            <button
                              onClick={() => setSelectedRecipes(selectedRecipes.filter(id => id !== recipeId))}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                              ×
                            </button>
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>
              )}

              {planLevel === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Fleksibilni Plan (Kategorije)</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {daysOfWeek.map((day) => (
                      <Card key={day.value} className="h-fit">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg">{day.label}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {mealTypes.map((meal) => (
                            <div key={meal.key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">{meal.label}</h4>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedDay(day.value)
                                    setSelectedMealType(meal.key)
                                    setAddCategoryModalOpen(true)
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="space-y-1">
                                {categoryPlan[day.value]?.[meal.key]?.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                                  >
                                    <div className="flex-1">
                                      <span className="font-medium">{item.name}</span>
                                      <div className="flex gap-1 mt-1">
                                        <Badge variant="secondary" className="text-xs">
                                          {item.quantity} porcija
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          Kategorija
                                        </Badge>
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleRemoveCategory(day.value, meal.key, index)}
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </div>
                                )) || null}
                                
                                {(!categoryPlan[day.value]?.[meal.key] || categoryPlan[day.value][meal.key].length === 0) && (
                                  <p className="text-xs text-muted-foreground p-2 text-center">
                                    Nema dodanih kategorija
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {planLevel === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Specifični Jelovnik</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {daysOfWeek.map((day) => (
                      <Card key={day.value} className="h-fit">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg">{day.label}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {mealTypes.map((meal) => (
                            <div key={meal.key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">{meal.label}</h4>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddMeal(day.value, meal.key)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="space-y-1">
                                {weekPlan[day.value]?.[meal.key]?.map((mealItem, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                                  >
                                    <div className="flex-1">
                                      <span className="font-medium">{mealItem.name}</span>
                                      <div className="flex gap-1 mt-1">
                                        <Badge variant="secondary" className="text-xs">
                                          {mealItem.quantity}g
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          {mealItem.type === 'food' ? 'Namirnica' : 'Recept'}
                                        </Badge>
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleRemoveMeal(day.value, meal.key, index)}
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </div>
                                )) || null}
                                
                                {(!weekPlan[day.value]?.[meal.key] || weekPlan[day.value][meal.key].length === 0) && (
                                  <p className="text-xs text-muted-foreground p-2 text-center">
                                    Nema dodanih stavki
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                {loading ? "Spremam..." : "Kreiraj Plan"}
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin/nutrition')}>
                Odustani
              </Button>
            </div>
          </CardContent>
        </Card>

        <AddMealModal
          open={addMealModalOpen}
          onOpenChange={setAddMealModalOpen}
          onAddMeal={handleMealAdded}
        />
        
        <AddCategoryModal
          open={addCategoryModalOpen}
          onOpenChange={setAddCategoryModalOpen}
          onAddCategory={handleCategoryAdded}
        />
      </div>
    </AdminLayout>
  )
}