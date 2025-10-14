-- Drop existing index if it exists
DROP INDEX IF EXISTS idx_chat_messages_conversation;

-- Change conversation_id column type from uuid to text
ALTER TABLE chat_messages 
ALTER COLUMN conversation_id TYPE text 
USING conversation_id::text;

-- Recreate index for performance
CREATE INDEX idx_chat_messages_conversation 
ON chat_messages(conversation_id, created_at DESC);

-- Add comment for clarity
COMMENT ON COLUMN chat_messages.conversation_id IS 
'Conversation identifier in format: chat_{smaller_uuid}_{larger_uuid}';