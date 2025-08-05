import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Dumbbell, Apple } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { TrainingPlanView } from "@/components/TrainingPlanView"
import { NutritionPlanView } from "@/components/NutritionPlanView"

export default function MyPlans() {
  const { user } = useAuth()
  const navigate = useNavigate()

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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="h-5 w-5" />
                  Moj Plan Prehrane
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NutritionPlanView 
                  clientId={user?.id || ''} 
                  onPlanRemoved={() => {
                    // Client can't remove plans - this is read-only
                  }}
                  readOnly={true}
                />
              </CardContent>
            </Card>
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