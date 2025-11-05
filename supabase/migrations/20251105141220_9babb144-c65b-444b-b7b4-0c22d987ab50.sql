-- Add archiving fields to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES auth.users(id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_clients_is_archived ON clients(is_archived);

-- Add DELETE RLS policy for admins
CREATE POLICY "Admins can delete clients"
ON clients
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));