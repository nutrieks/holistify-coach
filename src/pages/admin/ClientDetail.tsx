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
import { ContractProgressBar } from "@/components/ContractProgressBar"
import { FormsTab } from "@/components/FormsTab"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import AnthropometryTab from "@/components/client/AnthropometryTab"
import EnergyCalculationTabSimplified from "@/components/client/EnergyCalculationTabSimplified"
import ChatInterface from "@/components/chat/ChatInterface"
import { ClientNAQDashboard } from "@/components/naq/ClientNAQDashboard"
import { NutritionalDiagnosticsTab } from "@/components/NutritionalDiagnosticsTab"

function ChatInterfaceWrapper({ clientUserId, clientName }: { clientUserId: string; clientName: string }) {
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  if (!currentUserId) return <LoadingSpinner />;

  return <ChatInterface currentUserId={currentUserId} otherUserId={clientUserId} otherUserName={clientName} />;
}

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
  const [anthropometricData, setAnthropometricData] = useState<any[]>([])
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
      
      // Fetch anthropometric data
      await fetchAnthropometricData()
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

  const fetchAnthropometricData = async () => {
    if (!id) return
    
    try {
      const { data, error } = await supabase
        .from('client_anthropometric_data')
        .select('*')
        .eq('client_id', id)
        .order('measurement_date', { ascending: false })
      
      if (error) throw error
      setAnthropometricData(data || [])
    } catch (error: any) {
      console.error('Error fetching anthropometric data:', error)
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

  const calculateAge = (dateOfBirth: string | null): number | null => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
          <TabsList className="grid w-full grid-cols-12 overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="anthropometry">Antropometrija</TabsTrigger>
            <TabsTrigger value="energy">Energija</TabsTrigger>
            <TabsTrigger value="diagnostics">NAQ</TabsTrigger>
            <TabsTrigger value="nutritional">Nutritivna dijagnostika</TabsTrigger>
            <TabsTrigger value="progress">Napredak</TabsTrigger>
            <TabsTrigger value="training">Trening</TabsTrigger>
            <TabsTrigger value="nutrition">Prehrana</TabsTrigger>
            <TabsTrigger value="checkins">Check Ins</TabsTrigger>
            <TabsTrigger value="forms">Obrasci</TabsTrigger>
            <TabsTrigger value="notes">Bilješke</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Opći Podaci */}
            <Card>
              <CardHeader>
                <CardTitle>Opći Podaci</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                        {client.full_name?.charAt(0)?.toUpperCase() || 'K'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-muted-foreground">Ime i Prezime</p>
                      <h3 className="font-semibold">{client.full_name || 'Nepoznato ime'}</h3>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{client.email || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{client.phone || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Spol</p>
                    <p className="font-medium">{client.gender === 'male' ? 'Muško' : client.gender === 'female' ? 'Žensko' : '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Dob</p>
                    <p className="font-medium">
                      {calculateAge(client.date_of_birth) !== null ? 
                        `${calculateAge(client.date_of_birth)} godina` : 
                        '-'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contract Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Trajanje suradnje</CardTitle>
              </CardHeader>
              <CardContent>
                <ContractProgressBar clientId={client.user_id} showLabel={true} />
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle>Aktivnost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <p className="text-sm">Klijent dodan u sustav</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(client.created_at).toLocaleDateString('hr-HR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-center py-4 text-xs text-muted-foreground">
                    Nema nedavnih aktivnosti
                  </div>
                </div>
              </CardContent>
            </Card>

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

          <TabsContent value="anthropometry">
            <AnthropometryTab 
              data={anthropometricData}
              clientId={id!}
              clientGender={client.gender}
              onDataAdded={() => {
                fetchAnthropometricData();
                fetchClient();
              }}
            />
          </TabsContent>

                  <TabsContent value="energy">
                    <EnergyCalculationTabSimplified
              clientGender={client.gender}
              latestWeight={anthropometricData[0]?.weight || null}
              latestHeight={anthropometricData[0]?.height || null}
              latestLBM={anthropometricData[0]?.lean_body_mass || null}
              clientAge={calculateAge(client.date_of_birth)}
            />
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

          <TabsContent value="diagnostics">
            <Card>
              <CardHeader>
                <CardTitle>Nutritivna Dijagnostika (NAQ)</CardTitle>
              </CardHeader>
              <CardContent>
                <ClientNAQDashboard clientId={id!} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutritional">
            <Card>
              <CardHeader>
                <CardTitle>Nutritivna dijagnostika</CardTitle>
              </CardHeader>
              <CardContent>
                <NutritionalDiagnosticsTab clientId={id!} />
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
            <ChatInterfaceWrapper clientUserId={client.user_id} clientName={client.full_name} />
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