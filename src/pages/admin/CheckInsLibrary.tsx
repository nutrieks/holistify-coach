import { AdminLayout } from "@/components/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, TrendingUp, Calendar } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"

export default function CheckInsLibrary() {
  const { profile } = useAuth()

  // Fetch progress tracking data for all clients
  const { data: checkIns = [], isLoading } = useQuery({
    queryKey: ['checkins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('progress_tracking')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!profile?.id
  })

  if (isLoading) {
    return (
      <AdminLayout title="Check-ins">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-lg">Učitavam...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Check-ins">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Pregled Check-ins</h2>
            <p className="text-muted-foreground">
              Praćenje napretka svih klijenata
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupno Check-ins</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checkIns.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ovaj Tjedan</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {checkIns.filter(c => {
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return new Date(c.date) >= weekAgo
                }).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktivni Klijenti</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(checkIns.map(c => c.client_id)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Najnoviji Check-ins</CardTitle>
            <CardDescription>
              Pregled najnovih unosa napretka od strane klijenata
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checkIns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nema unesenih check-ins</p>
                <p className="text-sm">Klijenti još nisu unijeli podatke o napretku</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Klijent</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Tip Mjerenja</TableHead>
                    <TableHead>Vrijednost</TableHead>
                    <TableHead>Napomene</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkIns.slice(0, 20).map((checkIn) => (
                    <TableRow key={checkIn.id}>
                      <TableCell className="font-medium">
                        Klijent {checkIn.client_id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        {new Date(checkIn.date).toLocaleDateString('hr-HR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {checkIn.metric_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{checkIn.value}</TableCell>
                      <TableCell>
                        {checkIn.value ? (
                          <span className="text-sm text-muted-foreground">
                            {checkIn.value.length > 50 
                              ? `${checkIn.value.substring(0, 50)}...` 
                              : checkIn.value
                            }
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}