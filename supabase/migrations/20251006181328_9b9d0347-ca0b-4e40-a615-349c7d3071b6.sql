-- Add new columns to meal_plans
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS view_mode text DEFAULT 'weekly' CHECK (view_mode IN ('monthly', 'weekly', 'daily'));
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS training_integration boolean DEFAULT false;

-- Add new columns to meal_plan_entries
ALTER TABLE meal_plan_entries ADD COLUMN IF NOT EXISTS scheduled_time time;
ALTER TABLE meal_plan_entries ADD COLUMN IF NOT EXISTS meal_gradient_color text;

-- Create training_sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id uuid NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  training_type text NOT NULL,
  scheduled_time time NOT NULL,
  duration_minutes integer NOT NULL,
  intensity text NOT NULL CHECK (intensity IN ('low', 'medium', 'high')),
  pre_workout_notes text,
  during_workout_notes text,
  post_workout_notes text,
  gradient_color text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create daily_training_types table
CREATE TABLE IF NOT EXISTS daily_training_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id uuid NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  training_day_type text NOT NULL CHECK (training_day_type IN ('no_training', 'light_training', 'moderate_training', 'heavy_training')),
  macro_adjustment jsonb DEFAULT '{"calories": 0, "protein": 0, "carbs": 0, "fats": 0}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(meal_plan_id, day_of_week)
);

-- Enable RLS
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_training_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training_sessions
CREATE POLICY "Admins can manage training sessions"
  ON training_sessions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their training sessions"
  ON training_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans mp
      WHERE mp.id = training_sessions.meal_plan_id
      AND mp.client_id = auth.uid()
    )
  );

-- RLS Policies for daily_training_types
CREATE POLICY "Admins can manage daily training types"
  ON daily_training_types FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their daily training types"
  ON daily_training_types FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans mp
      WHERE mp.id = daily_training_types.meal_plan_id
      AND mp.client_id = auth.uid()
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_training_sessions_updated_at
  BEFORE UPDATE ON training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_training_types_updated_at
  BEFORE UPDATE ON daily_training_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();