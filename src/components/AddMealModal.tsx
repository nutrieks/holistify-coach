import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

interface Food {
  id: string
  name: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  unit?: string
}

interface Recipe {
  id: string
  name: string
  instructions?: string
  image_url?: string
}

interface AddMealModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMeal: (item: { type: 'food' | 'recipe'; id: string; name: string; quantity: number }) => void
}

export function AddMealModal({ open, onOpenChange, onAddMeal }: AddMealModalProps) {
  const [foods, setFoods] = useState<Food[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [foodSearch, setFoodSearch] = useState("")
  const [recipeSearch, setRecipeSearch] = useState("")
  const [quantity, setQuantity] = useState(100)
  const [selectedItem, setSelectedItem] = useState<{ type: 'food' | 'recipe'; item: Food | Recipe } | null>(null)

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    const [foodsResponse, recipesResponse] = await Promise.all([
      supabase.from('food_database').select('*').order('name'),
      supabase.from('recipes').select('*').order('name')
    ])
    
    if (foodsResponse.data) setFoods(foodsResponse.data)
    if (recipesResponse.data) setRecipes(recipesResponse.data)
  }

  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(foodSearch.toLowerCase())
  )

  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(recipeSearch.toLowerCase())
  )

  const handleAddMeal = () => {
    if (!selectedItem) return

    onAddMeal({
      type: selectedItem.type,
      id: selectedItem.item.id,
      name: selectedItem.item.name,
      quantity
    })

    // Reset form
    setSelectedItem(null)
    setQuantity(100)
    setFoodSearch("")
    setRecipeSearch("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Dodaj Stavku u Obrok</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="foods" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="foods">Namirnice</TabsTrigger>
            <TabsTrigger value="recipes">Recepti</TabsTrigger>
          </TabsList>

          <TabsContent value="foods" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pretraži namirnice..."
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {filteredFoods.map((food) => (
                <Card 
                  key={food.id} 
                  className={`cursor-pointer transition-colors hover:bg-accent ${
                    selectedItem?.type === 'food' && selectedItem.item.id === food.id 
                      ? 'ring-2 ring-primary' 
                      : ''
                  }`}
                  onClick={() => setSelectedItem({ type: 'food', item: food })}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{food.name}</CardTitle>
                    <CardDescription className="flex gap-2 flex-wrap">
                      {food.calories && <Badge variant="secondary">{food.calories} kcal</Badge>}
                      {food.protein && <Badge variant="outline">P: {food.protein}g</Badge>}
                      {food.carbs && <Badge variant="outline">C: {food.carbs}g</Badge>}
                      {food.fat && <Badge variant="outline">F: {food.fat}g</Badge>}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recipes" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pretraži recepte..."
                value={recipeSearch}
                onChange={(e) => setRecipeSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {filteredRecipes.map((recipe) => (
                <Card 
                  key={recipe.id} 
                  className={`cursor-pointer transition-colors hover:bg-accent ${
                    selectedItem?.type === 'recipe' && selectedItem.item.id === recipe.id 
                      ? 'ring-2 ring-primary' 
                      : ''
                  }`}
                  onClick={() => setSelectedItem({ type: 'recipe', item: recipe })}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{recipe.name}</CardTitle>
                    {recipe.instructions && (
                      <CardDescription className="line-clamp-2">
                        {recipe.instructions}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {selectedItem && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="quantity">Količina (g)</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  min="1"
                  placeholder="100"
                />
              </div>
              <Button onClick={handleAddMeal} className="mt-6">
                <Plus className="h-4 w-4 mr-2" />
                Dodaj u Plan
              </Button>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">Odabrano:</p>
              <p className="text-sm text-muted-foreground">
                {selectedItem.item.name} - {quantity}g
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}