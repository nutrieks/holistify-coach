import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/integrations/supabase/client"
import { useNAQResults, useClientNAQHistory } from "@/hooks/useNAQScoring"
import { NAQClientResults } from "@/components/naq/NAQClientResults"
import { FileText, TrendingUp, AlertTriangle, Calendar, Star } from "lucide-react"
import { format } from "date-fns"

interface ClientNAQDashboardProps {
  clientId: string
}

export function ClientNAQDashboard({ clientId }: ClientNAQDashboardProps) {
  // Get latest NAQ submission
  const { data: latestSubmission } = useQuery({
    queryKey: ['latest-naq-submission', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_submissions')
        .select(`
          id,
          submission_date,
          created_at,
          questionnaires!inner (
            id,
            title
          )
        `)
        .eq('client_id', clientId)
        .ilike('questionnaires.title', '%naq%')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!clientId
  })

  // Get NAQ results for latest submission
  const { data: naqResults, isLoading: resultsLoading } = useNAQResults(latestSubmission?.id || '')

  // Get NAQ history
  const { data: naqHistory } = useClientNAQHistory(clientId)

  if (!latestSubmission) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Nema NAQ rezultata</span>
              <p className="text-sm text-muted-foreground mt-1">
                Trebate ispuniti NAQ upitnik za personalizirane preporuke.
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (resultsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse text-lg">Učitavam NAQ rezultate...</div>
        </CardContent>
      </Card>
    )
  }

  if (!naqResults) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Rezultati se obrađuju</span>
              <p className="text-sm text-muted-foreground mt-1">
                Vaši NAQ rezultati se trenutno analiziraju.
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  const getOverallBurdenStatus = (burden: number) => {
    if (burden <= 1.0) return { label: "Nizak", color: "text-green-600", variant: "secondary" as const }
    if (burden <= 2.0) return { label: "Umjeren", color: "text-yellow-600", variant: "outline" as const }
    return { label: "Visok", color: "text-red-600", variant: "destructive" as const }
  }

  const overallStatus = getOverallBurdenStatus(naqResults.overallBurden)

  return (
    <div className="space-y-6">
      {/* Quick NAQ Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Vaši NAQ Rezultati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold mb-1">{naqResults.overallBurden.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Ukupno opterećenje</div>
              <Badge variant={overallStatus.variant} className="mt-2">
                {overallStatus.label}
              </Badge>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold mb-1 text-red-600">
                {naqResults.primaryConcerns.length}
              </div>
              <div className="text-sm text-muted-foreground">Prioritetni sustavi</div>
              <Badge variant="outline" className="mt-2">
                Visok prioritet
              </Badge>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold mb-1 text-blue-600">
                {naqResults.hierarchyRecommendations.length}
              </div>
              <div className="text-sm text-muted-foreground">Preporuke</div>
              <Badge variant="secondary" className="mt-2">
                Tretman
              </Badge>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Zadnje ažuriranje: {format(new Date(latestSubmission.created_at), 'dd.MM.yyyy')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <NAQClientResults 
        results={naqResults} 
        submissionDate={latestSubmission.created_at}
      />

      {/* NAQ History Quick View */}
      {naqHistory && naqHistory.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              NAQ Povijest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Imate {naqHistory.length} NAQ submisija
            </div>
            
            <div className="space-y-2">
              {naqHistory.slice(0, 3).map((entry, index) => (
                <div key={entry.submissionId} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(entry.submissionDate), 'dd.MM.yyyy')}
                    </span>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">Najnovije</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.scores.filter(s => s.priorityLevel === 'high').length} prioritetnih
                  </div>
                </div>
              ))}
            </div>

            {naqHistory.length > 3 && (
              <div className="mt-3 text-center">
                <p className="text-xs text-muted-foreground">
                  +{naqHistory.length - 3} više submisija
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}