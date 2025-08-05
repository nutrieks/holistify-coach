import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/integrations/supabase/types"

type Recipe = Database['public']['Tables']['recipes']['Row']
type FoodItem = Database['public']['Tables']['food_database']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row'] & {
  food_database?: FoodItem
}

interface RecipeIngredientForm {
  id?: string
  food_id: string
  quantity: number
  food_name?: string
}

interface EditRecipeModalProps {
  recipe: Recipe | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditRecipeModal({ recipe, open, onOpenChange, onSuccess }: EditRecipeModalProps) {
  const [loading, setLoading] = useState(false)
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [formData, setFormData] = useState({
    name: "",
    instructions: "",
    image_url: ""
  })
  const [ingredients, setIngredients] = useState<RecipeIngredientForm[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (open && recipe) {
      fetchFoods()
      fetchRecipeIngredients()
      setFormData({
        name: recipe.name || "",
        instructions: recipe.instructions || "",
        image_url: recipe.image_url || ""
      })
    }
  }, [open, recipe])

  const fetchFoods = async () => {
    try {
      const { data, error } = await supabase
        .from('food_database')
        .select('*')
        .order('name')

      if (error) throw error
      setFoods(data || [])
    } catch (error) {
      console.error('Error fetching foods:', error)
    }
  }

  const fetchRecipeIngredients = async () => {
    if (!recipe) return

    try {
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .select(`
          *,
          food_database (*)
        `)
        .eq('recipe_id', recipe.id)

      if (error) throw error
      
      const formattedIngredients = (data || []).map(ing => ({
        id: ing.id,
        food_id: ing.food_id,
        quantity: ing.quantity,
        food_name: ing.food_database?.name
      }))
      
      setIngredients(formattedIngredients)
    } catch (error) {
      console.error('Error fetching recipe ingredients:', error)
    }
  }

  const addIngredient = () => {
    setIngredients([...ingredients, { food_id: "", quantity: 0 }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: keyof RecipeIngredientForm, value: string | number) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], [field]: value }
    
    if (field === 'food_id') {
      const selectedFood = foods.find(f => f.id === value)
      updated[index].food_name = selectedFood?.name
    }
    
    setIngredients(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipe) return
    
    setLoading(true)

    try {
      // Update recipe
      const { error: recipeError } = await supabase
        .from('recipes')
        .update({
          name: formData.name,
          instructions: formData.instructions || null,
          image_url: formData.image_url || null
        })
        .eq('id', recipe.id)

      if (recipeError) throw recipeError

      // Delete existing ingredients
      const { error: deleteError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipe.id)

      if (deleteError) throw deleteError

      // Add new ingredients
      if (ingredients.length > 0) {
        const validIngredients = ingredients.filter(ing => ing.food_id && ing.quantity > 0)
        
        if (validIngredients.length > 0) {
          const { error: ingredientsError } = await supabase
            .from('recipe_ingredients')
            .insert(
              validIngredients.map(ing => ({
                recipe_id: recipe.id,
                food_id: ing.food_id,
                quantity: ing.quantity
              }))
            )

          if (ingredientsError) throw ingredientsError
        }
      }

      toast({
        title: "Success",
        description: "Recept je uspješno ažuriran"
      })

      onSuccess()
    } catch (error) {
      console.error('Error updating recipe:', error)
      toast({
        title: "Error",
        description: "Failed to update recipe",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Uredi recept</DialogTitle>
          <DialogDescription>
            Ažurirajte recept i njegovu sastojke
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Naziv recepta *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL slike</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instrukcije</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({...formData, instructions: e.target.value})}
              rows={4}
              placeholder="Opišite kako se priprema recept..."
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                Sastojci
                <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj sastojak
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ingredients.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nema dodanih sastojaka
                </p>
              ) : (
                ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Select
                      value={ingredient.food_id}
                      onValueChange={(value) => updateIngredient(index, 'food_id', value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Odaberite namirnicu" />
                      </SelectTrigger>
                      <SelectContent>
                        {foods.map((food) => (
                          <SelectItem key={food.id} value={food.id}>
                            {food.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Količina (g)"
                      value={ingredient.quantity || ""}
                      onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Odustani
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Spremam..." : "Spremi promjene"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}