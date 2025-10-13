import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search } from "lucide-react";
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
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { SearchBar } from "./SearchBar";
import { useMessageSearch } from "@/hooks/useMessageSearch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  reply_to_id?: string;
  reply_to_message?: string;
  edited_at?: string;
  deleted_at?: string;
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
  const [replyingTo, setReplyingTo] = useState<{ id: string; message: string } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ id: string; message: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  
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

  // Search functionality
  const { query, setQuery, results, currentIndex, currentResult, goToNext, goToPrev, reset } = 
    useMessageSearch(messages);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, file }: { message: string; file?: File }) => {
      // Generate conversation_id locally (sorted to ensure consistency)
      const sortedIds = [currentUserId, otherUserId].sort();
      const conversationId = `chat_${sortedIds[0]}_${sortedIds[1]}`;

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
          conversation_id: conversationId,
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
    
    const messageData: any = { message, file };
    if (replyingTo) {
      messageData.reply_to_id = replyingTo.id;
      messageData.reply_to_message = replyingTo.message;
    }
    
    sendMessageMutation.mutate(messageData);
    setReplyingTo(null);
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ 
          message: newText,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['chat-messages', currentUserId, otherUserId] });
      toast({ title: "Poruka ažurirana" });
    } catch (error) {
      toast({ 
        title: "Greška", 
        description: "Poruka nije ažurirana",
        variant: "destructive" 
      });
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageToDelete);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['chat-messages', currentUserId, otherUserId] });
      toast({ title: "Poruka obrisana" });
    } catch (error) {
      toast({ 
        title: "Greška", 
        description: "Poruka nije obrisana",
        variant: "destructive" 
      });
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      
      // Escape to close search
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, reset]);

  return (
    <>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {otherUserName}
              <OnlineStatus isOnline={isOtherUserOnline} />
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                title="Pretraži poruke (Ctrl+K)"
              >
                <Search className="h-4 w-4" />
              </Button>
              <KeyboardShortcuts />
            </div>
          </div>
        </CardHeader>
        
        {searchOpen && (
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            currentIndex={currentIndex}
            totalResults={results.length}
            onNext={goToNext}
            onPrev={goToPrev}
            onClose={() => {
              setSearchOpen(false);
              reset();
            }}
          />
        )}
      
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
                const isHighlighted = currentResult?.message.id === msg.id;
                
                return (
                  <ChatMessageComponent
                    key={msg.id}
                    message={msg}
                    isSender={isSender}
                    senderName={isSender ? "Ja" : otherUserName}
                    showAvatar={showAvatar}
                    isHighlighted={isHighlighted}
                    onReply={(msg) => setReplyingTo({ id: msg.id, message: msg.message })}
                    onEdit={(msg) => setEditingMessage({ id: msg.id, message: msg.message })}
                    onDelete={(id) => {
                      setMessageToDelete(id);
                      setDeleteDialogOpen(true);
                    }}
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
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
          onEditSave={handleEditMessage}
        />
      </CardContent>
    </Card>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Obriši poruku?</AlertDialogTitle>
          <AlertDialogDescription>
            Jeste li sigurni da želite obrisati ovu poruku? Ova akcija se ne može poništiti.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Odustani</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteMessage}>Obriši</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
