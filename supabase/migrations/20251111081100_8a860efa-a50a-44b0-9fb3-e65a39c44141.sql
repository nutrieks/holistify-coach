-- Update the trigger function to ONLY allow 'client' role from public signups
-- This prevents anyone from bypassing the frontend and creating admin accounts via API
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Force all new signups to be 'client' role only
  -- Admins can only be created manually by existing admins
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    'client'::app_role  -- Always force client role, ignore metadata
  );
  RETURN NEW;
END;
$$;

-- Add RLS policy to ensure only admins can manually insert admin roles
CREATE POLICY "Only admins can create admin roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if inserting client role (for self-registration)
  role = 'client'::app_role
  OR
  -- OR allow if current user is admin (for manual admin creation)
  public.has_role(auth.uid(), 'admin'::app_role)
);