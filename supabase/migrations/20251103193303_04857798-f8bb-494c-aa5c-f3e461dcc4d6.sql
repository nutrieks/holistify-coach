-- Fix security warning: Set search_path for micronutrient function
CREATE OR REPLACE FUNCTION update_micronutrient_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;