-- Add coach_id column to clients table to establish coach-client relationship
ALTER TABLE clients ADD COLUMN coach_id UUID REFERENCES auth.users(id);

-- Create index for better query performance
CREATE INDEX idx_clients_coach_id ON clients(coach_id);

-- Update RLS policy to allow clients to read their coach_id
CREATE POLICY "Clients can view their coach relationship" 
ON clients 
FOR SELECT 
USING (auth.uid() = user_id);

-- Comment explaining the relationship
COMMENT ON COLUMN clients.coach_id IS 'References the coach (admin user) who created and manages this client account';