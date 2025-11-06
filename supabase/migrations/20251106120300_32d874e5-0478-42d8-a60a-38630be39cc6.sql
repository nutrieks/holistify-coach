-- Add assignment capability to micronutrient questionnaires
ALTER TABLE micronutrient_questionnaires 
ADD COLUMN requires_assignment BOOLEAN DEFAULT false;

-- Create assigned micronutrient questionnaires table
CREATE TABLE assigned_micronutrient_questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questionnaire_id UUID NOT NULL REFERENCES micronutrient_questionnaires(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'viewed', 'in_progress', 'completed')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(client_id, questionnaire_id)
);

-- Enable RLS
ALTER TABLE assigned_micronutrient_questionnaires ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assigned_micronutrient_questionnaires
CREATE POLICY "Admins can manage assigned micronutrient questionnaires"
  ON assigned_micronutrient_questionnaires
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their assigned micronutrient questionnaires"
  ON assigned_micronutrient_questionnaires
  FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can update status of their assigned micronutrient questionnaires"
  ON assigned_micronutrient_questionnaires
  FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- Create trigger for updated_at
CREATE TRIGGER update_assigned_micronutrient_questionnaires_updated_at
  BEFORE UPDATE ON assigned_micronutrient_questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION update_micronutrient_updated_at();

-- Add index for performance
CREATE INDEX idx_assigned_micronutrient_questionnaires_client 
  ON assigned_micronutrient_questionnaires(client_id);

CREATE INDEX idx_assigned_micronutrient_questionnaires_status 
  ON assigned_micronutrient_questionnaires(status);