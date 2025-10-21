-- Dodati nove kolone u clients tablicu za Inicijalni Coaching Upitnik
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS relationship_status TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS number_of_children INTEGER;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS blood_type TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS place_of_birth TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS best_contact_time TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS preferred_pronouns TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS weekly_work_hours TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS smoking_status TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS smoking_details TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS alcohol_consumption TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS alcohol_details TEXT;