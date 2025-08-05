-- Add message status and online tracking features
ALTER TABLE public.chat_messages 
ADD COLUMN status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read'));

-- Create table for online status tracking
CREATE TABLE public.user_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_online BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Create policies for user presence
CREATE POLICY "Users can view all presence" 
ON public.user_presence 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own presence" 
ON public.user_presence 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own presence status" 
ON public.user_presence 
FOR UPDATE 
USING (user_id = auth.uid());

-- Create index for better performance
CREATE INDEX idx_user_presence_user_id ON public.user_presence(user_id);
CREATE INDEX idx_chat_messages_status ON public.chat_messages(status);

-- Create trigger for updating user_presence timestamps
CREATE OR REPLACE FUNCTION update_user_presence()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_presence_updated_at
  BEFORE UPDATE ON public.user_presence
  FOR EACH ROW
  EXECUTE FUNCTION update_user_presence();