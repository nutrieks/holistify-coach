-- Sprint 1: Database Expansion for Expert System

-- 1. Create client_biochemical_data table for metabolic health markers
CREATE TABLE IF NOT EXISTS public.client_biochemical_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(user_id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ggt NUMERIC(10, 2),
  triglycerides NUMERIC(10, 2),
  fasting_glucose NUMERIC(10, 2),
  hba1c NUMERIC(10, 2),
  insulin_sensitivity_score NUMERIC(10, 2),
  metabolic_flexibility_score NUMERIC(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_biochemical_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_biochemical_data
CREATE POLICY "Admins can manage biochemical data"
  ON public.client_biochemical_data
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their biochemical data"
  ON public.client_biochemical_data
  FOR SELECT
  USING (
    auth.uid() = client_id
  );

-- Trigger for updated_at
CREATE TRIGGER update_client_biochemical_data_updated_at
  BEFORE UPDATE ON public.client_biochemical_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Add new columns to client_anthropometric_data
ALTER TABLE public.client_anthropometric_data
  ADD COLUMN IF NOT EXISTS muscle_potential_score NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS morphotype TEXT CHECK (morphotype IN ('ectomorph', 'mesomorph', 'endomorph', 'ecto-meso', 'meso-endo')),
  ADD COLUMN IF NOT EXISTS frame_size TEXT CHECK (frame_size IN ('small', 'medium', 'large'));

-- 3. Create client_psychological_profile table
CREATE TABLE IF NOT EXISTS public.client_psychological_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(user_id) ON DELETE CASCADE,
  food_relationship_score NUMERIC(3, 1) CHECK (food_relationship_score >= 1 AND food_relationship_score <= 10),
  stress_level TEXT CHECK (stress_level IN ('low', 'moderate', 'high', 'extreme')),
  mental_priorities JSONB DEFAULT '[]'::jsonb,
  diet_history_complexity INTEGER DEFAULT 0,
  recommended_deficit_speed TEXT CHECK (recommended_deficit_speed IN ('slow', 'moderate', 'fast')),
  time_availability_minutes INTEGER,
  motivation_level TEXT CHECK (motivation_level IN ('exploring', 'moderate', 'high', 'extreme')),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, calculated_at)
);

-- Enable RLS
ALTER TABLE public.client_psychological_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_psychological_profile
CREATE POLICY "Admins can manage psychological profile"
  ON public.client_psychological_profile
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their psychological profile"
  ON public.client_psychological_profile
  FOR SELECT
  USING (
    auth.uid() = client_id
  );

-- Trigger for updated_at
CREATE TRIGGER update_client_psychological_profile_updated_at
  BEFORE UPDATE ON public.client_psychological_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Create energy_calculations table for storing Expert System results
CREATE TABLE IF NOT EXISTS public.energy_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(user_id) ON DELETE CASCADE,
  calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  dee NUMERIC(10, 2),
  tef_correction NUMERIC(10, 2),
  neat NUMERIC(10, 2),
  ea NUMERIC(10, 2),
  adaptive_tdee NUMERIC(10, 2),
  recommended_calories NUMERIC(10, 2),
  protein_target_g NUMERIC(10, 2),
  fat_target_g NUMERIC(10, 2),
  carbs_target_g NUMERIC(10, 2),
  calculation_method TEXT DEFAULT 'expert_system_v2',
  parameters_used JSONB DEFAULT '{}'::jsonb,
  reasoning JSONB DEFAULT '[]'::jsonb,
  insulin_sensitivity TEXT,
  muscle_potential TEXT,
  deficit_speed TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.energy_calculations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for energy_calculations
CREATE POLICY "Admins can manage energy calculations"
  ON public.energy_calculations
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their energy calculations"
  ON public.energy_calculations
  FOR SELECT
  USING (
    auth.uid() = client_id
  );

-- Trigger for updated_at
CREATE TRIGGER update_energy_calculations_updated_at
  BEFORE UPDATE ON public.energy_calculations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_biochemical_data_client_date 
  ON public.client_biochemical_data(client_id, measurement_date DESC);

CREATE INDEX IF NOT EXISTS idx_psychological_profile_client 
  ON public.client_psychological_profile(client_id, calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_energy_calculations_client_date 
  ON public.energy_calculations(client_id, calculation_date DESC);