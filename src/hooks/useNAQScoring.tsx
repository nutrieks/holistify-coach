import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NAQScoringEngine, NAQResults } from "@/utils/naqScoringEngine";
import { useToast } from "@/hooks/use-toast";

interface Answer {
  question_id: string;
  answer: string;
}

export function useNAQScoring() {
  const { toast } = useToast();

  const calculateAndStoreScores = useMutation({
    mutationFn: async ({
      submissionId,
      questionnaireId,
      clientId,
      answers
    }: {
      submissionId: string;
      questionnaireId: string;
      clientId: string;
      answers: Answer[];
    }) => {
      // First, get the questionnaire questions with their scoring info
      const { data: questions, error: questionsError } = await supabase
        .from('questionnaire_questions')
        .select('id, section, category')
        .eq('questionnaire_id', questionnaireId);

      if (questionsError) throw questionsError;

      // Convert answers to scoring format
      const scoringAnswers: Record<string, number> = {};
      
      answers.forEach(answer => {
        const question = questions?.find(q => q.id === answer.question_id);
        if (question && question.category) {
          const answerValue = parseInt(answer.answer) || 0;
          const key = `${question.category}_${question.id}`;
          scoringAnswers[key] = answerValue;
        }
      });

      // Calculate NAQ results
      const results = NAQScoringEngine.calculateOverallResults(scoringAnswers);

      // Store scores in database - map to actual DB schema
      const scoresToInsert = results.scores.map(score => ({
        submission_id: submissionId,
        category: score.sectionName,
        score: score.totalScore,
        max_score: score.maxPossibleScore,
        percentage: score.symptomBurden * 100,
        severity_level: score.priorityLevel
      }));

      const { error: insertError } = await supabase
        .from('questionnaire_scores')
        .insert(scoresToInsert);

      if (insertError) throw insertError;

      return results;
    },
    onSuccess: () => {
      toast({
        title: "Rezultati izračunati",
        description: "NAQ rezultati su uspješno izračunati i sačuvani.",
      });
    },
    onError: (error) => {
      toast({
        title: "Greška",
        description: "Došlo je do greške pri izračunu rezultata.",
        variant: "destructive",
      });
      console.error('NAQ scoring error:', error);
    }
  });

  return {
    calculateAndStoreScores: calculateAndStoreScores.mutate,
    isCalculating: calculateAndStoreScores.isPending
  };
}

export function useNAQResults(submissionId: string) {
  return useQuery({
    queryKey: ['naq-results', submissionId],
    queryFn: async () => {
      const { data: scores, error } = await supabase
        .from('questionnaire_scores')
        .select('*')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!scores || scores.length === 0) {
        return null;
      }

      // Convert database scores back to NAQResults format
      const naqScores = scores.map(score => ({
        sectionName: score.category,
        totalScore: score.score,
        maxPossibleScore: score.max_score,
        symptomBurden: Number(score.percentage) / 100,
        priorityLevel: score.severity_level as 'low' | 'medium' | 'high'
      }));

      // Calculate overall burden
      const totalQuestions = naqScores.reduce((sum, score) => sum + (score.maxPossibleScore / 3), 0);
      const totalScore = naqScores.reduce((sum, score) => sum + score.totalScore, 0);
      const overallBurden = totalScore / totalQuestions;

      // Generate recommendations
      const primaryConcerns = naqScores.filter(score => score.priorityLevel === 'high');
      const hierarchyRecommendations = NAQScoringEngine['generateHierarchyRecommendations'] 
        ? (NAQScoringEngine as any).generateHierarchyRecommendations(naqScores)
        : [];

      const results: NAQResults = {
        scores: naqScores,
        overallBurden: Math.round(overallBurden * 100) / 100,
        primaryConcerns,
        hierarchyRecommendations
      };

      return results;
    },
    enabled: !!submissionId
  });
}

export function useClientNAQHistory(clientId: string) {
  return useQuery({
    queryKey: ['client-naq-history', clientId],
    queryFn: async () => {
      // Get submissions with scores
      const { data: submissions, error: submissionsError } = await supabase
        .from('client_submissions')
        .select('id, created_at, submitted_at, questionnaire_id')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (submissionsError) throw submissionsError;

      const results = [];
      for (const submission of submissions || []) {
        // Get scores for this submission
        const { data: scores } = await supabase
          .from('questionnaire_scores')
          .select('*')
          .eq('submission_id', submission.id);

        if (scores && scores.length > 0) {
          const { data: questionnaire } = await supabase
            .from('questionnaires')
            .select('title')
            .eq('id', submission.questionnaire_id)
            .single();

          results.push({
            submissionId: submission.id,
            submissionDate: submission.submitted_at || submission.created_at,
            questionnaireName: questionnaire?.title || 'NAQ Upitnik',
            scores: scores.map(score => ({
              sectionName: score.category,
              totalScore: score.score,
              maxPossibleScore: score.max_score,
              symptomBurden: Number(score.percentage) / 100,
              priorityLevel: score.severity_level as 'low' | 'medium' | 'high'
            }))
          });
        }
      }

      return results;
    },
    enabled: !!clientId
  });
}
