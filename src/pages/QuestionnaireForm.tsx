import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { useNAQScoring } from "@/hooks/useNAQScoring"
import { useDraftSaving } from "@/hooks/useDraftSaving"


interface Question {
  id: string
  question_text: string
  question_type: string
  order_index: number | null
  options?: string | null
  section?: string | null
  category?: string | null
  conditional?: {
    show_if: string
    answer_equals?: string
    answer_not_equals?: string
  }
}

interface QuestionnaireData {
  id: string
  title: string
  description: string | null
  questions: Question[]
}

interface Answer {
  questionId: string
  value: any
}

export default function QuestionnaireForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { toast } = useToast()
  const { calculateAndStoreScores, isCalculating } = useNAQScoring()
  const {
    draftData,
    isLoadingDraft,
    autoSave,
    saveDraft,
    clearDraft,
    isSaving,
    lastSaved,
  } = useDraftSaving(id || '', profile?.id || '')

  // Enhanced state for better UX with pagination
  const QUESTIONS_PER_PAGE = 12
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentSection, setCurrentSection] = useState('')
  const [sectionsProgress, setSectionsProgress] = useState<Record<string, number>>({})

  // Load draft data when available
  useEffect(() => {
    if (draftData && !isLoadingDraft) {
      // Merge server draft with any existing local data
      const localStorageData = localStorage.getItem(`questionnaire-draft-${id}-${profile?.id}`)
      const localAnswers = localStorageData 
        ? (JSON.parse(localStorageData)?.answers || {})
        : {}
      
      // Server data takes priority - ensure it's an object
      const serverAnswers = (draftData.answers && typeof draftData.answers === 'object') 
        ? draftData.answers as Record<string, any>
        : {}
      
      const mergedAnswers = { ...localAnswers, ...serverAnswers }
      
      setAnswers(mergedAnswers)
      setCurrentPage(Math.floor((draftData.current_question_index || 0) / QUESTIONS_PER_PAGE))
      
      // Clear local storage since we now have server data
      localStorage.removeItem(`questionnaire-draft-${id}-${profile?.id}`)
    }
  }, [draftData, isLoadingDraft, id, profile?.id])

  // Auto-save functionality with debouncing
  useEffect(() => {
    if (!profile?.id || !id || Object.keys(answers).length === 0) return
    
    const timeoutId = setTimeout(() => {
      autoSave(answers, currentPage * QUESTIONS_PER_PAGE)
    }, 5000) // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(timeoutId)
  }, [answers, currentPage, autoSave, profile?.id, id])

  // Fetch questionnaire data
  const { data: questionnaire, isLoading, error } = useQuery({
    queryKey: ['questionnaire', id],
    queryFn: async () => {
      if (!id) throw new Error('No questionnaire ID')
      
      const { data: questionnaireData, error: questionnaireError } = await supabase
        .from('questionnaires')
        .select('id, title, description')
        .eq('id', id)
        .single()

      if (questionnaireError) throw questionnaireError

      const { data: questionsData, error: questionsError } = await supabase
        .from('questionnaire_questions')
        .select('*')
        .eq('questionnaire_id', id)
        .order('order_index', { ascending: true })

      if (questionsError) throw questionsError

      return {
        ...questionnaireData,
        questions: questionsData
      } as QuestionnaireData
    },
    enabled: !!id
  })

  // Track current section and calculate sections progress
  useEffect(() => {
    if (questionnaire?.questions && questionnaire.questions.length > 0) {
      const visibleQs = questionnaire.questions.filter(shouldShowQuestion)
      const pageStart = currentPage * QUESTIONS_PER_PAGE
      const currentQuestion = visibleQs[pageStart]
      if (currentQuestion?.section) {
        setCurrentSection(currentQuestion.section)
      }

      // Calculate progress for each section
      const sections: Record<string, { total: number; answered: number }> = {}
      
      questionnaire.questions.forEach((q) => {
        const sectionName = q.section || 'Općenito'
        if (!sections[sectionName]) {
          sections[sectionName] = { total: 0, answered: 0 }
        }
        sections[sectionName].total++
        
        if (answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '') {
          sections[sectionName].answered++
        }
      })

      const progress: Record<string, number> = {}
      Object.keys(sections).forEach(sectionName => {
        const section = sections[sectionName]
        progress[sectionName] = section.total > 0 ? (section.answered / section.total) * 100 : 0
      })

      setSectionsProgress(progress)
    }
  }, [questionnaire, currentPage, answers])

  // Check if questionnaire is assigned to client
  const { data: assignment, isLoading: assignmentLoading } = useQuery({
    queryKey: ['assignment', id, profile?.id],
    queryFn: async () => {
      if (!id || !profile?.id) return null
      
      const { data, error } = await supabase
        .from('assigned_questionnaires')
        .select('*')
        .eq('questionnaire_id', id)
        .eq('client_id', profile.id)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!id && !!profile?.id
  })

  // Check if already submitted
  const { data: existingSubmission } = useQuery({
    queryKey: ['submission', id, profile?.id],
    queryFn: async () => {
      if (!id || !profile?.id) return null
      
      const { data, error } = await supabase
        .from('client_submissions')
        .select('*')
        .eq('questionnaire_id', id)
        .eq('client_id', profile.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!id && !!profile?.id
  })

  // Submit answers
  const submitAnswers = useMutation({
    mutationFn: async (answersData: Record<string, any>) => {
      const { data: submission, error } = await supabase
        .from('client_submissions')
        .insert({
          client_id: profile?.id,
          questionnaire_id: id,
          answers: answersData
        })
        .select()
        .single()

      if (error) throw error
      return submission
    },
    onSuccess: async (submission) => {
      // Check if this is a NAQ questionnaire by checking if questionnaire title contains "NAQ"
      const isNAQ = questionnaire?.title?.toLowerCase().includes('naq') || false
      
      if (isNAQ && submission.id && questionnaire?.id && profile?.id) {
        // Convert answers to the format expected by NAQ scoring
        const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
          question_id: questionId,
          answer: String(answer)
        }))
        
        // Trigger NAQ scoring
        await calculateAndStoreScores({
          submissionId: submission.id,
          questionnaireId: questionnaire.id,
          clientId: profile.id,
          answers: answerArray
        })
      }
      
      // Check if this is Coaching Intake and process it
      if (questionnaire?.title === 'Inicijalni Coaching Upitnik' && submission.id) {
        try {
          console.log('Processing coaching intake submission:', submission.id)
          
          const { data, error } = await supabase.functions.invoke(
            'process-coaching-intake-submission',
            { body: { submission_id: submission.id } }
          )
          
          if (error) {
            console.error('Error processing coaching intake:', error)
            toast({
              title: "Upozorenje",
              description: "Upitnik je poslan, ali automatsko popunjavanje profila nije uspjelo.",
              variant: "default"
            })
          } else {
            console.log('Coaching intake processed successfully:', data)
            toast({
              title: "Profil ažuriran!",
              description: `Vaši podaci su automatski dodani u profil (${data.updatedFields?.length || 0} polja).`
            })
          }
        } catch (err) {
          console.error('Error calling submission handler:', err)
        }
      }
      
      toast({
        title: "Uspješno poslano!",
        description: isNAQ ? "Vaši odgovori su uspješno zabilježeni i analizirani." : "Vaši odgovori su uspješno zabilježeni."
      })
      navigate('/client')
    },
    onError: () => {
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom slanja odgovora.",
        variant: "destructive"
      })
    }
  })

  // Helper function for conditional logic
  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditional) return true
    
    const conditional = question.conditional
    const { show_if, answer_equals, answer_not_equals } = conditional
    
    const triggerAnswer = answers[show_if]
    
    if (answer_equals && triggerAnswer !== answer_equals) return false
    if (answer_not_equals && triggerAnswer === answer_not_equals) return false
    
    return true
  }

  const visibleQuestions = questionnaire?.questions.filter(shouldShowQuestion) || []
  const totalPages = Math.ceil(visibleQuestions.length / QUESTIONS_PER_PAGE)
  const pageStart = currentPage * QUESTIONS_PER_PAGE
  const pageEnd = Math.min(pageStart + QUESTIONS_PER_PAGE, visibleQuestions.length)
  const pageQuestions = visibleQuestions.slice(pageStart, pageEnd)
  
  const answeredCount = Object.keys(answers).filter(qId => 
    answers[qId] !== undefined && answers[qId] !== null && answers[qId] !== ''
  ).length
  const progress = visibleQuestions.length > 0 
    ? (answeredCount / visibleQuestions.length) * 100 
    : 0

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      saveDraft(answers, newPage * QUESTIONS_PER_PAGE)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      saveDraft(answers, newPage * QUESTIONS_PER_PAGE)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Clear draft when submitting
      await clearDraft()
      
      submitAnswers.mutate(answers)
    } catch (error) {
      console.error('Error clearing draft:', error)
      // Continue with submission even if draft clearing fails
      submitAnswers.mutate(answers)
    }
  }

  const handleSaveDraft = async () => {
    if (id && profile?.id) {
      await saveDraft(answers, currentPage * QUESTIONS_PER_PAGE)
    }
  }

  const isProcessing = isSubmitting || isCalculating

  if (isLoading || isLoadingDraft || assignmentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Učitavam upitnik...</div>
      </div>
    )
  }

  // Check if questionnaire is assigned
  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">Upitnik vam nije dodijeljen.</p>
              <p className="text-sm text-muted-foreground mb-4">
                Kontaktirajte svog savjetnika za pristup ovom upitniku.
              </p>
              <Button onClick={() => navigate('/client')}>
                Vrati se na početnu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !questionnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">Upitnik nije pronađen ili nemate dozvolu pristupa.</p>
              <Button onClick={() => navigate('/client')}>
                Vrati se na početnu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (existingSubmission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Već ste ispunili ovaj upitnik</h3>
              <p className="text-muted-foreground mb-4">
                Vaši odgovori su zabilježeni {new Date(existingSubmission.created_at).toLocaleDateString('hr-HR')}
              </p>
              <Button onClick={() => navigate('/client')}>
                Vrati se na početnu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!questionnaire.questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Ovaj upitnik nema pitanja.</p>
              <Button onClick={() => navigate('/client')}>
                Vrati se na početnu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderQuestionInput = (question: Question) => {
    const currentAnswer = answers[question.id]

    switch (question.question_type) {
      case 'frequency_0_3':
      case 'symptom_0_3':
      case 'scale_0_3':
        const colors = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(142 71% 45%)', 'hsl(var(--destructive))']
        const defaultOptions = question.question_type === 'frequency_0_3' 
          ? ["Ne konzumiram", "2-3 puta mjesečno", "Tjedno", "Dnevno"]
          : ["Ne, simptom se ne javlja", "Da, manji ili blagi simptom (mjesečno)", "Umjeren simptom (tjedno)", "Ozbiljan simptom (dnevno)"]
        
        let options: string[] = defaultOptions
        if (question.options) {
          if (typeof question.options === 'string') {
            try {
              options = JSON.parse(question.options)
            } catch {
              options = defaultOptions
            }
          } else if (Array.isArray(question.options)) {
            options = question.options
          }
        }
        
        return (
          <div className="space-y-3">
            {options.map((option: string, index: number) => (
              <div 
                key={index} 
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                  currentAnswer === String(index) ? 'border-primary bg-primary/5 shadow-sm' : 'border-muted hover:border-primary/30'
                }`}
                onClick={() => handleAnswerChange(question.id, String(index))}
              >
                <div 
                  className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm" 
                  style={{ backgroundColor: colors[index] }}
                />
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={String(index)}
                  checked={currentAnswer === String(index)}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                <Label className="text-sm font-normal cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'yes_no':
        return (
          <div className="flex gap-3">
            <Button 
              type="button"
              size="lg"
              variant={currentAnswer === "0" ? "default" : "outline"}
              onClick={() => handleAnswerChange(question.id, "0")}
              className="flex-1"
            >
              Ne
            </Button>
            <Button 
              type="button"
              size="lg"
              variant={currentAnswer === "1" ? "default" : "outline"}
              onClick={() => handleAnswerChange(question.id, "1")}
              className="flex-1"
            >
              Da
            </Button>
          </div>
        )

      case 'email':
        return (
          <Input
            type="email"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="primjer@email.com"
            className="w-full"
          />
        )

      case 'date':
        return (
          <Input
            type="date"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full"
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Unesite broj..."
            className="w-full"
          />
        )

      case 'phone':
        return (
          <Input
            type="tel"
            inputMode="tel"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="+385 xx xxx xxxx"
            className="w-full"
          />
        )

      case 'short_text':
        return (
          <Input
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Unesite vaš odgovor..."
            className="w-full"
          />
        )

      case 'long_text':
        return (
          <Textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Unesite detaljni odgovor..."
            className="w-full min-h-[120px]"
          />
        )

      case 'multiple_choice':
        if (!question.options) return null
        
        // Handle both string and array formats for options
        let multipleChoiceOptions: string[] = []
        if (typeof question.options === 'string') {
          try {
            multipleChoiceOptions = JSON.parse(question.options)
          } catch {
            multipleChoiceOptions = [question.options]
          }
        } else if (Array.isArray(question.options)) {
          multipleChoiceOptions = question.options
        }
        
        return (
          <div className="space-y-3">
            {multipleChoiceOptions.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                <Label className="text-sm font-normal cursor-pointer" onClick={() => handleAnswerChange(question.id, option)}>
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'checkbox':
        if (!question.options) return null
        
        // Handle both string and array formats for checkbox options
        let checkboxOpts: string[] = []
        if (typeof question.options === 'string') {
          try {
            checkboxOpts = JSON.parse(question.options)
          } catch {
            checkboxOpts = [question.options]
          }
        } else if (Array.isArray(question.options)) {
          checkboxOpts = question.options
        }
        
        const selectedOptions = currentAnswer || []
        return (
          <div className="space-y-3">
            {checkboxOpts.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswerChange(question.id, [...selectedOptions, option])
                    } else {
                      handleAnswerChange(question.id, selectedOptions.filter((o: string) => o !== option))
                    }
                  }}
                />
                <Label className="text-sm font-normal">{option}</Label>
              </div>
            ))}
          </div>
        )

      case 'scale_1_10':
        return (
          <div className="space-y-4">
            <Slider
              min={1}
              max={10}
              step={1}
              value={[currentAnswer || 5]}
              onValueChange={(value) => handleAnswerChange(question.id, value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1</span>
              <span className="font-medium">Trenutno: {currentAnswer || 5}</span>
              <span>10</span>
            </div>
          </div>
        )

      default:
        return <p className="text-muted-foreground">Nepoznat tip pitanja</p>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{questionnaire.title}</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/client')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Nazad
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Overall Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Stranica {currentPage + 1} od {totalPages}
              {lastSaved && (
                <span className="ml-4 text-xs text-green-600">
                  • Zadnje spremljeno: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </span>
            <span className="text-sm text-muted-foreground">
              {answeredCount}/{visibleQuestions.length} odgovoreno ({Math.round(progress)}%)
            </span>
          </div>
          <Progress value={progress} className="w-full mb-4" />
          
          {/* Section Progress */}
          {currentSection && (
            <div className="mb-4">
              <Badge variant="secondary" className="mb-2">
                Sekcija: {currentSection}
              </Badge>
              {sectionsProgress[currentSection] !== undefined && (
                <div className="text-sm text-muted-foreground">
                  Napredak u sekciji: {Math.round(sectionsProgress[currentSection])}%
                </div>
              )}
            </div>
          )}
        </div>

        {/* Questions on current page */}
        <div className="space-y-6 mb-6">
          {pageQuestions.map((question, idx) => (
            <Card key={question.id} className="w-full max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">
                    Pitanje {pageStart + idx + 1}/{visibleQuestions.length}
                  </Badge>
                  {question.section && (
                    <Badge variant="secondary">{question.section}</Badge>
                  )}
                </div>
                <CardTitle className="text-lg leading-relaxed">
                  {question.question_text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderQuestionInput(question)}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Prethodna stranica
              </Button>

              <div className="flex gap-2">
                {Object.keys(answers).length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Sprema se...' : 'Spremi i nastavi kasnije'}
                  </Button>
                )}
                
                {currentPage === totalPages - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="min-w-[120px]"
                  >
                    {isCalculating ? 'Analizira se...' : isSubmitting ? 'Šalje se...' : 'Završi'}
                  </Button>
                ) : (
                  <Button onClick={goToNextPage}>
                    Sljedeća stranica
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}