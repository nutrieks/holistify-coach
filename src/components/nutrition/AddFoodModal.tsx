import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface AddFoodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddFoodModal({ open, onOpenChange, onSuccess }: AddFoodModalProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('food_database')
        .insert({
          name: formData.name,
          calories: formData.calories ? parseFloat(formData.calories) : 0,
          protein: formData.protein ? parseFloat(formData.protein) : 0,
          carbs: formData.carbs ? parseFloat(formData.carbs) : 0,
          fats: formData.fats ? parseFloat(formData.fats) : 0,
          portion_size: formData.portion_size || null
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Namirnica je uspješno dodana"
      })

      setFormData({
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
        portion_size: ""
      })
      onSuccess()
    } catch (error) {
      console.error('Error adding food:', error)
      toast({
        title: "Error",
        description: "Failed to add food item",
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
          <DialogTitle>Dodaj novu namirnicu</DialogTitle>
          <DialogDescription>
            Unesite nutritivne vrijednosti za novu namirnicu
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
              {loading ? "Dodajem..." : "Dodaj namirnicu"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}