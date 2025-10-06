-- Create client_anthropometric_data table
CREATE TABLE public.client_anthropometric_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(user_id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  height NUMERIC,
  weight NUMERIC,
  body_fat_manual NUMERIC,
  body_fat_navy NUMERIC,
  lean_body_mass NUMERIC,
  fat_mass NUMERIC,
  waist_circumference NUMERIC,
  hip_circumference NUMERIC,
  neck_circumference NUMERIC,
  wrist_circumference NUMERIC,
  digit_ratio_2d4d NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.client_anthropometric_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage anthropometric data"
ON public.client_anthropometric_data
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their anthropometric data"
ON public.client_anthropometric_data
FOR SELECT
USING (auth.uid() = client_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_client_anthropometric_data_updated_at
BEFORE UPDATE ON public.client_anthropometric_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_client_anthropometric_data_client_id ON public.client_anthropometric_data(client_id);
CREATE INDEX idx_client_anthropometric_data_date ON public.client_anthropometric_data(measurement_date DESC);