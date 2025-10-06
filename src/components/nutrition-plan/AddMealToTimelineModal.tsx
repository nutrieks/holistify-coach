import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Search } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const mealTypeOptions = [
  { value: 'breakfast', label: 'Doručak', gradient: 'gradient-breakfast' },
  { value: 'snack_1', label: 'Užina 1', gradient: 'gradient-snack' },
  { value: 'lunch', label: 'Ručak', gradient: 'gradient-lunch' },
  { value: 'snack_2', label: 'Užina 2', gradient: 'gradient-snack' },
  { value: 'dinner', label: 'Večera', gradient: 'gradient-dinner' },
  { value: 'snack_3', label: 'Užina 3', gradient: 'gradient-snack' },
]

interface AddMealToTimelineModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planId: string
  dayOfWeek: number
  onMealAdded: () => void
}

export function AddMealToTimelineModal({
  open,
  onOpenChange,
  planId,
  dayOfWeek,
  onMealAdded
}: AddMealToTimelineModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [mealType, setMealType] = useState('breakfast')
  const [scheduledTime, setScheduledTime] = useState('08:00')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('g')
  const [notes, setNotes] = useState('')
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [foods, setFoods] = useState<any[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  const [selectedFood, setSelectedFood] = useState<string | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchFoodsAndRecipes()
    }
  }, [open])

  const fetchFoodsAndRecipes = async () => {
    try {
      const [foodsRes, recipesRes] = await Promise.all([
        supabase.from('food_database').select('*').order('name'),
        supabase.from('recipes').select('*').order('name')
      ])

      setFoods(foodsRes.data || [])
      setRecipes(recipesRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async () => {
    if (!selectedFood && !selectedRecipe) {
      toast({
        title: "Greška",
        description: "Odaberite namirnicu ili recept",
        variant: "destructive"
      })
      return
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast({
        title: "Greška",
        description: "Unesite ispravnu količinu",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const selectedGradient = mealTypeOptions.find(m => m.value === mealType)?.gradient

      const entryData = {
        meal_plan_id: planId,
        day_of_week: dayOfWeek,
        meal_type: mealType,
        scheduled_time: scheduledTime,
        quantity: parseFloat(quantity),
        unit: unit,
        notes: notes || null,
        meal_gradient_color: selectedGradient,
        food_id: selectedFood,
        recipe_id: selectedRecipe
      }

      const { error } = await supabase
        .from('meal_plan_entries')
        .insert(entryData)

      if (error) throw error

      toast({
        title: "Uspjeh",
        description: "Obrok je dodan"
      })

      onMealAdded()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error('Error adding meal:', error)
      toast({
        title: "Greška",
        description: "Nije moguće dodati obrok",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setMealType('breakfast')
    setScheduledTime('08:00')
    setQuantity('')
    setUnit('g')
    setNotes('')
    setSelectedFood(null)
    setSelectedRecipe(null)
    setSearchQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj Obrok</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Meal Type & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tip Obroka</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mealTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Vrijeme</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          {/* Food/Recipe Selection */}
          <div>
            <Label>Odaberi Namirnicu ili Recept</Label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Tabs defaultValue="foods">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="foods">Namirnice</TabsTrigger>
                <TabsTrigger value="recipes">Recepti</TabsTrigger>
              </TabsList>

              <TabsContent value="foods">
                <ScrollArea className="h-[200px] border rounded-md p-2">
                  {filteredFoods.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nema rezultata
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {filteredFoods.map(food => (
                        <button
                          key={food.id}
                          onClick={() => {
                            setSelectedFood(food.id)
                            setSelectedRecipe(null)
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedFood === food.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="font-medium">{food.name}</div>
                          <div className="text-xs opacity-80">
                            {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fats}g
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="recipes">
                <ScrollArea className="h-[200px] border rounded-md p-2">
                  {filteredRecipes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nema rezultata
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {filteredRecipes.map(recipe => (
                        <button
                          key={recipe.id}
                          onClick={() => {
                            setSelectedRecipe(recipe.id)
                            setSelectedFood(null)
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedRecipe === recipe.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="font-medium">{recipe.name}</div>
                          <div className="text-xs opacity-80">
                            {recipe.total_calories} kcal | {recipe.servings} porcija
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Količina</Label>
              <Input
                type="number"
                placeholder="200"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div>
              <Label>Jedinica</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">grama (g)</SelectItem>
                  <SelectItem value="ml">mililitara (ml)</SelectItem>
                  <SelectItem value="kom">komad</SelectItem>
                  <SelectItem value="porcija">porcija</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Napomene (opcionalno)</Label>
            <Input
              placeholder="Dodatne napomene..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                resetForm()
              }}
              disabled={loading}
            >
              Odustani
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Dodajem..." : "Dodaj Obrok"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
