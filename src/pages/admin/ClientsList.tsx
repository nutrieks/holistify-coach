import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AdminLayout } from "@/components/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/integrations/supabase/client"
import { Plus, Search, Calendar, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AddClientModal } from "@/components/AddClientModal"
import { TableSkeleton } from "@/components/TableSkeleton"
import { ContractProgressBar } from "@/components/ContractProgressBar"

interface Client {
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

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const fetchClients = async () => {
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
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno dohvaćanje klijenata",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const filteredClients = clients.filter(client =>
    client.client_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <AdminLayout title="Klijenti">
        <TableSkeleton columns={5} rows={8} />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Klijenti">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži klijente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj klijenta
          </Button>
        </div>

        {/* Clients Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-[300px] pl-6">Klijent</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Status Ugovora</TableHead>
                  <TableHead>Zadnja aktivnost</TableHead>
                  <TableHead>Trajanje</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow 
                    key={client.id}
                    className="cursor-pointer hover:bg-muted/50 border-b"
                    onClick={() => navigate(`/admin/clients/${client.client_id}`)}
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {client.client_profile?.full_name?.charAt(0)?.toUpperCase() || 'K'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">
                            {client.client_profile?.full_name || 'Nepoznato ime'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Dodan {new Date(client.created_at).toLocaleDateString('hr-HR')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(client.status)}
                    </TableCell>
                    <TableCell>
                      <ContractProgressBar clientId={client.client_id} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity className="h-3 w-3" />
                        {new Date(client.created_at).toLocaleDateString('hr-HR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {client.start_date ? 
                          Math.floor((new Date().getTime() - new Date(client.start_date).getTime()) / (1000 * 60 * 60 * 24)) + ' dana'
                          : '-'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredClients.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {searchTerm ? 'Nema rezultata' : 'Nemate još klijenata'}
                  </p>
                  <p className="text-sm">
                    {searchTerm ? 'Pokušajte s drugim pojmom za pretraživanje.' : 'Dodajte novog klijenta za početak.'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Client Modal */}
        <AddClientModal 
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onClientAdded={fetchClients}
        />
      </div>
    </AdminLayout>
  )
}