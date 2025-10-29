-- Create client_metabolic_indices table for BRI and FLI tracking
CREATE TABLE public.client_metabolic_indices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  measurement_date date NOT NULL DEFAULT CURRENT_DATE,
  bri_score numeric,
  fli_score numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(client_id, measurement_date)
);

-- Enable RLS
ALTER TABLE public.client_metabolic_indices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_metabolic_indices
CREATE POLICY "Admins can manage metabolic indices"
  ON public.client_metabolic_indices
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their metabolic indices"
  ON public.client_metabolic_indices
  FOR SELECT
  USING (auth.uid() = client_id);

-- Create trigger for updated_at
CREATE TRIGGER update_client_metabolic_indices_updated_at
  BEFORE UPDATE ON public.client_metabolic_indices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create client_goals table for Pathway A/B logic
CREATE TYPE goal_type AS ENUM ('fat_loss', 'muscle_gain', 'maintain');
CREATE TYPE pathway_type AS ENUM ('pathway_a', 'pathway_b');

CREATE TABLE public.client_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  goal goal_type NOT NULL,
  target_weight numeric,
  target_date date,
  pathway pathway_type NOT NULL,
  target_ffmi numeric,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_goals
CREATE POLICY "Admins can manage client goals"
  ON public.client_goals
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their goals"
  ON public.client_goals
  FOR SELECT
  USING (auth.uid() = client_id);

-- Create trigger for updated_at
CREATE TRIGGER update_client_goals_updated_at
  BEFORE UPDATE ON public.client_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_client_metabolic_indices_client_id ON public.client_metabolic_indices(client_id);
CREATE INDEX idx_client_metabolic_indices_date ON public.client_metabolic_indices(measurement_date DESC);
CREATE INDEX idx_client_goals_client_id ON public.client_goals(client_id);
CREATE INDEX idx_client_goals_active ON public.client_goals(is_active) WHERE is_active = true;