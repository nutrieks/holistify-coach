-- Create enum for questionnaire assignment status
CREATE TYPE questionnaire_status AS ENUM ('sent', 'viewed', 'completed');

-- Create assigned_questionnaires table
CREATE TABLE public.assigned_questionnaires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  status questionnaire_status NOT NULL DEFAULT 'sent',
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  follow_up_questions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assigned_questionnaires ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage assigned questionnaires"
  ON public.assigned_questionnaires
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their assigned questionnaires"
  ON public.assigned_questionnaires
  FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can update status of their assigned questionnaires"
  ON public.assigned_questionnaires
  FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- Create trigger for updated_at
CREATE TRIGGER update_assigned_questionnaires_updated_at
  BEFORE UPDATE ON public.assigned_questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_assigned_questionnaires_client_id ON public.assigned_questionnaires(client_id);
CREATE INDEX idx_assigned_questionnaires_status ON public.assigned_questionnaires(status);