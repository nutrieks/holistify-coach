import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mealTypeOptions } from "@/utils/nutritionUtils";

interface EditMealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealEntry: {
    id: string;
    meal_type: string;
    scheduled_time: string;
    food_id?: string;
    recipe_id?: string;
    quantity: number;
    unit?: string;
    notes?: string;
    foodName?: string;
    recipeName?: string;
  };
  onMealUpdated: () => void;
}

export function EditMealModal({ open, onOpenChange, mealEntry, onMealUpdated }: EditMealModalProps) {
  const { toast } = useToast();
  const [mealType, setMealType] = useState(mealEntry.meal_type);
  const [scheduledTime, setScheduledTime] = useState(mealEntry.scheduled_time);
  const [quantity, setQuantity] = useState(mealEntry.quantity.toString());
  const [unit, setUnit] = useState(mealEntry.unit || "");
  const [notes, setNotes] = useState(mealEntry.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setMealType(mealEntry.meal_type);
      setScheduledTime(mealEntry.scheduled_time);
      setQuantity(mealEntry.quantity.toString());
      setUnit(mealEntry.unit || "");
      setNotes(mealEntry.notes || "");
    }
  }, [open, mealEntry]);

  const handleSubmit = async () => {
    if (!scheduledTime || !quantity) {
      toast({
        title: "Greška",
        description: "Molimo ispunite sva obavezna polja",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('meal_plan_entries')
        .update({
          meal_type: mealType,
          scheduled_time: scheduledTime,
          quantity: parseFloat(quantity),
          unit: unit || null,
          notes: notes || null,
        })
        .eq('id', mealEntry.id);

      if (error) throw error;

      toast({
        title: "Uspjeh",
        description: "Obrok je uspješno ažuriran",
      });

      onMealUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating meal:', error);
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom ažuriranja obroka",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Uredi Obrok</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Display Food/Recipe Name */}
          <div className="space-y-2">
            <Label>Namirnica/Recept</Label>
            <Input 
              value={mealEntry.foodName || mealEntry.recipeName || 'N/A'} 
              disabled 
              className="bg-muted"
            />
          </div>

          {/* Meal Type */}
          <div className="space-y-2">
            <Label>Tip Obroka *</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue placeholder="Odaberi tip obroka" />
              </SelectTrigger>
              <SelectContent>
                {mealTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scheduled Time */}
          <div className="space-y-2">
            <Label>Vrijeme *</Label>
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label>Količina *</Label>
            <Input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="npr. 150"
            />
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <Label>Jedinica</Label>
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="npr. g, ml, kom"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Napomene</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dodatne napomene..."
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Odustani
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Spremanje..." : "Spremi Promjene"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
