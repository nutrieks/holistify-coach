import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useMicronutrientSubmission, useMicronutrientQuestions, useMicronutrientAnswers } from "@/hooks/useMicronutrientSubmission";
import { useDraftSaving } from "@/hooks/useDraftSaving";
import { LoadingCard } from "@/components/LoadingCard";
import { FrequencyQuestion } from "./questions/FrequencyQuestion";
import { PortionQuestion } from "./questions/PortionQuestion";
import { SelectOneQuestion } from "./questions/SelectOneQuestion";
import { YesNoQuestion } from "./questions/YesNoQuestion";
import { MultiSelectQuestion } from "./questions/MultiSelectQuestion";
import { Input } from "@/components/ui/input";

interface MicronutrientQuestionnaireFormProps {
  clientId: string;
  onComplete?: () => void;
}

export const MicronutrientQuestionnaireForm = ({ clientId, onComplete }: MicronutrientQuestionnaireFormProps) => {
  const { submission, isLoading: submissionLoading, saveAnswer, submitFinal } = useMicronutrientSubmission(clientId);
  const { data: questions, isLoading: questionsLoading } = useMicronutrientQuestions(submission?.questionnaire_id);
  const { data: savedAnswers } = useMicronutrientAnswers(submission?.id);
  const { draftData, autoSave: saveDraftProgress, isLoadingDraft } = useDraftSaving(
    submission?.questionnaire_id || '', 
    clientId
  );

  // Enhanced state for pagination
  const QUESTIONS_PER_PAGE = 10
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Load saved answers
  useEffect(() => {
    if (savedAnswers) {
      const answersMap: Record<string, any> = {};
      savedAnswers.forEach(answer => {
        answersMap[answer.question_id] = answer.answer_value;
      });
      setAnswers(answersMap);
    }
  }, [savedAnswers]);

  // Load draft progress (current page)
  useEffect(() => {
    if (draftData?.current_question_index !== undefined && draftData.current_question_index !== null) {
      setCurrentPage(Math.floor(draftData.current_question_index / QUESTIONS_PER_PAGE));
    }
  }, [draftData]);

  if (submissionLoading || questionsLoading || isLoadingDraft) return <LoadingCard />;
  if (!questions || questions.length === 0) return null;

  // Skip logic: determine if a question should be shown
  const shouldShowQuestion = (question: any): boolean => {
    if (!question.skip_logic || !question.skip_logic.skip_if) return true;
    
    // Find parent question (usually previous question by order_index)
    const parentQuestion = questions.find(q => q.order_index === question.order_index - 1);
    if (!parentQuestion) return true;
    
    const parentAnswer = answers[parentQuestion.id];
    
    // If parent answer matches skip_if value, skip this question
    if (parentAnswer === question.skip_logic.skip_if) {
      return false;
    }
    
    return true;
  };

  // Filter visible questions based on skip logic
  const visibleQuestions = questions.filter(shouldShowQuestion);
  
  if (visibleQuestions.length === 0) return null;
  
  const totalPages = Math.ceil(visibleQuestions.length / QUESTIONS_PER_PAGE);
  const pageStart = currentPage * QUESTIONS_PER_PAGE;
  const pageEnd = Math.min(pageStart + QUESTIONS_PER_PAGE, visibleQuestions.length);
  const pageQuestions = visibleQuestions.slice(pageStart, pageEnd);
  
  const answeredCount = Object.keys(answers).filter(qId => 
    answers[qId] !== undefined && answers[qId] !== null
  ).length;
  const progress = (answeredCount / visibleQuestions.length) * 100;

  const handleAnswer = async (questionId: string, value: any) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    // Auto-save answer
    await saveAnswer.mutateAsync({
      questionId,
      answerValue: value
    });

    // Save draft progress (current page)
    await saveDraftProgress(newAnswers, currentPage * QUESTIONS_PER_PAGE);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      saveDraftProgress(answers, newPage * QUESTIONS_PER_PAGE);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      saveDraftProgress(answers, newPage * QUESTIONS_PER_PAGE);
    }
  };

  const handleSubmit = async () => {
    await submitFinal.mutateAsync();
    onComplete?.();
  };

  const isLastPage = currentPage === totalPages - 1;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mikronutritivna Dijagnostika</CardTitle>
              <CardDescription>
                Stranica {currentPage + 1} od {totalPages} • {answeredCount}/{visibleQuestions.length} odgovoreno
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Questions on current page */}
      <div className="space-y-4">
        {pageQuestions.map((question, idx) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      {question.question_code}
                    </Badge>
                    <Badge variant="outline">
                      {pageStart + idx + 1}/{visibleQuestions.length}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{question.question_text}</CardTitle>
                  {question.category && (
                    <CardDescription className="mt-2">
                      {question.category}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const currentAnswer = answers[question.id];
                const props = {
                  question,
                  value: currentAnswer,
                  onChange: (value: any) => handleAnswer(question.id, value)
                };

                switch (question.question_type) {
                  case 'frequency':
                    return <FrequencyQuestion {...props} />;
                  case 'portion':
                    return <PortionQuestion {...props} />;
                  case 'select_one':
                    return <SelectOneQuestion {...props} />;
                  case 'yes_no':
                    return <YesNoQuestion {...props} />;
                  case 'multi_select':
                    return <MultiSelectQuestion {...props} />;
                  case 'text':
                    return (
                      <Input
                        type="text"
                        value={currentAnswer || ''}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        placeholder="Unesite nazive dodataka odvojene zarezom"
                        className="w-full"
                      />
                    );
                  default:
                    return <div>Nepoznat tip pitanja: {question.question_type}</div>;
                }
              })()}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prethodna
            </Button>

            <div className="text-sm text-muted-foreground">
              Stranica {currentPage + 1} / {totalPages}
            </div>

            {isLastPage ? (
              <Button
                onClick={handleSubmit}
                disabled={submitFinal.isPending}
              >
                <Check className="mr-2 h-4 w-4" />
                Završi
              </Button>
            ) : (
              <Button onClick={handleNextPage}>
                Sljedeća
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
