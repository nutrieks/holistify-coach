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

      // Call backend function to get coach info (bypasses RLS)
      const { data, error } = await supabase.functions.invoke('get-assigned-coach')

      if (error) {
        console.error('Error calling get-assigned-coach:', error)
        toast.error("Greška pri dohvaćanju podataka savjetnika")
        setCoachInfo(null)
        return
      }

      // If no data returned (204), no coach assigned
      if (!data) {
        console.log('No coach assigned (204 response)')
        setCoachInfo(null)
        return
      }

      setCoachInfo(data)
    } catch (error) {
      console.error('Unexpected error fetching coach:', error)
      toast.error("Greška pri dohvaćanju podataka savjetnika")
      setCoachInfo(null)
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
            onClick={() => navigate('/client')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Natrag na Dashboard
          </Button>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Nemate dodijeljenog savjetnika</h3>
                <p className="text-muted-foreground">
                  Trenutno vam nije dodijeljen savjetnik za komunikaciju.
                </p>
                <p className="text-sm text-muted-foreground">
                  Kontaktirajte administratora kako bi vam dodijelio savjetnika i omogućio korištenje sustava poruka.
                </p>
              </div>
              <Button onClick={() => navigate('/client')} variant="outline">
                Povratak na Dashboard
              </Button>
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
            onClick={() => navigate('/client')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Natrag
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Poruke</h1>
            <p className="text-muted-foreground">Razgovor sa savjetnikom {coachInfo.full_name}</p>
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