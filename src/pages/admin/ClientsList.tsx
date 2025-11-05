import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AdminLayout } from "@/components/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/integrations/supabase/client"
import { Plus, Search, Calendar, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AddClientModal } from "@/components/AddClientModal"
import { TableSkeleton } from "@/components/TableSkeleton"
import { ContractProgressBar } from "@/components/ContractProgressBar"
import { ClientActionsMenu } from "@/components/ClientActionsMenu"

interface Client {
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
  is_archived: boolean | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
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

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesArchived = showArchived ? true : !client.is_archived
    return matchesSearch && matchesArchived
  })

  const getStatusBadge = (client: Client) => {
    if (client.is_archived) {
      return <Badge variant="secondary">Arhiviran</Badge>
    }
    return <Badge variant="default">Aktivan</Badge>
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
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži klijente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={showArchived}
                onCheckedChange={setShowArchived}
                id="show-archived"
              />
              <Label htmlFor="show-archived" className="cursor-pointer">
                Prikaži arhivirane
              </Label>
            </div>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Status Ugovora</TableHead>
                  <TableHead>Zadnja aktivnost</TableHead>
                  <TableHead>Trajanje</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow 
                    key={client.id}
                    className="border-b"
                  >
                    <TableCell 
                      className="pl-6 cursor-pointer"
                      onClick={() => navigate(`/admin/clients/${client.user_id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {client.full_name?.charAt(0)?.toUpperCase() || 'K'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">
                            {client.full_name || 'Nepoznato ime'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Dodan {new Date(client.created_at).toLocaleDateString('hr-HR')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => navigate(`/admin/clients/${client.user_id}`)} className="cursor-pointer">
                      {getStatusBadge(client)}
                    </TableCell>
                    <TableCell onClick={() => navigate(`/admin/clients/${client.user_id}`)} className="cursor-pointer">
                      <ContractProgressBar clientId={client.user_id} />
                    </TableCell>
                    <TableCell onClick={() => navigate(`/admin/clients/${client.user_id}`)} className="cursor-pointer">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity className="h-3 w-3" />
                        {new Date(client.created_at).toLocaleDateString('hr-HR')}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => navigate(`/admin/clients/${client.user_id}`)} className="cursor-pointer">
                      <div className="text-sm text-muted-foreground">
                        {client.contract_start_date ? 
                          Math.floor((new Date().getTime() - new Date(client.contract_start_date).getTime()) / (1000 * 60 * 60 * 24)) + ' dana'
                          : '-'
                        }
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <ClientActionsMenu
                        clientUserId={client.user_id}
                        clientName={client.full_name}
                        isArchived={client.is_archived || false}
                        onActionComplete={fetchClients}
                      />
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