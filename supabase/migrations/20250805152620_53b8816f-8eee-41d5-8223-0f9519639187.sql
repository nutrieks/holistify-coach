-- Add initial questionnaire assignment to clients table
ALTER TABLE public.clients 
ADD COLUMN initial_questionnaire_id uuid REFERENCES public.questionnaires(id) ON DELETE SET NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.clients.initial_questionnaire_id IS 'Optional initial questionnaire assigned to client when added';

-- Add options field to questionnaire_questions for multiple choice and checkbox questions
ALTER TABLE public.questionnaire_questions 
ADD COLUMN options jsonb DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_questions.options IS 'JSON array of options for multiple choice and checkbox type questions';

-- Create index for better performance on questionnaire lookups
CREATE INDEX idx_clients_initial_questionnaire_id ON public.clients(initial_questionnaire_id);
CREATE INDEX idx_client_submissions_client_questionnaire ON public.client_submissions(client_id, questionnaire_id);

-- Update RLS policies to account for new column
-- The existing policies should already cover this, but let's ensure access through the new relationship