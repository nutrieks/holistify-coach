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
    fat: "",
    serving_size_grams: "",
    fiber: ""
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
          calories: formData.calories ? parseFloat(formData.calories) : null,
          protein: formData.protein ? parseFloat(formData.protein) : null,
          carbs: formData.carbs ? parseFloat(formData.carbs) : null,
          fat: formData.fat ? parseFloat(formData.fat) : null,
          serving_size_grams: formData.serving_size_grams ? parseFloat(formData.serving_size_grams) : null,
          fiber: formData.fiber ? parseFloat(formData.fiber) : null
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
        fat: "",
        serving_size_grams: "",
        fiber: ""
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
              <Label htmlFor="serving_size_grams">Količina (g)</Label>
              <Input
                id="serving_size_grams"
                type="number"
                step="0.1"
                value={formData.serving_size_grams}
                onChange={(e) => setFormData({...formData, serving_size_grams: e.target.value})}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fat">Masti (g)</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                value={formData.fat}
                onChange={(e) => setFormData({...formData, fat: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiber">Vlakna (g)</Label>
              <Input
                id="fiber"
                type="number"
                step="0.1"
                value={formData.fiber}
                onChange={(e) => setFormData({...formData, fiber: e.target.value})}
              />
            </div>
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