import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import ChatInterface from "@/components/chat/ChatInterface"

interface CoachInfo {
  id: string
  full_name: string
}

export default function Messages() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [coachInfo, setCoachInfo] = useState<CoachInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch coach info
  useEffect(() => {
    if (!profile?.id) return

    fetchCoach()
  }, [profile?.id])

  const fetchCoach = async () => {
    try {
      setIsLoading(true)

      // Get user's own profile - this is simplified as we don't have coach relationship in clients table
      // For now, just find admin users to chat with
      const { data: adminUsers, error: adminError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          profiles!inner (
            id,
            full_name
          )
        `)
        .eq('role', 'admin')
        .limit(1)
        .single()

      if (adminError || !adminUsers) {
        toast.error("Ne mogu dohvatiti informacije o treneru")
        return
      }

      const coachProfile = adminUsers.profiles as any as CoachInfo
      setCoachInfo(coachProfile)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error("Greška pri dohvaćanju podataka")
    } finally {
      setIsLoading(false)
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Poruke</h1>
            <p className="text-muted-foreground">Razgovor s trenerom {coachInfo.full_name}</p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="h-[calc(100vh-200px)]">
          <ChatInterface
            currentUserId={profile?.id || ''}
            otherUserId={coachInfo.id}
            otherUserName={coachInfo.full_name}
          />
        </div>
      </div>
    </div>
  )
}