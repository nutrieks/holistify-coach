import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/integrations/supabase/client"
import { Send, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"

interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  message_text: string
  timestamp: string
  sender_profile?: {
    full_name: string | null
  }
  receiver_profile?: {
    full_name: string | null
  }
}

interface Conversation {
  client_id: string
  client_name: string
  last_message: string
  last_message_time: string
  unread_count: number
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchConversations = async () => {
    try {
      // Dohvaćamo sve klijente koji imaju poruke s trenerom
      const { data: clientsList, error: clientsError } = await supabase
        .from('clients')
        .select(`
          client_id,
          client_profile:profiles!clients_client_id_fkey (
            full_name
          )
        `)
        .eq('coach_id', user?.id)

      if (clientsError) throw clientsError

      // Za sada ćemo samo pokazati listu klijenata bez stvarnih poruka
      const mockConversations: Conversation[] = (clientsList || []).map(client => ({
        client_id: client.client_id,
        client_name: (client as any).client_profile?.full_name || 'Nepoznato ime',
        last_message: 'Početak razgovora',
        last_message_time: new Date().toISOString(),
        unread_count: 0
      }))

      setConversations(mockConversations)
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno dohvaćanje razgovora",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender_profile:profiles!chat_messages_sender_id_fkey (full_name),
          receiver_profile:profiles!chat_messages_receiver_id_fkey (full_name)
        `)
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${clientId}),and(sender_id.eq.${clientId},receiver_id.eq.${user?.id})`)
        .order('timestamp', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno dohvaćanje poruka",
        variant: "destructive"
      })
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedClient) return

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: user?.id,
          receiver_id: selectedClient,
          message_text: newMessage.trim()
        })

      if (error) throw error

      setNewMessage("")
      fetchMessages(selectedClient)
      
      toast({
        title: "Uspjeh",
        description: "Poruka je poslana"
      })
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno slanje poruke",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  // Realtime subscription for new messages
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('admin-chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage
          
          // Update conversations list with new message
          setConversations(prev => prev.map(conv => {
            if ((newMessage.sender_id === conv.client_id && newMessage.receiver_id === user.id) ||
                (newMessage.sender_id === user.id && newMessage.receiver_id === conv.client_id)) {
              return {
                ...conv,
                last_message: newMessage.message_text,
                unread_count: newMessage.sender_id !== user.id ? conv.unread_count + 1 : conv.unread_count
              }
            }
            return conv
          }))
          
          // Add message to current conversation if it's the selected client
          if (selectedClient && 
              ((newMessage.sender_id === selectedClient && newMessage.receiver_id === user.id) ||
               (newMessage.sender_id === user.id && newMessage.receiver_id === selectedClient))) {
            setMessages(prev => [...prev, newMessage])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, selectedClient])

  useEffect(() => {
    if (selectedClient) {
      fetchMessages(selectedClient)
    }
  }, [selectedClient])

  if (loading) {
    return (
      <AdminLayout title="Poruke">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-lg">Učitavam poruke...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Poruke">
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Conversations List */}
        <Card className="w-80 flex flex-col">
          <CardHeader>
            <CardTitle>Razgovori</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži razgovore..."
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.client_id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedClient === conversation.client_id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedClient(conversation.client_id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {conversation.client_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {conversation.client_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.last_message}
                        </p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs text-primary-foreground">
                            {conversation.unread_count}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {conversations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nemate aktivnih razgovora</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="flex-1 flex flex-col">
          {selectedClient ? (
            <>
              <CardHeader>
                <CardTitle>
                  {conversations.find(c => c.client_id === selectedClient)?.client_name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.message_text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString('hr-HR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {messages.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Početak razgovora. Pošaljite prvu poruku!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Unesite poruku..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>Odaberite razgovor za početak chata</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}