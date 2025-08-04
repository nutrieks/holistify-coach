import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AdminLayout } from "@/components/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { ArrowLeft, Calendar, Mail, Phone, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ClientProfile {
  id: string
  client_id: string
  coach_id: string
  status: string
  start_date: string | null
  created_at: string
  client_profile: {
    full_name: string | null
    profile_image_url: string | null
  } | null
}

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [client, setClient] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchClient = async () => {
    if (!id) return
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          client_profile:profiles!clients_client_id_fkey (
            full_name,
            profile_image_url
          )
        `)
        .eq('client_id', id)
        .single()

      if (error) throw error
      setClient(data)
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno dohvaćanje podataka klijenta",
        variant: "destructive"
      })
      navigate('/admin/clients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClient()
  }, [id])

  const getStatusBadge = (status: string) => {
    const variants = {
      'active': 'default',
      'pending': 'secondary',
      'inactive': 'outline'
    } as const
    
    const labels = {
      'active': 'Aktivan',
      'pending': 'Čeka',
      'inactive': 'Neaktivan'
    }
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
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
                  {client.client_profile?.full_name || 'Nepoznato ime'}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  {getStatusBadge(client.status)}
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
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Informacije</TabsTrigger>
            <TabsTrigger value="nutrition">Plan prehrane</TabsTrigger>
            <TabsTrigger value="training">Plan treninga</TabsTrigger>
            <TabsTrigger value="progress">Napredak</TabsTrigger>
            <TabsTrigger value="forms">Upitnici</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="notes">Bilješke</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Osnovne informacije</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Puno ime
                    </label>
                    <p className="text-sm">
                      {client.client_profile?.full_name || 'Nije uneseno'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(client.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Datum početka programa
                    </label>
                    <p className="text-sm">
                      {client.start_date ? 
                        new Date(client.start_date).toLocaleDateString('hr-HR') : 
                        'Nije određeno'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Datum dodavanja
                    </label>
                    <p className="text-sm">
                      {new Date(client.created_at).toLocaleDateString('hr-HR')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kontakt informacije</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Kontakt podaci će biti dodani naknadno</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="nutrition">
            <Card>
              <CardHeader>
                <CardTitle>Plan prehrane</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Funkcionalnost plana prehrane će biti implementirana naknadno</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training">
            <Card>
              <CardHeader>
                <CardTitle>Plan treninga</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Funkcionalnost plana treninga će biti implementirana naknadno</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Napredak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Praćenje napretka će biti implementirano naknadno</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forms">
            <Card>
              <CardHeader>
                <CardTitle>Upitnici</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Upitnici će biti implementirani naknadno</p>
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
                  <p>Chat funkcionalnost će biti implementirana naknadno</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Bilješke</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Bilješke će biti implementirane naknadno</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}