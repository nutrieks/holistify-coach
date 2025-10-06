import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Dumbbell, Apple } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { TrainingPlanView } from "@/components/TrainingPlanView"
import { NutritionPlanViewer } from "@/components/nutrition-plan/NutritionPlanViewer"
import { supabase } from "@/integrations/supabase/client"
import { LoadingSpinner } from "@/components/LoadingSpinner"

export default function MyPlans() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [nutritionPlanId, setNutritionPlanId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNutritionPlan = async () => {
      if (!user?.id) return
      
      try {
        const { data } = await supabase
          .from('meal_plans')
          .select('id')
          .eq('client_id', user.id)
          .maybeSingle()
        
        setNutritionPlanId(data?.id || null)
      } catch (error) {
        console.error('Error fetching nutrition plan:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNutritionPlan()
  }, [user?.id])

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/client')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Moji Planovi</h1>
            <p className="text-muted-foreground">Pregled vašeg plana prehrane i treninga</p>
          </div>
        </div>

        {/* Tabs for Plans */}
        <Tabs defaultValue="nutrition" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nutrition" className="flex items-center gap-2">
              <Apple className="h-4 w-4" />
              Plan Prehrane
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Plan Treninga
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nutrition">
            {loading ? (
              <LoadingSpinner />
            ) : nutritionPlanId ? (
              <NutritionPlanViewer 
                planId={nutritionPlanId}
                clientId={user?.id || ''} 
                editable={false}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Apple className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Nema Plana Prehrane</h3>
                  <p className="text-muted-foreground">
                    Trenutno nemate dodijeljeni plan prehrane. Kontaktirajte svog trenera.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="training">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Moj Plan Treninga
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TrainingPlanView 
                  clientId={user?.id || ''} 
                  onPlanRemoved={() => {
                    // Client can't remove plans - this is read-only
                  }}
                  readOnly={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}