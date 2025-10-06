import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/AdminLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Eye, Trash2, Calendar, User } from "lucide-react"
import { Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ConfirmDialog } from "@/components/ConfirmDialog"

interface NutritionPlan {
  id: string
  name: string
  client_id: string
  is_active: boolean
  created_at: string
  start_date: string | null
  end_date: string | null
  daily_calories_target: number | null
  training_integration: boolean
  clients: {
    full_name: string
  }
}

export default function NutritionPlansList() {
  const [plans, setPlans] = useState<NutritionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          id,
          name,
          client_id,
          is_active,
          created_at,
          start_date,
          end_date,
          daily_calories_target,
          training_integration,
          clients (
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPlans(data || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast({
        title: "Greška",
        description: "Nije moguće učitati planove prehrane",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlan = async () => {
    if (!planToDelete) return

    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', planToDelete)

      if (error) throw error

      toast({
        title: "Uspješno",
        description: "Plan prehrane je obrisan"
      })

      fetchPlans()
    } catch (error) {
      console.error('Error deleting plan:', error)
      toast({
        title: "Greška",
        description: "Nije moguće obrisati plan",
        variant: "destructive"
      })
    } finally {
      setDeleteDialogOpen(false)
      setPlanToDelete(null)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Planovi Prehrane">
        <LoadingSpinner />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Planovi Prehrane">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Svi Planovi Prehrane</h2>
            <p className="text-muted-foreground">
              Pregled i upravljanje svim planovima prehrane
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/plans/nutrition/create">
              <Plus className="mr-2 h-4 w-4" />
              Kreiraj Novi Plan
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Svi Planovi ({plans.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {plans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Nema kreiranih planova prehrane</p>
                <Button asChild>
                  <Link to="/admin/plans/nutrition/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Kreiraj Prvi Plan
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naziv Plana</TableHead>
                    <TableHead>Klijent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Trening Integracija</TableHead>
                    <TableHead>Kalorije</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {plan.clients?.full_name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={plan.is_active ? "default" : "secondary"}>
                          {plan.is_active ? 'Aktivan' : 'Neaktivan'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={plan.training_integration ? "default" : "outline"}>
                          {plan.training_integration ? 'Da' : 'Ne'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {plan.daily_calories_target ? `${plan.daily_calories_target} kcal` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {plan.start_date && plan.end_date
                            ? `${format(new Date(plan.start_date), 'dd.MM')} - ${format(new Date(plan.end_date), 'dd.MM.yyyy')}`
                            : 'Nije postavljeno'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link to={`/admin/plans/nutrition/${plan.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPlanToDelete(plan.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeletePlan}
        title="Obriši Plan Prehrane"
        description="Jeste li sigurni da želite obrisati ovaj plan prehrane? Ova akcija je nepovratna."
      />
    </AdminLayout>
  )
}
