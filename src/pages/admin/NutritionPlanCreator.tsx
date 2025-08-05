import { useState } from "react"
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

const mealTypes = ["doručak", "ručak", "večera", "užina"]

interface PlanEntry {
  day: number
  mealType: string
  foodId?: string
  recipeId?: string
  quantity: number
  name: string
}

export default function NutritionPlanCreator() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [planName, setPlanName] = useState("")
  const [entries, setEntries] = useState<PlanEntry[]>([])
  const [foods, setFoods] = useState<any[]>([])
  const [recipes, setRecipes] = useState<any[]>([])

  const fetchFoodsAndRecipes = async () => {
    const [foodsResponse, recipesResponse] = await Promise.all([
      supabase.from('food_database').select('*'),
      supabase.from('recipes').select('*')
    ])
    
    if (foodsResponse.data) setFoods(foodsResponse.data)
    if (recipesResponse.data) setRecipes(recipesResponse.data)
  }

  useState(() => {
    fetchFoodsAndRecipes()
  })

  const addEntry = () => {
    setEntries([...entries, {
      day: 1,
      mealType: "doručak",
      quantity: 100,
      name: ""
    }])
  }

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index))
  }

  const updateEntry = (index: number, field: string, value: any) => {
    const updated = [...entries]
    updated[index] = { ...updated[index], [field]: value }
    
    if (field === 'foodId' && value) {
      const food = foods.find(f => f.id === value)
      updated[index].name = food?.name || ""
      updated[index].recipeId = undefined
    } else if (field === 'recipeId' && value) {
      const recipe = recipes.find(r => r.id === value)
      updated[index].name = recipe?.name || ""
      updated[index].foodId = undefined
    }
    
    setEntries(updated)
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

    if (entries.length === 0) {
      toast({
        title: "Greška", 
        description: "Molim dodajte barem jedan obrok",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Create meal plan
      const { data: plan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          plan_name: planName,
          coach_id: (await supabase.auth.getUser()).data.user?.id,
          client_id: null, // Will be assigned when coach creates plan for specific client
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single()

      if (planError) throw planError

      // Create meal plan entries
      const planEntries = entries.map(entry => ({
        meal_plan_id: plan.id,
        day_of_week: entry.day,
        meal_type: entry.mealType,
        food_id: entry.foodId || null,
        recipe_id: entry.recipeId || null,
        quantity: entry.quantity
      }))

      const { error: entriesError } = await supabase
        .from('meal_plan_entries')
        .insert(planEntries)

      if (entriesError) throw entriesError

      toast({
        title: "Uspjeh",
        description: "Plan prehrane je uspješno kreiran"
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
              Kreirajte prilagođeni plan prehrane za svoje klijente
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
                <h3 className="text-lg font-semibold">Obroci</h3>
                <Button onClick={addEntry} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj Obrok
                </Button>
              </div>

              {entries.map((entry, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                      <Label>Dan</Label>
                      <Select value={entry.day.toString()} onValueChange={(value) => updateEntry(index, 'day', parseInt(value))}>
                        <SelectTrigger>
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

                    <div>
                      <Label>Obrok</Label>
                      <Select value={entry.mealType} onValueChange={(value) => updateEntry(index, 'mealType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mealTypes.map(meal => (
                            <SelectItem key={meal} value={meal}>
                              {meal.charAt(0).toUpperCase() + meal.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Namirnica</Label>
                      <Select value={entry.foodId || ""} onValueChange={(value) => updateEntry(index, 'foodId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Odaberite namirnicu" />
                        </SelectTrigger>
                        <SelectContent>
                          {foods.map(food => (
                            <SelectItem key={food.id} value={food.id}>
                              {food.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Recept</Label>
                      <Select value={entry.recipeId || ""} onValueChange={(value) => updateEntry(index, 'recipeId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Ili odaberite recept" />
                        </SelectTrigger>
                        <SelectContent>
                          {recipes.map(recipe => (
                            <SelectItem key={recipe.id} value={recipe.id}>
                              {recipe.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label>Količina (g)</Label>
                        <Input
                          type="number"
                          value={entry.quantity}
                          onChange={(e) => updateEntry(index, 'quantity', parseInt(e.target.value))}
                          min="1"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeEntry(index)}
                        className="mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {entries.length === 0 && (
                <Card className="p-8 text-center text-muted-foreground">
                  <p>Dodajte obroke za kreiranje plana prehrane</p>
                </Card>
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
      </div>
    </AdminLayout>
  )
}