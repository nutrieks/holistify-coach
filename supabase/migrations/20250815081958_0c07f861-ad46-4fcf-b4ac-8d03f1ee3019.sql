-- Add collaboration duration fields to clients table
ALTER TABLE public.clients 
ADD COLUMN end_date DATE,
ADD COLUMN contract_duration_months INTEGER DEFAULT 12,
ADD COLUMN contract_type TEXT DEFAULT 'yearly' CHECK (contract_type IN ('monthly', 'quarterly', 'yearly', 'custom')),
ADD COLUMN renewal_reminder_sent BOOLEAN DEFAULT false;

-- Create contract history table for tracking renewals and changes
CREATE TABLE public.contract_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  coach_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  contract_duration_months INTEGER NOT NULL,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('monthly', 'quarterly', 'yearly', 'custom')),
  action_type TEXT NOT NULL CHECK (action_type IN ('initial', 'renewal', 'extension', 'modification')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contract_history
ALTER TABLE public.contract_history ENABLE ROW LEVEL SECURITY;

-- Create policies for contract_history
CREATE POLICY "Coaches can manage contract history" 
ON public.contract_history 
FOR ALL 
USING (coach_id = auth.uid());

CREATE POLICY "Users can view their contract history" 
ON public.contract_history 
FOR SELECT 
USING (
  client_id = auth.uid() OR 
  coach_id = auth.uid()
);

-- Function to auto-calculate end_date when start_date or duration changes
CREATE OR REPLACE FUNCTION public.calculate_contract_end_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate end_date based on start_date and duration
  IF NEW.start_date IS NOT NULL AND NEW.contract_duration_months IS NOT NULL THEN
    NEW.end_date = NEW.start_date + (NEW.contract_duration_months || ' months')::INTERVAL;
  END IF;
  
  -- Create contract history entry for significant changes
  IF TG_OP = 'UPDATE' AND (
    OLD.start_date IS DISTINCT FROM NEW.start_date OR 
    OLD.end_date IS DISTINCT FROM NEW.end_date OR 
    OLD.contract_duration_months IS DISTINCT FROM NEW.contract_duration_months OR
    OLD.contract_type IS DISTINCT FROM NEW.contract_type
  ) THEN
    INSERT INTO public.contract_history (
      client_id, coach_id, start_date, end_date, 
      contract_duration_months, contract_type, action_type, notes
    ) VALUES (
      NEW.client_id, NEW.coach_id, NEW.start_date, NEW.end_date,
      NEW.contract_duration_months, NEW.contract_type, 'modification',
      'Contract updated via admin panel'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-calculating end dates
CREATE TRIGGER calculate_contract_end_date_trigger
BEFORE INSERT OR UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.calculate_contract_end_date();

-- Add trigger for updated_at on contract_history
CREATE TRIGGER update_contract_history_updated_at
BEFORE UPDATE ON public.contract_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();