import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/integrations/supabase/client"
import { NAQScoringResults } from "@/components/naq/NAQScoringResults"
import { NAQAnalytics } from "@/components/naq/NAQAnalytics"
import { useNAQResults, useClientNAQHistory } from "@/hooks/useNAQScoring"
import { FileText, TrendingUp, Calendar, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

interface FormsTabProps {
  clientId: string
  clientName: string
}

export function FormsTab({ clientId, clientName }: FormsTabProps) {
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null)

  // Get client's submission history
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['client-submissions', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_submissions')
        .select(`
          id,
          submission_date,
          created_at,
          questionnaires (
            id,
            title,
            description
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!clientId
  })

  // Get NAQ history for this client
  const { data: naqHistory, isLoading: naqHistoryLoading } = useClientNAQHistory(clientId)

  // Get current NAQ results if a submission is selected
  const { data: naqResults, isLoading: naqResultsLoading } = useNAQResults(selectedSubmissionId || '')

  const naqSubmissions = submissions?.filter(sub => 
    sub.questionnaires?.title?.toLowerCase().includes('naq')
  ) || []

  const otherSubmissions = submissions?.filter(sub => 
    !sub.questionnaires?.title?.toLowerCase().includes('naq')
  ) || []

  const latestNAQSubmission = naqSubmissions[0]

  if (submissionsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse text-lg">Učitavam forme...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Forms & Questionnaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="naq" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="naq">NAQ Rezultati</TabsTrigger>
              <TabsTrigger value="analytics">NAQ Analitika</TabsTrigger>
              <TabsTrigger value="history">História NAQ</TabsTrigger>
              <TabsTrigger value="other">Ostale forme</TabsTrigger>
            </TabsList>

            <TabsContent value="naq" className="space-y-4">
              {latestNAQSubmission ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Najnoviji NAQ rezultati</h3>
                      <p className="text-sm text-muted-foreground">
                        Ispunjeno: {format(new Date(latestNAQSubmission.created_at), 'dd.MM.yyyy HH:mm')}
                      </p>
                    </div>
                    <Button 
                      onClick={() => setSelectedSubmissionId(latestNAQSubmission.id)}
                      variant={selectedSubmissionId === latestNAQSubmission.id ? "default" : "outline"}
                    >
                      Prikaži rezultate
                    </Button>
                  </div>

                  {selectedSubmissionId === latestNAQSubmission.id && (
                    <div className="mt-4">
                      {naqResultsLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-pulse">Učitavam rezultate...</div>
                        </div>
                      ) : naqResults ? (
                        <NAQScoringResults results={naqResults} clientName={clientName} />
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                          <p>Rezultati još nisu obrađeni</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nema NAQ upitnika</p>
                  <p className="text-sm">Klijent još nije ispunio NAQ upitnik</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <NAQAnalytics clientId={clientId} />
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {naqHistoryLoading ? (
                <div className="text-center py-4">
                  <div className="animate-pulse">Učitavam povijest...</div>
                </div>
              ) : naqHistory && naqHistory.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold mb-4">NAQ História</h3>
                  {naqHistory.map((entry, index) => (
                    <Card key={entry.submissionId} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={index === 0 ? "default" : "secondary"}>
                              {index === 0 ? "Najnoviji" : `#${index + 1}`}
                            </Badge>
                            <h4 className="font-medium">{entry.questionnaireName}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            {format(new Date(entry.submissionDate), 'dd.MM.yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            Ukupno sekcija: {entry.scores.length}
                          </div>
                          <div className="text-sm font-medium">
                            Visok prioritet: {entry.scores.filter(s => s.priorityLevel === 'high').length}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedSubmissionId(entry.submissionId)}
                            className="mt-2"
                          >
                            Prikaži detalje
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nema NAQ povijesti</p>
                  <p className="text-sm">Klijent još nije ispunio nijedan NAQ upitnik</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="other" className="space-y-4">
              {otherSubmissions.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold mb-4">Ostale forme</h3>
                  {otherSubmissions.map((submission) => (
                    <Card key={submission.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{submission.questionnaires?.title || 'Untitled'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {submission.questionnaires?.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ispunjeno: {format(new Date(submission.created_at), 'dd.MM.yyyy HH:mm')}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          Pregled
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nema drugih formi</p>
                  <p className="text-sm">Klijent nije ispunio druge upitnike</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}