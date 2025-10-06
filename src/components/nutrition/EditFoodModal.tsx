import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/integrations/supabase/types"

type FoodItem = Database['public']['Tables']['food_database']['Row']

interface EditFoodModalProps {
  food: FoodItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditFoodModal({ food, open, onOpenChange, onSuccess }: EditFoodModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    portion_size: ""
  })
  const { toast } = useToast()

  useEffect(() => {
    if (food) {
      setFormData({
        name: food.name || "",
        calories: food.calories?.toString() || "",
        protein: food.protein?.toString() || "",
        carbs: food.carbs?.toString() || "",
        fats: food.fats?.toString() || "",
        portion_size: food.portion_size || ""
      })
    }
  }, [food])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!food) return
    
    setLoading(true)

    try {
      const { error } = await supabase
        .from('food_database')
        .update({
          name: formData.name,
          calories: formData.calories ? parseFloat(formData.calories) : 0,
          protein: formData.protein ? parseFloat(formData.protein) : 0,
          carbs: formData.carbs ? parseFloat(formData.carbs) : 0,
          fats: formData.fats ? parseFloat(formData.fats) : 0,
          portion_size: formData.portion_size || null
        })
        .eq('id', food.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Namirnica je uspješno ažurirana"
      })

      onSuccess()
    } catch (error) {
      console.error('Error updating food:', error)
      toast({
        title: "Error",
        description: "Failed to update food item",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Uredi namirnicu</DialogTitle>
          <DialogDescription>
            Ažurirajte nutritivne vrijednosti namirnice
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Naziv *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Kalorije</Label>
              <Input
                id="calories"
                type="number"
                step="0.1"
                value={formData.calories}
                onChange={(e) => setFormData({...formData, calories: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portion_size">Veličina porcije</Label>
              <Input
                id="portion_size"
                type="text"
                value={formData.portion_size}
                onChange={(e) => setFormData({...formData, portion_size: e.target.value})}
                placeholder="npr. 100g, 1 kom"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="protein">Proteini (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                value={formData.protein}
                onChange={(e) => setFormData({...formData, protein: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Ugljikohidrati (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                value={formData.carbs}
                onChange={(e) => setFormData({...formData, carbs: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fats">Masti (g)</Label>
            <Input
              id="fats"
              type="number"
              step="0.1"
              value={formData.fats}
              onChange={(e) => setFormData({...formData, fats: e.target.value})}
            />
          </div>

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