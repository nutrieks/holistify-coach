-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role app_role NOT NULL DEFAULT 'client',
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create clients table (connects clients with coaches)
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(coach_id, client_id)
);

-- Create food database
CREATE TABLE public.food_database (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  calories DECIMAL(8,2),
  protein DECIMAL(8,2),
  carbs DECIMAL(8,2),
  fat DECIMAL(8,2),
  fiber DECIMAL(8,2),
  serving_size_grams DECIMAL(8,2),
  unit TEXT DEFAULT 'g' CHECK (unit IN ('g', 'ml', 'kom')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  instructions TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create recipe ingredients (many-to-many between recipes and food)
CREATE TABLE public.recipe_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES public.food_database(id) ON DELETE CASCADE,
  quantity DECIMAL(8,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(recipe_id, food_id)
);

-- Create meal plans
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create meal plan entries
CREATE TABLE public.meal_plan_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('doručak', 'ručak', 'večera', 'užina')),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  food_id UUID REFERENCES public.food_database(id) ON DELETE SET NULL,
  quantity DECIMAL(8,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create exercise database
CREATE TABLE public.exercise_database (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  muscle_group TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create training plans
CREATE TABLE public.training_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create workout sessions
CREATE TABLE public.workout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_plan_id UUID NOT NULL REFERENCES public.training_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  session_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create workout exercises
CREATE TABLE public.workout_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercise_database(id) ON DELETE CASCADE,
  sets INTEGER,
  reps INTEGER,
  rest_period_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create questionnaires
CREATE TABLE public.questionnaires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create questionnaire questions
CREATE TABLE public.questionnaire_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'multiple_choice', 'checkbox', 'scale_1_10')),
  question_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create client submissions
CREATE TABLE public.client_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create progress tracking
CREATE TABLE public.progress_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('weight', 'waist_circumference', 'mood', 'energy_level', 'blood_pressure')),
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create chat messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create habits
CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  habit_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create client habits
CREATE TABLE public.client_habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, habit_id, date)
);

-- Create calendar events
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for clients (coaches can see their clients, clients can see their coach relationships)
CREATE POLICY "Coaches can view their clients" ON public.clients FOR SELECT USING (
  coach_id = auth.uid() OR client_id = auth.uid()
);
CREATE POLICY "Coaches can manage their clients" ON public.clients FOR ALL USING (coach_id = auth.uid());

-- RLS Policies for food database (admins can manage, clients can view)
CREATE POLICY "Everyone can view food database" ON public.food_database FOR SELECT USING (true);
CREATE POLICY "Admins can manage food database" ON public.food_database FOR ALL USING (
  public.get_current_user_role() = 'admin'
);

-- RLS Policies for recipes (coaches can manage their own, clients can view assigned)
CREATE POLICY "Coaches can manage their recipes" ON public.recipes FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "Users can view recipes" ON public.recipes FOR SELECT USING (true);

-- RLS Policies for recipe ingredients
CREATE POLICY "Users can view recipe ingredients" ON public.recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Coaches can manage recipe ingredients" ON public.recipe_ingredients FOR ALL USING (
  EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND coach_id = auth.uid())
);

-- RLS Policies for meal plans
CREATE POLICY "Users can view their meal plans" ON public.meal_plans FOR SELECT USING (
  client_id = auth.uid() OR coach_id = auth.uid()
);
CREATE POLICY "Coaches can manage meal plans" ON public.meal_plans FOR ALL USING (coach_id = auth.uid());

-- RLS Policies for meal plan entries
CREATE POLICY "Users can view meal plan entries" ON public.meal_plan_entries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.meal_plans WHERE id = meal_plan_id AND (client_id = auth.uid() OR coach_id = auth.uid()))
);
CREATE POLICY "Coaches can manage meal plan entries" ON public.meal_plan_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM public.meal_plans WHERE id = meal_plan_id AND coach_id = auth.uid())
);

-- RLS Policies for exercise database
CREATE POLICY "Users can view exercises" ON public.exercise_database FOR SELECT USING (true);
CREATE POLICY "Coaches can manage their exercises" ON public.exercise_database FOR ALL USING (coach_id = auth.uid());

-- RLS Policies for training plans
CREATE POLICY "Users can view their training plans" ON public.training_plans FOR SELECT USING (
  client_id = auth.uid() OR coach_id = auth.uid()
);
CREATE POLICY "Coaches can manage training plans" ON public.training_plans FOR ALL USING (coach_id = auth.uid());

-- RLS Policies for workout sessions
CREATE POLICY "Users can view workout sessions" ON public.workout_sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.training_plans WHERE id = training_plan_id AND (client_id = auth.uid() OR coach_id = auth.uid()))
);
CREATE POLICY "Coaches can manage workout sessions" ON public.workout_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.training_plans WHERE id = training_plan_id AND coach_id = auth.uid())
);

-- RLS Policies for workout exercises
CREATE POLICY "Users can view workout exercises" ON public.workout_exercises FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.workout_sessions ws
    JOIN public.training_plans tp ON ws.training_plan_id = tp.id
    WHERE ws.id = workout_session_id AND (tp.client_id = auth.uid() OR tp.coach_id = auth.uid())
  )
);
CREATE POLICY "Coaches can manage workout exercises" ON public.workout_exercises FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.workout_sessions ws
    JOIN public.training_plans tp ON ws.training_plan_id = tp.id
    WHERE ws.id = workout_session_id AND tp.coach_id = auth.uid()
  )
);

-- RLS Policies for questionnaires
CREATE POLICY "Users can view questionnaires" ON public.questionnaires FOR SELECT USING (true);
CREATE POLICY "Coaches can manage their questionnaires" ON public.questionnaires FOR ALL USING (coach_id = auth.uid());

-- RLS Policies for questionnaire questions
CREATE POLICY "Users can view questionnaire questions" ON public.questionnaire_questions FOR SELECT USING (true);
CREATE POLICY "Coaches can manage questionnaire questions" ON public.questionnaire_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.questionnaires WHERE id = questionnaire_id AND coach_id = auth.uid())
);

-- RLS Policies for client submissions
CREATE POLICY "Users can view their submissions" ON public.client_submissions FOR SELECT USING (
  client_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.questionnaires WHERE id = questionnaire_id AND coach_id = auth.uid()
  )
);
CREATE POLICY "Clients can create submissions" ON public.client_submissions FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Clients can update their submissions" ON public.client_submissions FOR UPDATE USING (client_id = auth.uid());

-- RLS Policies for progress tracking
CREATE POLICY "Users can view their progress" ON public.progress_tracking FOR SELECT USING (
  client_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.clients WHERE client_id = progress_tracking.client_id AND coach_id = auth.uid()
  )
);
CREATE POLICY "Clients can manage their progress" ON public.progress_tracking FOR ALL USING (client_id = auth.uid());

-- RLS Policies for chat messages
CREATE POLICY "Users can view their messages" ON public.chat_messages FOR SELECT USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);
CREATE POLICY "Users can send messages" ON public.chat_messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- RLS Policies for habits
CREATE POLICY "Users can view habits" ON public.habits FOR SELECT USING (true);
CREATE POLICY "Coaches can manage their habits" ON public.habits FOR ALL USING (coach_id = auth.uid());

-- RLS Policies for client habits
CREATE POLICY "Users can view their habits" ON public.client_habits FOR SELECT USING (
  client_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.clients WHERE client_id = client_habits.client_id AND coach_id = auth.uid()
  )
);
CREATE POLICY "Clients can manage their habits" ON public.client_habits FOR ALL USING (client_id = auth.uid());

-- RLS Policies for calendar events
CREATE POLICY "Users can view their events" ON public.calendar_events FOR SELECT USING (
  coach_id = auth.uid() OR client_id = auth.uid()
);
CREATE POLICY "Coaches can manage events" ON public.calendar_events FOR ALL USING (coach_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_food_database_updated_at BEFORE UPDATE ON public.food_database FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON public.meal_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exercise_database_updated_at BEFORE UPDATE ON public.exercise_database FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_plans_updated_at BEFORE UPDATE ON public.training_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_questionnaires_updated_at BEFORE UPDATE ON public.questionnaires FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON public.habits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();