-- FAZA 2: Daily Adaptive Tracking (PDF Str. 26-31)
-- Create table for daily client tracking data

CREATE TABLE public.client_daily_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  tracking_date date NOT NULL,
  
  -- Input data (user enters)
  daily_weight numeric,
  daily_calories_consumed numeric,
  
  -- Calculated fields
  weight_ewma numeric, -- Exponentially Weighted Moving Average
  daily_change_in_stores numeric, -- (Weight_today - Weight_yesterday) × 7700
  adaptive_tdee_7day numeric, -- 7-day weighted moving average
  
  -- Metadata
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(client_id, tracking_date)
);

-- Enable RLS
ALTER TABLE public.client_daily_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage daily tracking"
  ON public.client_daily_tracking
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can manage their daily tracking"
  ON public.client_daily_tracking
  FOR ALL
  USING (auth.uid() = client_id);

-- Create trigger for updated_at
CREATE TRIGGER update_client_daily_tracking_updated_at
  BEFORE UPDATE ON public.client_daily_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_client_daily_tracking_client_date ON public.client_daily_tracking(client_id, tracking_date DESC);
CREATE INDEX idx_client_daily_tracking_date ON public.client_daily_tracking(tracking_date DESC);