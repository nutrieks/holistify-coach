import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AdminLayout } from "@/components/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"
import { ArrowLeft, Calendar, Mail, Phone, User, Activity, TrendingUp, Clock, Plus, Apple } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EnhancedAssignTrainingPlanModal } from "@/components/EnhancedAssignTrainingPlanModal"
import { EnhancedAssignNutritionPlanModal } from "@/components/EnhancedAssignNutritionPlanModal"
import { TrainingPlanView } from "@/components/TrainingPlanView"
import { NutritionPlanViewer } from "@/components/nutrition-plan/NutritionPlanViewer"
import { ProgressTab } from "@/components/progress/ProgressTab"
import { ContractStatusCard } from "@/components/ContractStatusCard"
import { FormsTab } from "@/components/FormsTab"
import { LoadingSpinner } from "@/components/LoadingSpinner"

interface ClientProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string | null
  notes: string | null
  date_of_birth: string | null
  gender: string | null
  starting_weight: number | null
  height: number | null
  contract_start_date: string | null
  contract_end_date: string | null
  sessions_remaining: number | null
  created_at: string
  updated_at: string
}

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [client, setClient] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState("")
  const [showAssignTrainingModal, setShowAssignTrainingModal] = useState(false)
  const [showAssignNutritionModal, setShowAssignNutritionModal] = useState(false)
  const [nutritionPlanId, setNutritionPlanId] = useState<string | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(true)
  const { toast } = useToast()

  const fetchClient = async () => {
    if (!id) return
    
    try {
      const { data, error} = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', id)
        .single()

      if (error) throw error
      setClient(data)
      
      // Fetch nutrition plan
      const { data: planData } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('client_id', id)
        .maybeSingle()
      
      setNutritionPlanId(planData?.id || null)
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno dohvaćanje podataka klijenta",
        variant: "destructive"
      })
      navigate('/admin/clients')
    } finally {
      setLoading(false)
      setLoadingPlan(false)
    }
  }

  useEffect(() => {
    fetchClient()
  }, [id])

  const getStatusBadge = () => {
    return (
      <Badge variant="default">
        Aktivan
      </Badge>
    )
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-lg">Učitavam podatke klijenta...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!client) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Klijent nije pronađen.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/clients')}
            className="mt-4"
          >
            Povratak na listu klijenata
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin/clients')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Povratak
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">
                  {client.full_name || 'Nepoznato ime'}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  {getStatusBadge()}
                  <span className="text-sm text-muted-foreground">
                    Dodano: {new Date(client.created_at).toLocaleDateString('hr-HR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Zakaži
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Poruka
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="checkins">Check Ins</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Client Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Client Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                        {client.full_name?.charAt(0)?.toUpperCase() || 'K'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{client.full_name || 'Nepoznato ime'}</h3>
                      <p className="text-sm text-muted-foreground">Client ID: {client.user_id.slice(0, 8)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      {getStatusBadge()}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Contract Start:</span>
                      <span className="text-sm">
                        {client.contract_start_date ? 
                          new Date(client.contract_start_date).toLocaleDateString('hr-HR') : 
                          'Not set'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Added:</span>
                      <span className="text-sm">
                        {new Date(client.created_at).toLocaleDateString('hr-HR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duration:</span>
                      <span className="text-sm">
                        {client.contract_start_date ? 
                          Math.floor((new Date().getTime() - new Date(client.contract_start_date).getTime()) / (1000 * 60 * 60 * 24)) + ' days'
                          : '-'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contract Status */}
              <ContractStatusCard clientId={client.user_id} />

              {/* Metrics Avg */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Metrics Avg</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-2xl font-bold">-</div>
                      <div className="text-xs text-muted-foreground">Weight</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-2xl font-bold">-</div>
                      <div className="text-xs text-muted-foreground">Body Fat</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-2xl font-bold">-</div>
                      <div className="text-xs text-muted-foreground">Workouts</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-2xl font-bold">-</div>
                      <div className="text-xs text-muted-foreground">Check-ins</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Log */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      <div>
                        <p className="text-sm">Client added to system</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(client.created_at).toLocaleDateString('hr-HR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      No recent activity
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Notes</CardTitle>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Add a note about this client..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  {newNote && (
                    <div className="flex justify-end">
                      <Button size="sm">Save Note</Button>
                    </div>
                  )}
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No notes yet. Add a note to track important information about this client.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressTab clientId={id!} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkins">
            <Card>
              <CardHeader>
                <CardTitle>Check Ins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Check-ins functionality will be implemented soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Training Plans</CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => setShowAssignTrainingModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Dodijeli Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <TrainingPlanView 
                  clientId={id!} 
                  onPlanRemoved={() => {
                    // Refresh plan view
                    window.location.reload()
                  }} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Nutrition Plans</CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => setShowAssignNutritionModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Dodijeli Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPlan ? (
                  <LoadingSpinner />
                ) : nutritionPlanId ? (
                  <NutritionPlanViewer 
                    planId={nutritionPlanId}
                    clientId={id!} 
                    editable={true}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Apple className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nema Plana Prehrane</h3>
                    <p className="text-muted-foreground mb-4">
                      Ovaj klijent nema dodijeljeni plan prehrane.
                    </p>
                    <Button onClick={() => setShowAssignNutritionModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Dodijeli Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="forms">
            <FormsTab clientId={id!} clientName={client.full_name || 'Klijent'} />
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Notes are available in the Overview tab</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Chat functionality will be implemented soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <EnhancedAssignTrainingPlanModal
        open={showAssignTrainingModal}
        onOpenChange={setShowAssignTrainingModal}
        clientId={id!}
        onPlanAssigned={() => {
          setShowAssignTrainingModal(false)
          window.location.reload()
        }}
      />

      <EnhancedAssignNutritionPlanModal
        open={showAssignNutritionModal}
        onOpenChange={setShowAssignNutritionModal}
        clientId={id!}
        onPlanAssigned={() => {
          setShowAssignNutritionModal(false)
          window.location.reload()
        }}
      />
    </AdminLayout>
  )
}