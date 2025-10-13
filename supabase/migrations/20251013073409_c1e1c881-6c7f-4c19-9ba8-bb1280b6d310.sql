-- Popravljanje security warning: dodavanje search_path za generate_conversation_id funkciju
CREATE OR REPLACE FUNCTION generate_conversation_id(user1_id uuid, user2_id uuid)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Popravljanje security warning: dodavanje search_path za mark_messages_as_read funkciju
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_receiver_id uuid, p_sender_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE chat_messages
  SET is_read = true
  WHERE receiver_id = p_receiver_id 
    AND sender_id = p_sender_id 
    AND is_read = false;
END;
$$;