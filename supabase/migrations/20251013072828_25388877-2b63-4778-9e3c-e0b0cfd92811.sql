-- Funkcija za generiranje konzistentnog conversation_id između dva korisnika
CREATE OR REPLACE FUNCTION generate_conversation_id(user1_id uuid, user2_id uuid)
RETURNS uuid AS $$
DECLARE
  sorted_ids text;
BEGIN
  IF user1_id < user2_id THEN
    sorted_ids := user1_id::text || user2_id::text;
  ELSE
    sorted_ids := user2_id::text || user1_id::text;
  END IF;
  
  RETURN uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, sorted_ids);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Dodavanje novih kolona za rich chat funkcionalnosti
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS attachment_url text,
ADD COLUMN IF NOT EXISTS attachment_type text,
ADD COLUMN IF NOT EXISTS attachment_name text,
ADD COLUMN IF NOT EXISTS attachment_size integer,
ADD COLUMN IF NOT EXISTS reply_to_id uuid REFERENCES chat_messages(id),
ADD COLUMN IF NOT EXISTS edited_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- Index za brže pretraživanje
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation 
ON chat_messages(conversation_id, created_at DESC);

-- Index za brže dohvaćanje nepročitanih poruka
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread 
ON chat_messages(receiver_id, is_read, created_at) WHERE is_read = false;

-- Kreiranje storage bucket-a za chat attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  false,
  10485760, -- 10MB limit
  ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- RLS policy za upload attachments
CREATE POLICY "Users can upload their own attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy za download attachments
CREATE POLICY "Users can view attachments in their conversations"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-attachments' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM chat_messages
      WHERE (sender_id = auth.uid() OR receiver_id = auth.uid())
        AND attachment_url IS NOT NULL
        AND attachment_url LIKE '%' || name || '%'
    )
  )
);

-- RLS policy za brisanje svojih attachments
CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Funkcija za označavanje poruka kao pročitanih
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_receiver_id uuid, p_sender_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE chat_messages
  SET is_read = true
  WHERE receiver_id = p_receiver_id 
    AND sender_id = p_sender_id 
    AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;