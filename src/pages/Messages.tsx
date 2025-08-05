import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useRealtimeChat } from "@/hooks/useRealtimeChat"
import { useUserPresence } from "@/hooks/useUserPresence"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TypingIndicator } from "@/components/ui/typing-indicator"
import { OnlineStatus } from "@/components/ui/online-status"
import { Skeleton } from "@/components/ui/skeleton"
import { Send, ArrowLeft, Volume2, VolumeX, Check, CheckCheck } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  message_text: string
  timestamp: string
  status?: 'sent' | 'delivered' | 'read'
}

interface CoachInfo {
  id: string
  full_name: string
  is_online?: boolean
}

export default function Messages() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [coachInfo, setCoachInfo] = useState<CoachInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize real-time chat features
  const conversationId = coachInfo?.id || ''
  const { typingUsers, onlineUsers, handleTyping } = useRealtimeChat(
    profile?.id || '', 
    conversationId
  )

  // Track user presence
  useUserPresence(profile?.id || '')

  // Fetch coach info and messages
  useEffect(() => {
    if (!profile?.id) return

    fetchCoachAndMessages()
  }, [profile?.id])

  // Enhanced real-time subscription with better error handling
  useEffect(() => {
    if (!profile?.id || !coachInfo?.id) return

    const channel = supabase
      .channel('enhanced-chat-messages', {
        config: {
          broadcast: { self: false },
          presence: { key: profile.id }
        }
      })
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
            
            // Play notification sound for received messages
            if (newMessage.sender_id !== profile.id && soundEnabled && audioRef.current) {
              audioRef.current.play().catch(console.error)
            }
            
            // Show browser notification for received messages
            if (newMessage.sender_id !== profile.id && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification(`Nova poruka od ${coachInfo.full_name}`, {
                  body: newMessage.message_text,
                  icon: '/favicon.ico'
                })
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission()
              }
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          toast.error('Greška konekcije. Pokušavam ponovno povezivanje...')
          // Retry connection after 3 seconds
          setTimeout(() => {
            channel.subscribe()
          }, 3000)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, coachInfo?.id, soundEnabled])

  // Check coach online status
  useEffect(() => {
    if (!coachInfo?.id) return

    const checkOnlineStatus = async () => {
      try {
        const { data } = await supabase
          .from('user_presence')
          .select('is_online, last_seen')
          .eq('user_id', coachInfo.id)
          .single()

        if (data) {
          const isRecentlyActive = new Date(data.last_seen).getTime() > Date.now() - 5 * 60 * 1000 // 5 minutes
          setCoachInfo(prev => prev ? { ...prev, is_online: data.is_online && isRecentlyActive } : null)
        }
      } catch (error) {
        console.error('Error checking online status:', error)
      }
    }

    checkOnlineStatus()
    const interval = setInterval(checkOnlineStatus, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [coachInfo?.id])

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

      setMessages((messagesData || []).map(msg => ({
        ...msg,
        status: (msg.status as 'sent' | 'delivered' | 'read') || 'sent'
      })))
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
        {/* Hidden audio element for notifications */}
        <audio ref={audioRef} preload="auto">
          <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAYAz+b2O/Dfx4CA42+7qaLNggZaLnr7JdMDQxPpuDyvmpNGhNiqN3SnD8RAECJvOiYSgkJUarm7Z9RD" type="audio/wav" />
        </audio>
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Natrag
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Poruke</h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">Razgovor s trenerom {coachInfo.full_name}</p>
              <OnlineStatus isOnline={coachInfo.is_online || false} />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Isključi zvuk" : "Uključi zvuk"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>

        {/* Chat Container */}
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Chat s {coachInfo.full_name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <OnlineStatus 
                  isOnline={coachInfo.is_online || false} 
                  showText={true}
                />
              </div>
            </div>
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
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${
                            message.sender_id === profile?.id
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                          {message.sender_id === profile?.id && (
                            <div className="ml-2">
                              {message.status === 'read' ? (
                                <CheckCheck className="h-3 w-3 text-blue-400" />
                              ) : message.status === 'delivered' ? (
                                <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                              ) : (
                                <Check className="h-3 w-3 text-primary-foreground/70" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <TypingIndicator names={typingUsers.map(u => u.name)} />
            )}

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                    // Trigger typing indicator
                    if (e.target.value.trim() && profile?.full_name) {
                      handleTyping(profile.full_name)
                    }
                  }}
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