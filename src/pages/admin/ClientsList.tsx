import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AdminLayout } from "@/components/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/integrations/supabase/client"
import { Plus, Search, Calendar, Phone, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-lg">Učitavam klijente...</div>
        </div>
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj klijenta
          </Button>
        </div>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Svi klijenti ({filteredClients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ime</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Datum početka</TableHead>
                  <TableHead>Datum dodavanja</TableHead>
                  <TableHead>Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow 
                    key={client.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/admin/clients/${client.client_id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {client.client_profile?.full_name?.charAt(0) || 'K'}
                        </div>
                        <span className="font-medium">
                          {client.client_profile?.full_name || 'Nepoznato ime'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>
                      {client.start_date ? 
                        new Date(client.start_date).toLocaleDateString('hr-HR') : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      {new Date(client.created_at).toLocaleDateString('hr-HR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredClients.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Nema klijenata koji odgovaraju pretraživanju.' : 'Nemate još klijenata.'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}