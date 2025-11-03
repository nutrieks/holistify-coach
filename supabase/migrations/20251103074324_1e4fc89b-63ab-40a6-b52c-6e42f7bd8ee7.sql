-- Add subjective insulin sensitivity questionnaire column to biochemical data
ALTER TABLE client_biochemical_data 
ADD COLUMN IF NOT EXISTS subjective_insulin_questionnaire jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN client_biochemical_data.subjective_insulin_questionnaire 
IS 'Stores the 10-question subjective insulin sensitivity assessment with scores and ratings';