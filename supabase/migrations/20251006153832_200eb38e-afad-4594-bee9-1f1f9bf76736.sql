-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  height NUMERIC,
  starting_weight NUMERIC,
  contract_start_date DATE,
  contract_end_date DATE,
  sessions_remaining INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all clients" ON public.clients
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert clients" ON public.clients
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update clients" ON public.clients
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their own data" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create questionnaires table
CREATE TABLE public.questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  questionnaire_type TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active questionnaires" ON public.questionnaires
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage questionnaires" ON public.questionnaires
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_questionnaires_updated_at
  BEFORE UPDATE ON public.questionnaires
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create questionnaire_questions table
CREATE TABLE public.questionnaire_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID REFERENCES public.questionnaires(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'text',
  options JSONB,
  category TEXT,
  section TEXT,
  order_index INTEGER,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.questionnaire_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view questions" ON public.questionnaire_questions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage questions" ON public.questionnaire_questions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create client_submissions table
CREATE TABLE public.client_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(user_id) ON DELETE CASCADE NOT NULL,
  questionnaire_id UUID REFERENCES public.questionnaires(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.client_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all submissions" ON public.client_submissions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their submissions" ON public.client_submissions
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert their submissions" ON public.client_submissions
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Create questionnaire_drafts table
CREATE TABLE public.questionnaire_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(user_id) ON DELETE CASCADE NOT NULL,
  questionnaire_id UUID REFERENCES public.questionnaires(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL,
  current_question_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, questionnaire_id)
);

ALTER TABLE public.questionnaire_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can manage their drafts" ON public.questionnaire_drafts
  FOR ALL USING (auth.uid() = client_id);

CREATE TRIGGER update_drafts_updated_at
  BEFORE UPDATE ON public.questionnaire_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create questionnaire_scores table
CREATE TABLE public.questionnaire_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.client_submissions(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  score NUMERIC NOT NULL,
  max_score NUMERIC NOT NULL,
  percentage NUMERIC,
  severity_level TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.questionnaire_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all scores" ON public.questionnaire_scores
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their scores" ON public.questionnaire_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.client_submissions cs
      WHERE cs.id = submission_id AND cs.client_id = auth.uid()
    )
  );

-- Create food_categories table
CREATE TABLE public.food_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT NOT NULL UNIQUE,
  standard_portion_size TEXT,
  avg_calories NUMERIC,
  avg_protein NUMERIC,
  avg_carbs NUMERIC,
  avg_fats NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view food categories" ON public.food_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage food categories" ON public.food_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_food_categories_updated_at
  BEFORE UPDATE ON public.food_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create food_database table
CREATE TABLE public.food_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.food_categories(id),
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fats NUMERIC NOT NULL,
  portion_size TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view food database" ON public.food_database
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage food database" ON public.food_database
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_food_database_updated_at
  BEFORE UPDATE ON public.food_database
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  total_calories NUMERIC,
  total_protein NUMERIC,
  total_carbs NUMERIC,
  total_fats NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view recipes" ON public.recipes
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage recipes" ON public.recipes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create recipe_ingredients table
CREATE TABLE public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES public.food_database(id) ON DELETE CASCADE NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view recipe ingredients" ON public.recipe_ingredients
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage recipe ingredients" ON public.recipe_ingredients
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create meal_plans table
CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(user_id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  daily_calories_target NUMERIC,
  daily_protein_target NUMERIC,
  daily_carbs_target NUMERIC,
  daily_fats_target NUMERIC,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all meal plans" ON public.meal_plans
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage meal plans" ON public.meal_plans
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their meal plans" ON public.meal_plans
  FOR SELECT USING (auth.uid() = client_id);

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create meal_plan_entries table
CREATE TABLE public.meal_plan_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  meal_type TEXT NOT NULL,
  food_id UUID REFERENCES public.food_database(id),
  recipe_id UUID REFERENCES public.recipes(id),
  quantity NUMERIC NOT NULL,
  unit TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK ((food_id IS NOT NULL AND recipe_id IS NULL) OR (food_id IS NULL AND recipe_id IS NOT NULL))
);

ALTER TABLE public.meal_plan_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all meal entries" ON public.meal_plan_entries
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage meal entries" ON public.meal_plan_entries
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their meal entries" ON public.meal_plan_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans mp
      WHERE mp.id = meal_plan_id AND mp.client_id = auth.uid()
    )
  );

-- Create exercise_database table
CREATE TABLE public.exercise_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  muscle_group TEXT NOT NULL,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.exercise_database ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view exercises" ON public.exercise_database
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage exercises" ON public.exercise_database
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_exercise_database_updated_at
  BEFORE UPDATE ON public.exercise_database
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create training_plans table
CREATE TABLE public.training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(user_id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all training plans" ON public.training_plans
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage training plans" ON public.training_plans
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their training plans" ON public.training_plans
  FOR SELECT USING (auth.uid() = client_id);

CREATE TRIGGER update_training_plans_updated_at
  BEFORE UPDATE ON public.training_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create workout_sessions table
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_plan_id UUID REFERENCES public.training_plans(id) ON DELETE CASCADE NOT NULL,
  session_name TEXT NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  exercises JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all workout sessions" ON public.workout_sessions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage workout sessions" ON public.workout_sessions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their workout sessions" ON public.workout_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.training_plans tp
      WHERE tp.id = training_plan_id AND tp.client_id = auth.uid()
    )
  );

CREATE TRIGGER update_workout_sessions_updated_at
  BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create habits table
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view habits" ON public.habits
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage habits" ON public.habits
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create client_habits table
CREATE TABLE public.client_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(user_id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, habit_id)
);

ALTER TABLE public.client_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all client habits" ON public.client_habits
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage client habits" ON public.client_habits
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their habits" ON public.client_habits
  FOR SELECT USING (auth.uid() = client_id);

-- Create progress_tracking table
CREATE TABLE public.progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(user_id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  metric_type TEXT NOT NULL,
  value TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, date, metric_type)
);

ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all progress" ON public.progress_tracking
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage progress" ON public.progress_tracking
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their progress" ON public.progress_tracking
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert their progress" ON public.progress_tracking
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" ON public.chat_messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Create user_presence table
CREATE TABLE public.user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'offline',
  last_seen TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view presence" ON public.user_presence
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their presence" ON public.user_presence
  FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_user_presence_updated_at
  BEFORE UPDATE ON public.user_presence
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();