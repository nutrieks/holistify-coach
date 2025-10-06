import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Apple, Clock, Calendar } from "lucide-react"

interface NutritionPlan {
  id: string
  name: string
  start_date: string | null
  created_at: string
  client_id: string | null
}

interface AssignNutritionPlanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  onPlanAssigned: () => void
}

export function AssignNutritionPlanModal({ 
  open, 
  onOpenChange, 
  clientId, 
  onPlanAssigned 
}: AssignNutritionPlanModalProps) {
  const [plans, setPlans] = useState<NutritionPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchAvailablePlans = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .is('client_id', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPlans(data || [])
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

  const assignPlan = async (planId: string) => {
    setAssigning(planId)
    try {
      const { error } = await supabase
        .from('meal_plans')
        .update({ 
          client_id: clientId,
          start_date: new Date().toISOString().split('T')[0]
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

  useEffect(() => {
    if (open) {
      fetchAvailablePlans()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5" />
            Dodijeli Plan Prehrane
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Učitavam planove...</div>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Apple className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nema dostupnih planova prehrane</p>
              <p className="text-sm">Kreirajte novi plan da biste ga mogli dodijeliti klijentu</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {plans.map((plan) => (
                <Card key={plan.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
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
                      <Button 
                        onClick={() => assignPlan(plan.id)}
                        disabled={assigning === plan.id}
                        size="sm"
                      >
                        {assigning === plan.id ? "Dodeljujem..." : "Dodijeli"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}