import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/AdminLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function NutritionPlanCreator() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  
  // Plan basic info
  const [planName, setPlanName] = useState("")
  const [clientId, setClientId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [notes, setNotes] = useState("")
  
  // Macro targets
  const [dailyCalories, setDailyCalories] = useState("")
  const [dailyProtein, setDailyProtein] = useState("")
  const [dailyCarbs, setDailyCarbs] = useState("")
  const [dailyFats, setDailyFats] = useState("")
  
  // Features
  const [trainingIntegration, setTrainingIntegration] = useState(false)
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'daily'>('weekly')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name, user_id')
        .order('full_name')

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast({
        title: "Greška",
        description: "Nije moguće učitati klijente",
        variant: "destructive"
      })
    }
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

    if (!clientId) {
      toast({
        title: "Greška",
        description: "Molim odaberite klijenta",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Get user_id for the selected client
      const selectedClient = clients.find(c => c.id === clientId)
      if (!selectedClient) throw new Error("Klijent nije pronađen")

      // Create meal plan with new structure
      const planData: any = {
        name: planName,
        client_id: selectedClient.user_id,
        start_date: startDate || null,
        end_date: endDate || null,
        notes: notes || null,
        daily_calories_target: dailyCalories ? parseFloat(dailyCalories) : null,
        daily_protein_target: dailyProtein ? parseFloat(dailyProtein) : null,
        daily_carbs_target: dailyCarbs ? parseFloat(dailyCarbs) : null,
        daily_fats_target: dailyFats ? parseFloat(dailyFats) : null,
        training_integration: trainingIntegration,
        view_mode: viewMode,
        is_active: true
      }

      const { data: plan, error: planError } = await supabase
        .from('meal_plans')
        .insert(planData)
        .select()
        .single()

      if (planError) throw planError

      toast({
        title: "Uspjeh",
        description: `Plan prehrane "${planName}" je uspješno kreiran`
      })

      // Navigate to the plan viewer to add meals and trainings
      navigate(`/admin/plans/nutrition/${plan.id}`)
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
              Unesite osnovne informacije o planu. Obroci i treninzi se dodaju nakon kreiranja.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Osnovne Informacije</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planName">Ime Plana *</Label>
                  <Input
                    id="planName"
                    placeholder="npr. Plan Prehrane - Siječanj 2024"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="client">Klijent *</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Odaberite klijenta" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startDate">Datum Početka</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Datum Završetka</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Napomene</Label>
                <Textarea
                  id="notes"
                  placeholder="Dodatne napomene o planu..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Macro Targets */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dnevni Makro Ciljevi</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="calories">Kalorije (kcal)</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="2000"
                    value={dailyCalories}
                    onChange={(e) => setDailyCalories(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="protein">Proteini (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    placeholder="150"
                    value={dailyProtein}
                    onChange={(e) => setDailyProtein(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="carbs">Ugljikohidrati (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    placeholder="200"
                    value={dailyCarbs}
                    onChange={(e) => setDailyCarbs(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="fats">Masti (g)</Label>
                  <Input
                    id="fats"
                    type="number"
                    placeholder="60"
                    value={dailyFats}
                    onChange={(e) => setDailyFats(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* View & Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Postavke Prikaza</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="viewMode">Zadani Prikaz</Label>
                  <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mjesečni Kalendar</SelectItem>
                      <SelectItem value="weekly">Tjedni Prikaz</SelectItem>
                      <SelectItem value="daily">Dnevni Prikaz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between space-x-2 pt-6">
                  <Label htmlFor="trainingIntegration" className="cursor-pointer">
                    Trening Integracija
                  </Label>
                  <Switch
                    id="trainingIntegration"
                    checked={trainingIntegration}
                    onCheckedChange={setTrainingIntegration}
                  />
                </div>
              </div>

              {trainingIntegration && (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  ℹ️ Trening integracija omogućava prilagodbu makro nutrijenata na temelju vrste i intenziteta treninga.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/nutrition')}
                disabled={loading}
              >
                Odustani
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Kreiram..." : "Kreiraj Plan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
