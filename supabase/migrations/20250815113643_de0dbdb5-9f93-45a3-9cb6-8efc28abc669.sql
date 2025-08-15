-- Add new columns to questionnaire_questions for NAQ scoring system
ALTER TABLE public.questionnaire_questions 
ADD COLUMN scoring_weight INTEGER DEFAULT 0,
ADD COLUMN scoring_category TEXT,
ADD COLUMN section_name TEXT;

-- Add is_default_questionnaire flag to questionnaires table
ALTER TABLE public.questionnaires 
ADD COLUMN is_default_questionnaire BOOLEAN DEFAULT FALSE;

-- Create questionnaire_scores table for storing calculated NAQ results
CREATE TABLE public.questionnaire_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  questionnaire_id UUID NOT NULL,
  submission_id UUID NOT NULL,
  section_name TEXT NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 0,
  max_possible_score INTEGER NOT NULL DEFAULT 0,
  symptom_burden DECIMAL(5,2) NOT NULL DEFAULT 0,
  priority_level TEXT NOT NULL CHECK (priority_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on questionnaire_scores
ALTER TABLE public.questionnaire_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for questionnaire_scores
CREATE POLICY "Clients can view their scores" 
ON public.questionnaire_scores 
FOR SELECT 
USING (client_id = auth.uid());

CREATE POLICY "Coaches can view client scores" 
ON public.questionnaire_scores 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM clients 
  WHERE clients.client_id = questionnaire_scores.client_id 
  AND clients.coach_id = auth.uid()
));

CREATE POLICY "System can insert scores" 
ON public.questionnaire_scores 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_questionnaire_scores_updated_at
BEFORE UPDATE ON public.questionnaire_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();