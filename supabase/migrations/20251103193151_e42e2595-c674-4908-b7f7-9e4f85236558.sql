-- FAZA 1: MIKRONUTRITIVNA DIJAGNOSTIKA - DATABASE SETUP (CORRECTED)

-- 1.1 Tablica: micronutrient_questionnaires
CREATE TABLE micronutrient_questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Mikronutritivna Dijagnostika v2',
  description TEXT DEFAULT 'Procjena rizika deficita 27 mikronutrijenata',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies for micronutrient_questionnaires
ALTER TABLE micronutrient_questionnaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage micronutrient questionnaires"
  ON micronutrient_questionnaires FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view active questionnaires"
  ON micronutrient_questionnaires FOR SELECT
  USING (is_active = true);

-- 1.2 Tablica: micronutrient_questions
CREATE TABLE micronutrient_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID REFERENCES micronutrient_questionnaires(id) ON DELETE CASCADE NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('A', 'B', 'C')),
  category TEXT NOT NULL,
  question_code TEXT NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('frequency', 'portion', 'yes_no', 'select_one', 'multi_select', 'text', 'number')),
  options JSONB,
  order_index INTEGER NOT NULL,
  parent_question_id UUID REFERENCES micronutrient_questions(id) ON DELETE CASCADE,
  skip_logic JSONB,
  nutrient_relevance JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_micro_q_questionnaire ON micronutrient_questions(questionnaire_id);
CREATE INDEX idx_micro_q_section ON micronutrient_questions(section);
CREATE INDEX idx_micro_q_parent ON micronutrient_questions(parent_question_id);
CREATE INDEX idx_micro_q_order ON micronutrient_questions(order_index);
CREATE INDEX idx_micro_q_code ON micronutrient_questions(question_code);

-- RLS policies for micronutrient_questions
ALTER TABLE micronutrient_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view questions"
  ON micronutrient_questions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage questions"
  ON micronutrient_questions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 1.3 Tablica: client_micronutrient_submissions
CREATE TABLE client_micronutrient_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  questionnaire_id UUID REFERENCES micronutrient_questionnaires(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_micro_sub_client ON client_micronutrient_submissions(client_id);
CREATE INDEX idx_micro_sub_status ON client_micronutrient_submissions(status);
CREATE INDEX idx_micro_sub_questionnaire ON client_micronutrient_submissions(questionnaire_id);

-- RLS policies for client_micronutrient_submissions
ALTER TABLE client_micronutrient_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can manage their submissions"
  ON client_micronutrient_submissions FOR ALL
  USING (auth.uid() = client_id);

CREATE POLICY "Admins can view all submissions"
  ON client_micronutrient_submissions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 1.4 Tablica: client_micronutrient_answers
CREATE TABLE client_micronutrient_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES client_micronutrient_submissions(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES micronutrient_questions(id) ON DELETE CASCADE NOT NULL,
  answer_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(submission_id, question_id)
);

CREATE INDEX idx_micro_ans_submission ON client_micronutrient_answers(submission_id);
CREATE INDEX idx_micro_ans_question ON client_micronutrient_answers(question_id);

-- RLS policies for client_micronutrient_answers
ALTER TABLE client_micronutrient_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can manage their answers"
  ON client_micronutrient_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM client_micronutrient_submissions
      WHERE id = submission_id AND client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all answers"
  ON client_micronutrient_answers FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 1.5 Tablica: client_micronutrient_results
CREATE TABLE client_micronutrient_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES client_micronutrient_submissions(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  nutrient_name TEXT NOT NULL,
  nutrient_code TEXT NOT NULL,
  intake_score_percentage DECIMAL(5,2),
  symptom_score_percentage DECIMAL(5,2),
  risk_score_percentage DECIMAL(5,2),
  final_weighted_score DECIMAL(5,2),
  risk_category TEXT NOT NULL CHECK (risk_category IN ('high', 'moderate', 'low', 'none')),
  contributing_factors JSONB DEFAULT '[]',
  calculated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_micro_res_submission ON client_micronutrient_results(submission_id);
CREATE INDEX idx_micro_res_client ON client_micronutrient_results(client_id);
CREATE INDEX idx_micro_res_category ON client_micronutrient_results(risk_category);
CREATE INDEX idx_micro_res_nutrient ON client_micronutrient_results(nutrient_code);

-- RLS policies for client_micronutrient_results
ALTER TABLE client_micronutrient_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their results"
  ON client_micronutrient_results FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Admins can view all results"
  ON client_micronutrient_results FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 1.6 Proširenje postojeće tablice assigned_questionnaires
ALTER TABLE assigned_questionnaires 
ADD COLUMN IF NOT EXISTS questionnaire_type TEXT DEFAULT 'general' 
CHECK (questionnaire_type IN ('general', 'naq', 'micronutrient_assessment', 'coaching_intake'));

-- Add index for questionnaire_type
CREATE INDEX IF NOT EXISTS idx_assigned_q_type ON assigned_questionnaires(questionnaire_type);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_micronutrient_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_micro_submissions_updated_at
  BEFORE UPDATE ON client_micronutrient_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_micronutrient_updated_at();

CREATE TRIGGER update_micro_answers_updated_at
  BEFORE UPDATE ON client_micronutrient_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_micronutrient_updated_at();

CREATE TRIGGER update_micro_questionnaires_updated_at
  BEFORE UPDATE ON micronutrient_questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION update_micronutrient_updated_at();