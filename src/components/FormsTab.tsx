import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/integrations/supabase/client"
import { NAQScoringResults } from "@/components/naq/NAQScoringResults"
import { NAQAnalytics } from "@/components/naq/NAQAnalytics"
import { MicronutrientResultsView } from "@/components/micronutrient/MicronutrientResultsView"
import { MicronutrientQuestionnaireForm } from "@/components/micronutrient/MicronutrientQuestionnaireForm"
import { useNAQResults, useClientNAQHistory } from "@/hooks/useNAQScoring"
import { useMicronutrientResults } from "@/hooks/useMicronutrientResults"
import { useSeedNAQQuestions } from "@/hooks/useSeedNAQQuestions"
import { AssignQuestionnaireModal } from "@/components/AssignQuestionnaireModal"
import { AssignMicronutrientModal } from "@/components/AssignMicronutrientModal"
import { FileText, TrendingUp, Calendar, AlertTriangle, Plus, Send, Eye, CheckCircle, Activity } from "lucide-react"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"

interface FormsTabProps {
  clientId: string
  clientName: string
}

export function FormsTab({ clientId, clientName }: FormsTabProps) {
  const navigate = useNavigate()
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showAssignMicronutrientModal, setShowAssignMicronutrientModal] = useState(false)
  const [showMicronutrientForm, setShowMicronutrientForm] = useState(false)
  const seedNAQMutation = useSeedNAQQuestions()

  // Get micronutrient results
  const { data: micronutrientData } = useMicronutrientResults(clientId)

  // Get assigned micronutrient questionnaires
  const { data: assignedMicronutrient, refetch: refetchMicronutrient } = useQuery({
    queryKey: ['assigned-micronutrient', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assigned_micronutrient_questionnaires')
        .select(`
          id,
          status,
          assigned_at,
          completed_at,
          notes,
          micronutrient_questionnaires (
            id,
            title,
            description
          )
        `)
        .eq('client_id', clientId)
        .order('assigned_at', { ascending: false })
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!clientId
  })

  // Get assigned questionnaires (excluding NAQ)
  const { data: assignedQuestionnaires, refetch: refetchAssigned } = useQuery({
    queryKey: ['assigned-questionnaires', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assigned_questionnaires')
        .select(`
          id,
          status,
          assigned_at,
          completed_at,
          questionnaires (
            id,
            title,
            description,
            questionnaire_type
          )
        `)
        .eq('client_id', clientId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      
      // Filter out NAQ questionnaires
      return data?.filter(
        (item: any) => item.questionnaires?.questionnaire_type !== 'naq'
      ) || [];
    },
    enabled: !!clientId
  })

  // Get client's submission history
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['client-submissions', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_submissions')
        .select(`
          id,
          created_at,
          submitted_at,
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

  const handleSeedNAQQuestions = async () => {
    if (latestNAQSubmission?.questionnaires?.id) {
      await seedNAQMutation.mutateAsync(latestNAQSubmission.questionnaires.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="outline" className="flex items-center gap-1"><Send className="h-3 w-3" />Poslano</Badge>
      case 'viewed':
        return <Badge variant="secondary" className="flex items-center gap-1"><Eye className="h-3 w-3" />Pregledano</Badge>
      case 'completed':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Ispunjeno</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Forms & Questionnaires
            </CardTitle>
            <Button onClick={() => setShowAssignModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Dodijeli upitnik
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="assigned" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="assigned">Dodijeljeni</TabsTrigger>
              <TabsTrigger value="naq">NAQ Rezultati</TabsTrigger>
              <TabsTrigger value="analytics">NAQ Analitika</TabsTrigger>
              <TabsTrigger value="history">Povijest NAQ</TabsTrigger>
              <TabsTrigger value="other">Ostale forme</TabsTrigger>
            </TabsList>

            <TabsContent value="assigned" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Dodijeljeni upitnici</h3>
                <div className="flex gap-2">
                  <Button onClick={() => setShowAssignModal(true)} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Standardni upitnik
                  </Button>
                  <Button onClick={() => setShowAssignMicronutrientModal(true)} size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Mikronutritivna analiza
                  </Button>
                </div>
              </div>

              {/* Micronutrient Assignment */}
              {assignedMicronutrient && (
                <Card className="p-4 border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-primary" />
                        {getStatusBadge(assignedMicronutrient.status)}
                        <h4 className="font-medium">{assignedMicronutrient.micronutrient_questionnaires?.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {assignedMicronutrient.micronutrient_questionnaires?.description}
                      </p>
                      {assignedMicronutrient.notes && (
                        <p className="text-sm text-muted-foreground italic mt-1">
                          Napomena: {assignedMicronutrient.notes}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Dodijeljeno: {format(new Date(assignedMicronutrient.assigned_at), 'dd.MM.yyyy')}
                        </span>
                        {assignedMicronutrient.completed_at && (
                          <span>
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                            Završeno: {format(new Date(assignedMicronutrient.completed_at), 'dd.MM.yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {assignedMicronutrient.status === 'completed' && micronutrientData ? (
                        <Button size="sm" variant="outline" onClick={() => setShowMicronutrientForm(true)}>
                          Pregled rezultata
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => setShowMicronutrientForm(true)}>
                          Ispuni
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Regular Questionnaires */}
              {assignedQuestionnaires && assignedQuestionnaires.length > 0 ? (
                <div className="space-y-3">
                  {assignedQuestionnaires.map((assigned) => (
                    <Card key={assigned.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(assigned.status)}
                            <h4 className="font-medium">{assigned.questionnaires?.title || 'Untitled'}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {assigned.questionnaires?.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              <Calendar className="h-3 w-3 inline mr-1" />
                              Dodijeljeno: {format(new Date(assigned.assigned_at), 'dd.MM.yyyy')}
                            </span>
                            {assigned.completed_at && (
                              <span>
                                <CheckCircle className="h-3 w-3 inline mr-1" />
                                Završeno: {format(new Date(assigned.completed_at), 'dd.MM.yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {assigned.status === 'completed' && (
                            <Button size="sm" variant="outline">
                              Pregled rezultata
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Postavi dodatno pitanje
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : !assignedMicronutrient ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nema dodijeljenih upitnika</p>
                  <p className="text-sm">Dodijelite upitnike koristeći dugmad iznad</p>
                </div>
              ) : null}
            </TabsContent>

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
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleSeedNAQQuestions}
                        disabled={seedNAQMutation.isPending}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {seedNAQMutation.isPending ? 'Dodajem...' : 'Dopuni pitanja'}
                      </Button>
                      <Button 
                        onClick={() => setSelectedSubmissionId(latestNAQSubmission.id)}
                        variant={selectedSubmissionId === latestNAQSubmission.id ? "default" : "outline"}
                      >
                        Prikaži rezultate
                      </Button>
                    </div>
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
                  <h3 className="text-lg font-semibold mb-4">Povijest NAQ</h3>
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

      <AssignQuestionnaireModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        clientId={clientId}
        onQuestionnaireAssigned={() => {
          refetchAssigned()
          setShowAssignModal(false)
        }}
      />

      <AssignMicronutrientModal
        open={showAssignMicronutrientModal}
        onOpenChange={setShowAssignMicronutrientModal}
        clientId={clientId}
        onAssigned={() => {
          refetchMicronutrient()
          setShowAssignMicronutrientModal(false)
        }}
      />
      
      {/* Micronutrient Questionnaire Form Modal/View */}
      {showMicronutrientForm && assignedMicronutrient && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{assignedMicronutrient.micronutrient_questionnaires?.title}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowMicronutrientForm(false)
                    refetchMicronutrient()
                  }}
                >
                  Zatvori
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {micronutrientData?.results && micronutrientData.results.length > 0 ? (
                <MicronutrientResultsView clientId={clientId} />
              ) : (
                <MicronutrientQuestionnaireForm 
                  clientId={clientId}
                  onComplete={() => {
                    setShowMicronutrientForm(false)
                    refetchMicronutrient()
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}