import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  message_text: string
  timestamp: string
}

interface CoachInfo {
  id: string
  full_name: string
}

export default function Messages() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [coachInfo, setCoachInfo] = useState<CoachInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Fetch coach info and messages
  useEffect(() => {
    if (!profile?.id) return

    fetchCoachAndMessages()
  }, [profile?.id])

  // Realtime subscription for new messages
  useEffect(() => {
    if (!profile?.id || !coachInfo?.id) return

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage
          // Only add messages relevant to this conversation
          if (
            (newMessage.sender_id === profile.id && newMessage.receiver_id === coachInfo.id) ||
            (newMessage.sender_id === coachInfo.id && newMessage.receiver_id === profile.id)
          ) {
            setMessages(prev => [...prev, newMessage])
            scrollToBottom()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, coachInfo?.id])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchCoachAndMessages = async () => {
    try {
      setIsLoading(true)

      // Get coach info from clients table
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select(`
          coach_id,
          profiles!clients_coach_id_fkey (
            id,
            full_name
          )
        `)
        .eq('client_id', profile?.id)
        .single()

      if (clientError || !clientData) {
        toast.error("Ne mogu dohvatiti informacije o treneru")
        return
      }

      const coachProfile = clientData.profiles as CoachInfo
      setCoachInfo(coachProfile)

      // Fetch messages between client and coach
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${profile?.id},receiver_id.eq.${coachProfile.id}),and(sender_id.eq.${coachProfile.id},receiver_id.eq.${profile?.id})`)
        .order('timestamp', { ascending: true })

      if (messagesError) {
        toast.error("Greška pri dohvaćanju poruka")
        return
      }

      setMessages(messagesData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error("Greška pri dohvaćanju podataka")
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !coachInfo || isSending) return

    setIsSending(true)
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: profile?.id,
          receiver_id: coachInfo.id,
          message_text: newMessage.trim()
        })

      if (error) {
        toast.error("Greška pri slanju poruke")
        return
      }

      setNewMessage("")
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error("Greška pri slanju poruke")
    } finally {
      setIsSending(false)
    }
  }

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit' }) + ' ' +
             date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Učitavam poruke...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!coachInfo) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Natrag na Dashboard
          </Button>
          
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-muted-foreground">Nemate dodijeljenog trenera</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Kontaktirajte administratora za dodjelu trenera
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Natrag
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Poruke</h1>
            <p className="text-muted-foreground">Razgovor s trenerom {coachInfo.full_name}</p>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">
              Chat s {coachInfo.full_name}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Još nema poruka. Pošaljite prvu poruku!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === profile?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.sender_id === profile?.id
                            ? 'bg-primary text-primary-foreground ml-12'
                            : 'bg-muted mr-12'
                        }`}
                      >
                        <p className="text-sm">{message.message_text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === profile?.id
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Napišite poruku..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  disabled={isSending}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim() || isSending}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}