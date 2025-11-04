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

  const [currentIndex, setCurrentIndex] = useState(0);
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

  // Load draft progress (current question index)
  useEffect(() => {
    if (draftData?.current_question_index !== undefined && draftData.current_question_index !== null) {
      setCurrentIndex(draftData.current_question_index);
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
  
  const currentQuestion = visibleQuestions[currentIndex];
  const progress = ((currentIndex + 1) / visibleQuestions.length) * 100;
  const currentAnswer = answers[currentQuestion.id];

  const handleAnswer = async (value: any) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    // Auto-save answer
    await saveAnswer.mutateAsync({
      questionId: currentQuestion.id,
      answerValue: value
    });

    // Save draft progress (current question index)
    await saveDraftProgress(newAnswers, currentIndex);
  };

  const handleNext = () => {
    if (currentIndex < visibleQuestions.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      saveDraftProgress(answers, newIndex);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      saveDraftProgress(answers, newIndex);
    }
  };

  const handleSubmit = async () => {
    await submitFinal.mutateAsync();
    onComplete?.();
  };

  const isAnswered = currentAnswer !== undefined && currentAnswer !== null && 
    (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : true);
  const isLastQuestion = currentIndex === visibleQuestions.length - 1;

  // Group questions by section for navigation
  const sections = Array.from(new Set(visibleQuestions.map(q => q.section)));
  const currentSection = currentQuestion.section;

  const renderQuestion = () => {
    const props = {
      question: currentQuestion,
      value: currentAnswer,
      onChange: handleAnswer
    };

    switch (currentQuestion.question_type) {
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
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Unesite nazive dodataka odvojene zarezom"
            className="w-full"
          />
        );
      default:
        return <div>Nepoznat tip pitanja: {currentQuestion.question_type}</div>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mikronutritivna Dijagnostika</CardTitle>
              <CardDescription>
                Pitanje {currentIndex + 1} od {visibleQuestions.length}
              </CardDescription>
            </div>
            <Badge variant="outline">{currentSection}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="h-2" />

          <div className="flex gap-1 flex-wrap">
            {sections.map((section) => {
              const sectionQuestions = visibleQuestions.filter(q => q.section === section);
              const answeredInSection = sectionQuestions.filter(q => answers[q.id] !== undefined).length;
              return (
                <Badge
                  key={section}
                  variant={section === currentSection ? "default" : "outline"}
                  className="text-xs"
                >
                  {section}: {answeredInSection}/{sectionQuestions.length}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Badge variant="secondary" className="mb-2">
                {currentQuestion.question_code}
              </Badge>
              <CardTitle className="text-lg">{currentQuestion.question_text}</CardTitle>
              {currentQuestion.category && (
                <CardDescription className="mt-2">
                  Kategorija: {currentQuestion.category}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderQuestion()}

          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prethodno
            </Button>

            <div className="text-sm text-muted-foreground">
              {Object.keys(answers).length} / {visibleQuestions.length} odgovoreno
            </div>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={!isAnswered || submitFinal.isPending}
              >
                <Check className="mr-2 h-4 w-4" />
                Završi
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isAnswered}
              >
                Sljedeće
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
