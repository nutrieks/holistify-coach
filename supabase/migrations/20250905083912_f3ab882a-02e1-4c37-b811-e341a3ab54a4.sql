-- Create questionnaire_drafts table for server-side draft saving
CREATE TABLE public.questionnaire_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  questionnaire_id UUID NOT NULL,
  answers JSONB DEFAULT '{}',
  current_question_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, questionnaire_id)
);

-- Enable RLS
ALTER TABLE public.questionnaire_drafts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Clients can manage their own drafts" 
ON public.questionnaire_drafts 
FOR ALL 
USING (client_id = auth.uid());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_questionnaire_drafts_updated_at
BEFORE UPDATE ON public.questionnaire_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();