import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatMessage as ChatMessageComponent } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useChatScroll } from "@/hooks/useChatScroll";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { OnlineStatus } from "@/components/ui/online-status";

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  conversation_id: string;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
  attachment_size?: number;
}

interface ChatInterfaceProps {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
}

export default function ChatInterface({ currentUserId, otherUserId, otherUserName }: ChatInterfaceProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { uploadFile, uploading } = useFileUpload();
  
  // Realtime features (typing indicators, online status)
  const conversationId = `chat_${[currentUserId, otherUserId].sort().join('_')}`;
  const { typingUsers, onlineUsers, handleTyping } = useRealtimeChat(currentUserId, conversationId);
  const isOtherUserOnline = onlineUsers.has(otherUserId);

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages', currentUserId, otherUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Mark messages as read
      await supabase.rpc('mark_messages_as_read', {
        p_receiver_id: currentUserId,
        p_sender_id: otherUserId,
      });
      
      return data as ChatMessage[];
    },
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollRef = useChatScroll(messages);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, file }: { message: string; file?: File }) => {
      // Generate conversation_id using database function
      const { data: convId, error: convIdError } = await supabase.rpc(
        'generate_conversation_id',
        { user1_id: currentUserId, user2_id: otherUserId }
      );

      if (convIdError) throw convIdError;

      let attachmentData = {};
      
      // Upload file if provided
      if (file) {
        const uploadResult = await uploadFile(file, currentUserId);
        if (!uploadResult) {
          throw new Error("File upload failed");
        }
        
        attachmentData = {
          attachment_url: uploadResult.url,
          attachment_type: uploadResult.type,
          attachment_name: uploadResult.name,
          attachment_size: uploadResult.size,
        };
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: convId,
          sender_id: currentUserId,
          receiver_id: otherUserId,
          message: message.trim() || null,
          ...attachmentData,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', currentUserId, otherUserId] });
    },
    onError: (error) => {
      console.error("Send message error:", error);
      toast({
        title: "Greška",
        description: "Poruka nije poslana.",
        variant: "destructive",
      });
    },
  });

  // Setup realtime subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel('chat-messages-new')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `or(and(sender_id=eq.${currentUserId},receiver_id=eq.${otherUserId}),and(sender_id=eq.${otherUserId},receiver_id=eq.${currentUserId}))`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', currentUserId, otherUserId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId, queryClient]);

  const handleSendMessage = (message: string, file?: File) => {
    if (!message.trim() && !file) return;
    sendMessageMutation.mutate({ message, file });
  };

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {otherUserName}
            <OnlineStatus isOnline={isOtherUserOnline} />
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p className="text-lg font-medium">Nema poruka</p>
              <p className="text-sm">Započnite razgovor!</p>
            </div>
          ) : (
            <div>
              {messages.map((msg, index) => {
                const isSender = msg.sender_id === currentUserId;
                const prevMsg = messages[index - 1];
                const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                
                return (
                  <ChatMessageComponent
                    key={msg.id}
                    message={msg}
                    isSender={isSender}
                    senderName={isSender ? "Ja" : otherUserName}
                    showAvatar={showAvatar}
                  />
                );
              })}
              
              {typingUsers.length > 0 && (
                <TypingIndicator names={typingUsers.map(u => u.name)} />
              )}
            </div>
          )}
        </ScrollArea>

        <ChatInput
          onSend={handleSendMessage}
          onTyping={() => handleTyping(otherUserName)}
          disabled={sendMessageMutation.isPending || uploading}
          placeholder="Napišite poruku..."
        />
      </CardContent>
    </Card>
  );
}
