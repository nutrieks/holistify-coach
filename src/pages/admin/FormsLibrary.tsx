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
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Eye, FileText, ChevronUp, ChevronDown, Copy, AlertCircle } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { CreateCompleteNAQButton } from "@/components/CreateCompleteNAQButton"
import { CreateCoachingIntakeButton } from "@/components/CreateCoachingIntakeButton"
import { SeedMicronutrientQuestionnaireButton } from "@/components/SeedMicronutrientQuestionnaireButton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  order_index: number | null
  options?: string | null
  created_at?: string
  questionnaire_id?: string
}

interface EditingQuestion extends Omit<Question, 'options'> {
  options?: string[]
}

type QuestionType = 'short_text' | 'long_text' | 'multiple_choice' | 'checkbox' | 'scale_1_10'

export default function FormsLibrary() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null)
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<Questionnaire | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<EditingQuestion | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false)
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isMicronutrientQuestionsOpen, setIsMicronutrientQuestionsOpen] = useState(false)
  const [newQuestionnaire, setNewQuestionnaire] = useState({ title: "", description: "" })
  const [newQuestion, setNewQuestion] = useState({ 
    question_text: "", 
    question_type: "short_text" as QuestionType,
    options: [] as string[]
  })
  const [currentOption, setCurrentOption] = useState("")

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

  // Fetch micronutrient questionnaire
  const { data: micronutrientQuestionnaire } = useQuery({
    queryKey: ['micronutrient-questionnaire'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('micronutrient_questionnaires')
        .select('*')
        .eq('is_active', true)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!profile?.id
  })

  // Fetch micronutrient questions count
  const { data: micronutrientQuestionsData = [] } = useQuery({
    queryKey: ['micronutrient-questions', micronutrientQuestionnaire?.id],
    queryFn: async () => {
      if (!micronutrientQuestionnaire?.id) return []
      const { data, error } = await supabase
        .from('micronutrient_questions')
        .select('*')
        .eq('questionnaire_id', micronutrientQuestionnaire.id)
        .order('order_index', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!micronutrientQuestionnaire?.id
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
        .order('order_index', { ascending: true })

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

  // Update questionnaire
  const updateQuestionnaire = useMutation({
    mutationFn: async (data: { id: string; title: string; description: string }) => {
      const { error } = await supabase
        .from('questionnaires')
        .update({ title: data.title, description: data.description })
        .eq('id', data.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] })
      setIsEditOpen(false)
      setEditingQuestionnaire(null)
      toast({ title: "Upitnik ažuriran uspješno" })
    },
    onError: () => {
      toast({ title: "Greška pri ažuriranju upitnika", variant: "destructive" })
    }
  })

  // Add question
  const addQuestion = useMutation({
    mutationFn: async (data: { question_text: string; question_type: string; options?: string[] }) => {
      const questionData = {
        question_text: data.question_text,
        question_type: data.question_type,
        questionnaire_id: selectedQuestionnaire?.id,
        order_index: questions.length + 1,
        options: (data.question_type === 'multiple_choice' || data.question_type === 'checkbox') 
          ? JSON.stringify(data.options) 
          : null
      }

      const { error } = await supabase
        .from('questionnaire_questions')
        .insert(questionData)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaire-questions', selectedQuestionnaire?.id] })
      setNewQuestion({ question_text: "", question_type: "short_text", options: [] })
      setCurrentOption("")
      toast({ title: "Pitanje dodano uspješno" })
    },
    onError: () => {
      toast({ title: "Greška pri dodavanju pitanja", variant: "destructive" })
    }
  })

  // Update question
  const updateQuestion = useMutation({
    mutationFn: async (data: { id: string; question_text: string; question_type: string; options?: string[] }) => {
      const questionData = {
        question_text: data.question_text,
        question_type: data.question_type,
        options: (data.question_type === 'multiple_choice' || data.question_type === 'checkbox') 
          ? JSON.stringify(data.options) 
          : null
      }

      const { error } = await supabase
        .from('questionnaire_questions')
        .update(questionData)
        .eq('id', data.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaire-questions', selectedQuestionnaire?.id] })
      setIsEditQuestionOpen(false)
      setEditingQuestion(null)
      toast({ title: "Pitanje ažurirano uspješno" })
    },
    onError: () => {
      toast({ title: "Greška pri ažuriranju pitanja", variant: "destructive" })
    }
  })

  // Delete question
  const deleteQuestion = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from('questionnaire_questions')
        .delete()
        .eq('id', questionId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaire-questions', selectedQuestionnaire?.id] })
      toast({ title: "Pitanje obrisano uspješno" })
    },
    onError: () => {
      toast({ title: "Greška pri brisanju pitanja", variant: "destructive" })
    }
  })

  // Reorder questions
  const reorderQuestions = useMutation({
    mutationFn: async (reorderedQuestions: Question[]) => {
      const updates = reorderedQuestions.map((question, index) => ({
        id: question.id,
        order_index: index + 1
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('questionnaire_questions')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
        
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaire-questions', selectedQuestionnaire?.id] })
      toast({ title: "Redoslijed pitanja ažuriran" })
    },
    onError: () => {
      toast({ title: "Greška pri ažuriranju redoslijeda", variant: "destructive" })
    }
  })

  // Toggle micronutrient questionnaire active status
  const toggleMicronutrientActive = useMutation({
    mutationFn: async (data: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('micronutrient_questionnaires')
        .update({ is_active: data.is_active })
        .eq('id', data.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['micronutrient-questionnaire'] })
      toast({ title: "Status upitnika ažuriran" })
    },
    onError: () => {
      toast({ title: "Greška pri ažuriranju statusa", variant: "destructive" })
    }
  })

  const handleCreateQuestionnaire = () => {
    if (!newQuestionnaire.title.trim()) return
    createQuestionnaire.mutate(newQuestionnaire)
  }

  const handleUpdateQuestionnaire = () => {
    if (!editingQuestionnaire?.title.trim()) return
    updateQuestionnaire.mutate({
      id: editingQuestionnaire.id,
      title: editingQuestionnaire.title,
      description: editingQuestionnaire.description || ""
    })
  }

  const handleAddQuestion = () => {
    if (!newQuestion.question_text.trim()) return
    const questionData = {
      question_text: newQuestion.question_text,
      question_type: newQuestion.question_type,
      options: (newQuestion.question_type === 'multiple_choice' || newQuestion.question_type === 'checkbox') 
        ? newQuestion.options 
        : undefined
    }
    addQuestion.mutate(questionData)
  }

  const handleUpdateQuestion = () => {
    if (!editingQuestion || !editingQuestion.question_text.trim()) return
    const questionData = {
      id: editingQuestion.id,
      question_text: editingQuestion.question_text,
      question_type: editingQuestion.question_type,
      options: (editingQuestion.question_type === 'multiple_choice' || editingQuestion.question_type === 'checkbox') 
        ? editingQuestion.options 
        : undefined
    }
    updateQuestion.mutate(questionData)
  }

  const addOption = () => {
    if (!currentOption.trim()) return
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, currentOption]
    }))
    setCurrentOption("")
  }

  const removeOption = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === questionId)
    if (currentIndex === -1) return

    const newQuestions = [...questions]
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return

    [newQuestions[currentIndex], newQuestions[targetIndex]] = 
    [newQuestions[targetIndex], newQuestions[currentIndex]]

    reorderQuestions.mutate(newQuestions as Question[])
  }

  const handleViewMicronutrientQuestions = () => {
    setIsMicronutrientQuestionsOpen(true)
  }

  const handleToggleMicronutrientActive = () => {
    if (!micronutrientQuestionnaire) return
    toggleMicronutrientActive.mutate({
      id: micronutrientQuestionnaire.id,
      is_active: !micronutrientQuestionnaire.is_active
    })
  }

  const getQuestionTypeLabel = (type: string) => {
    const types = {
      'short_text': 'Kratki tekst',
      'long_text': 'Dugi tekst', 
      'multiple_choice': 'Višestruki izbor',
      'checkbox': 'Potvrdni okviri',
      'scale_1_10': 'Skala 1-10',
      'text': 'Tekst',
      'yes_no': 'Da/Ne',
      'frequency': 'Učestalost',
      'portion': 'Porcija'
    }
    return types[type as keyof typeof types] || type
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
        {/* Sistemski Upitnici Sekcija */}
        {micronutrientQuestionnaire && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {micronutrientQuestionnaire.title}
                    <Badge variant={micronutrientQuestionnaire.is_active ? "default" : "secondary"}>
                      {micronutrientQuestionnaire.is_active ? "Aktivan" : "Neaktivan"}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {micronutrientQuestionnaire.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewMicronutrientQuestions}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Pregled Pitanja
                  </Button>
                  <Button
                    variant={micronutrientQuestionnaire.is_active ? "secondary" : "default"}
                    size="sm"
                    onClick={handleToggleMicronutrientActive}
                  >
                    {micronutrientQuestionnaire.is_active ? "Deaktiviraj" : "Aktiviraj"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Ukupno pitanja</p>
                  <p className="text-2xl font-bold">{micronutrientQuestionsData.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sekcije</p>
                  <p className="text-2xl font-bold">
                    {new Set(micronutrientQuestionsData.map(q => q.section)).size}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kategorije</p>
                  <p className="text-2xl font-bold">
                    {new Set(micronutrientQuestionsData.map(q => q.category)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Ostali Upitnici</h2>
            <p className="text-muted-foreground">
              Kreirajte i upravljajte dodatnim upitnicima za vaše klijente
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
                          title="Upravljaj pitanjima"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedQuestionnaire(questionnaire)
                            setIsPreviewOpen(true)
                          }}
                          title="Pregled upitnika"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingQuestionnaire(questionnaire)
                            setIsEditOpen(true)
                          }}
                          title="Uredi upitnik"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuestionnaire.mutate(questionnaire.id)}
                          title="Obriši upitnik"
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

        {/* Edit Questionnaire Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Uredi Upitnik</DialogTitle>
              <DialogDescription>
                Uredite osnovne informacije upitnika
              </DialogDescription>
            </DialogHeader>
            {editingQuestionnaire && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Naziv</Label>
                  <Input
                    id="edit-title"
                    value={editingQuestionnaire.title}
                    onChange={(e) => setEditingQuestionnaire(prev => 
                      prev ? { ...prev, title: e.target.value } : null
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Opis</Label>
                  <Textarea
                    id="edit-description"
                    value={editingQuestionnaire.description || ""}
                    onChange={(e) => setEditingQuestionnaire(prev => 
                      prev ? { ...prev, description: e.target.value } : null
                    )}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Odustani
              </Button>
              <Button onClick={handleUpdateQuestionnaire}>
                Ažuriraj
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Questions Dialog */}
        <Dialog open={isQuestionsOpen} onOpenChange={setIsQuestionsOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedQuestionnaire?.title} - Pitanja</DialogTitle>
              <DialogDescription>
                Upravljajte pitanjima u upitniku
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Add New Question */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dodaj Novo Pitanje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Tekst pitanja</Label>
                    <Input
                      placeholder="Unesite pitanje"
                      value={newQuestion.question_text}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, question_text: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Tip pitanja</Label>
                    <Select
                      value={newQuestion.question_type}
                      onValueChange={(value: QuestionType) => setNewQuestion(prev => ({ 
                        ...prev, 
                        question_type: value,
                        options: []
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short_text">Kratki tekst</SelectItem>
                        <SelectItem value="long_text">Dugi tekst</SelectItem>
                        <SelectItem value="multiple_choice">Višestruki izbor</SelectItem>
                        <SelectItem value="checkbox">Potvrdni okviri</SelectItem>
                        <SelectItem value="scale_1_10">Skala 1-10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Options for multiple choice and checkbox */}
                  {(newQuestion.question_type === 'multiple_choice' || newQuestion.question_type === 'checkbox') && (
                    <div>
                      <Label>Opcije</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Dodaj opciju"
                            value={currentOption}
                            onChange={(e) => setCurrentOption(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addOption()}
                          />
                          <Button onClick={addOption} size="sm">Dodaj</Button>
                        </div>
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span>{option}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeOption(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={handleAddQuestion} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Dodaj Pitanje
                  </Button>
                </CardContent>
              </Card>
              
              {/* Existing Questions */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Postojeća Pitanja</h3>
                {questions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nema dodanih pitanja. Dodajte prvo pitanje iznad.
                  </p>
                ) : (
                  questions.map((question, index) => (
                    <Card key={question.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-muted-foreground">
                                {index + 1}.
                              </span>
                              <span className="font-medium">{question.question_text}</span>
                              <Badge variant="outline">
                                {getQuestionTypeLabel(question.question_type)}
                              </Badge>
                            </div>
                            {question.options && typeof question.options === 'string' && (
                              <div className="mt-2 ml-6">
                                <div className="text-sm text-muted-foreground">Opcije:</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {JSON.parse(question.options).map((option: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {option}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveQuestion(question.id, 'up')}
                              disabled={index === 0}
                              title="Pomjeri gore"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveQuestion(question.id, 'down')}
                              disabled={index === questions.length - 1}
                              title="Pomjeri dolje"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingQuestion({
                                  ...question,
                                  options: question.options && typeof question.options === 'string' 
                                    ? JSON.parse(question.options) 
                                    : []
                                } as Question & { options: string[] })
                                setIsEditQuestionOpen(true)
                              }}
                              title="Uredi pitanje"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteQuestion.mutate(question.id)}
                              title="Obriši pitanje"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Question Dialog */}
        <Dialog open={isEditQuestionOpen} onOpenChange={setIsEditQuestionOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Uredi Pitanje</DialogTitle>
              <DialogDescription>
                Uredite postojeće pitanje
              </DialogDescription>
            </DialogHeader>
            {editingQuestion && (
              <div className="space-y-4">
                <div>
                  <Label>Tekst pitanja</Label>
                  <Input
                    value={editingQuestion.question_text}
                    onChange={(e) => setEditingQuestion(prev => 
                      prev ? { ...prev, question_text: e.target.value } : null
                    )}
                  />
                </div>
                
                <div>
                  <Label>Tip pitanja</Label>
                  <Select
                    value={editingQuestion.question_type}
                    onValueChange={(value: QuestionType) => setEditingQuestion(prev => 
                      prev ? { 
                        ...prev, 
                        question_type: value,
                        options: (value === 'multiple_choice' || value === 'checkbox') ? (prev.options || []) : []
                      } : null
                    )}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short_text">Kratki tekst</SelectItem>
                      <SelectItem value="long_text">Dugi tekst</SelectItem>
                      <SelectItem value="multiple_choice">Višestruki izbor</SelectItem>
                      <SelectItem value="checkbox">Potvrdni okviri</SelectItem>
                      <SelectItem value="scale_1_10">Skala 1-10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(editingQuestion.question_type === 'multiple_choice' || editingQuestion.question_type === 'checkbox') && (
                  <div>
                    <Label>Opcije</Label>
                    <div className="space-y-2">
                      {editingQuestion.options?.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) => setEditingQuestion(prev => {
                              if (!prev) return null
                              const newOptions = [...(prev.options || [])]
                              newOptions[index] = e.target.value
                              return { ...prev, options: newOptions }
                            })}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingQuestion(prev => {
                              if (!prev) return null
                              return { 
                                ...prev, 
                                options: prev.options?.filter((_, i) => i !== index) || []
                              }
                            })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingQuestion(prev => {
                          if (!prev) return null
                          return { 
                            ...prev, 
                            options: [...(prev.options || []), "Nova opcija"]
                          }
                        })}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Dodaj Opciju
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditQuestionOpen(false)}>
                Odustani
              </Button>
              <Button onClick={handleUpdateQuestion}>
                Ažuriraj
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Pregled: {selectedQuestionnaire?.title}</DialogTitle>
              <DialogDescription>
                Kako će upitnik izgledati klijentima
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="p-4 border rounded-lg space-y-3">
                  <Label className="text-sm font-medium">
                    {index + 1}. {question.question_text}
                  </Label>
                  
                  {question.question_type === 'short_text' && (
                    <Input placeholder="Kratki odgovor..." disabled />
                  )}
                  
                  {question.question_type === 'long_text' && (
                    <Textarea placeholder="Detaljni odgovor..." disabled />
                  )}
                  
                  {question.question_type === 'multiple_choice' && question.options && typeof question.options === 'string' && (
                    <div className="space-y-2">
                      {JSON.parse(question.options).map((option: string, idx: number) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <input type="radio" disabled name={`preview-${question.id}`} />
                          <span className="text-sm">{option}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.question_type === 'checkbox' && question.options && typeof question.options === 'string' && (
                    <div className="space-y-2">
                      {JSON.parse(question.options).map((option: string, idx: number) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Checkbox disabled />
                          <span className="text-sm">{option}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.question_type === 'scale_1_10' && (
                    <div className="space-y-2">
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[5]}
                        disabled
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1</span>
                        <span>5</span>
                        <span>10</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {questions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nema pitanja za prikaz. Dodajte pitanja za pregled.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Micronutrient Questions Dialog */}
        <Dialog open={isMicronutrientQuestionsOpen} onOpenChange={setIsMicronutrientQuestionsOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Mikronutritivni Upitnik - Pitanja</DialogTitle>
              <DialogDescription>
                Pregled svih {micronutrientQuestionsData.length} pitanja iz mikronutritivnog upitnika
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Ukupno pitanja</p>
                  <p className="text-2xl font-bold">{micronutrientQuestionsData.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Sekcije</p>
                  <p className="text-2xl font-bold">
                    {new Set(micronutrientQuestionsData.map(q => q.section)).size}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Kategorije</p>
                  <p className="text-2xl font-bold">
                    {new Set(micronutrientQuestionsData.map(q => q.category)).size}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {Array.from(new Set(micronutrientQuestionsData.map(q => q.section))).map(section => (
                  <div key={section} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      Sekcija {section}
                      <Badge variant="outline">
                        {micronutrientQuestionsData.filter(q => q.section === section).length} pitanja
                      </Badge>
                    </h3>
                    
                    {Array.from(new Set(micronutrientQuestionsData.filter(q => q.section === section).map(q => q.category))).map(category => (
                      <div key={category} className="mb-6 last:mb-0">
                        <h4 className="text-md font-medium mb-3 text-primary">{category}</h4>
                        <div className="space-y-3">
                          {micronutrientQuestionsData
                            .filter(q => q.section === section && q.category === category)
                            .map((question) => (
                              <div key={question.id} className="p-3 bg-muted/30 rounded-md space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="secondary" className="text-xs">
                                        {question.question_code}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {getQuestionTypeLabel(question.question_type)}
                                      </Badge>
                                    </div>
                                    <p className="text-sm">{question.question_text}</p>
                                  </div>
                                </div>
                                {question.options && (
                                  <div className="text-xs text-muted-foreground pl-2 border-l-2 border-muted">
                                    Opcije: {typeof question.options === 'string' ? JSON.parse(question.options).join(', ') : ''}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
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