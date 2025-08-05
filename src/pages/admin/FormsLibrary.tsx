import { useState } from "react"
import { AdminLayout } from "@/components/AdminLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye, FileText } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"

interface Questionnaire {
  id: string
  title: string
  description: string | null
  created_at: string
  _count?: {
    questionnaire_questions: number
    client_submissions: number
  }
}

interface Question {
  id: string
  question_text: string
  question_type: string
  question_order: number | null
}

export default function FormsLibrary() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false)
  const [newQuestionnaire, setNewQuestionnaire] = useState({ title: "", description: "" })
  const [newQuestion, setNewQuestion] = useState({ question_text: "", question_type: "text" })

  // Fetch questionnaires
  const { data: questionnaires = [], isLoading } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questionnaires')
        .select(`
          *,
          questionnaire_questions(count),
          client_submissions(count)
        `)
        .eq('coach_id', profile?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map(q => ({
        ...q,
        _count: {
          questionnaire_questions: q.questionnaire_questions?.length || 0,
          client_submissions: q.client_submissions?.length || 0
        }
      }))
    },
    enabled: !!profile?.id
  })

  // Fetch questions for selected questionnaire
  const { data: questions = [] } = useQuery({
    queryKey: ['questionnaire-questions', selectedQuestionnaire?.id],
    queryFn: async () => {
      if (!selectedQuestionnaire?.id) return []
      const { data, error } = await supabase
        .from('questionnaire_questions')
        .select('*')
        .eq('questionnaire_id', selectedQuestionnaire.id)
        .order('question_order', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!selectedQuestionnaire?.id
  })

  // Create questionnaire
  const createQuestionnaire = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const { error } = await supabase
        .from('questionnaires')
        .insert({
          ...data,
          coach_id: profile?.id
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] })
      setIsCreateOpen(false)
      setNewQuestionnaire({ title: "", description: "" })
      toast({ title: "Upitnik kreiran uspješno" })
    },
    onError: () => {
      toast({ title: "Greška pri kreiranju upitnika", variant: "destructive" })
    }
  })

  // Delete questionnaire
  const deleteQuestionnaire = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('questionnaires')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] })
      toast({ title: "Upitnik obrisan uspješno" })
    },
    onError: () => {
      toast({ title: "Greška pri brisanju upitnika", variant: "destructive" })
    }
  })

  // Add question
  const addQuestion = useMutation({
    mutationFn: async (data: { question_text: string; question_type: string }) => {
      const { error } = await supabase
        .from('questionnaire_questions')
        .insert({
          ...data,
          questionnaire_id: selectedQuestionnaire?.id,
          question_order: questions.length + 1
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaire-questions', selectedQuestionnaire?.id] })
      setNewQuestion({ question_text: "", question_type: "text" })
      toast({ title: "Pitanje dodano uspješno" })
    },
    onError: () => {
      toast({ title: "Greška pri dodavanju pitanja", variant: "destructive" })
    }
  })

  const handleCreateQuestionnaire = () => {
    if (!newQuestionnaire.title.trim()) return
    createQuestionnaire.mutate(newQuestionnaire)
  }

  const handleAddQuestion = () => {
    if (!newQuestion.question_text.trim()) return
    addQuestion.mutate(newQuestion)
  }

  if (isLoading) {
    return (
      <AdminLayout title="Biblioteka Upitnika">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-lg">Učitavam...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Biblioteka Upitnika">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Upravljanje Upitnicima</h2>
            <p className="text-muted-foreground">
              Kreirajte i upravljajte upitnicima za vaše klijente
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novi Upitnik
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kreiraj Novi Upitnik</DialogTitle>
                <DialogDescription>
                  Unesite osnovne informacije o upitniku
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Naziv</Label>
                  <Input
                    id="title"
                    value={newQuestionnaire.title}
                    onChange={(e) => setNewQuestionnaire(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Unesite naziv upitnika"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Opis</Label>
                  <Textarea
                    id="description"
                    value={newQuestionnaire.description}
                    onChange={(e) => setNewQuestionnaire(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Kratki opis upitnika"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Odustani
                </Button>
                <Button onClick={handleCreateQuestionnaire}>
                  Kreiraj
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vaši Upitnici</CardTitle>
            <CardDescription>
              Pregled svih kreiranih upitnika
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naziv</TableHead>
                  <TableHead>Opis</TableHead>
                  <TableHead>Pitanja</TableHead>
                  <TableHead>Odgovori</TableHead>
                  <TableHead>Kreiran</TableHead>
                  <TableHead>Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionnaires.map((questionnaire) => (
                  <TableRow key={questionnaire.id}>
                    <TableCell className="font-medium">{questionnaire.title}</TableCell>
                    <TableCell>{questionnaire.description || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {questionnaire._count?.questionnaire_questions || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {questionnaire._count?.client_submissions || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(questionnaire.created_at).toLocaleDateString('hr-HR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedQuestionnaire(questionnaire)
                            setIsQuestionsOpen(true)
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuestionnaire.mutate(questionnaire.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Questions Dialog */}
        <Dialog open={isQuestionsOpen} onOpenChange={setIsQuestionsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedQuestionnaire?.title} - Pitanja</DialogTitle>
              <DialogDescription>
                Upravljajte pitanjima u upitniku
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Unesite novo pitanje"
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, question_text: e.target.value }))}
                />
                <Select
                  value={newQuestion.question_type}
                  onValueChange={(value) => setNewQuestion(prev => ({ ...prev, question_type: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Tekst</SelectItem>
                    <SelectItem value="multiple_choice">Višestruki izbor</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="scale_1_10">Skala 1-10</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddQuestion}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <div key={question.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{index + 1}. {question.question_text}</span>
                      <Badge variant="outline" className="ml-2">
                        {question.question_type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}