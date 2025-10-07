import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"

interface AssignQuestionnaireModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  onQuestionnaireAssigned: () => void
}

export function AssignQuestionnaireModal({ 
  open, 
  onOpenChange, 
  clientId,
  onQuestionnaireAssigned 
}: AssignQuestionnaireModalProps) {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [sendNotification, setSendNotification] = useState(true)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { profile } = useAuth()

  // Fetch available questionnaires
  const { data: questionnaires = [] } = useQuery({
    queryKey: ['available-questionnaires'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questionnaires')
        .select('id, title, description')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: open
  })

  const handleSubmit = async () => {
    if (!selectedQuestionnaire) {
      toast({
        title: "Greška",
        description: "Molimo odaberite upitnik",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Insert assigned questionnaire
      const { error } = await supabase
        .from('assigned_questionnaires')
        .insert({
          client_id: clientId,
          questionnaire_id: selectedQuestionnaire,
          assigned_by: profile?.id,
          status: 'sent'
        })

      if (error) throw error

      toast({
        title: "Uspješno",
        description: "Upitnik je uspješno dodijeljen klijentu"
      })

      // Reset form
      setSelectedQuestionnaire("")
      setNotes("")
      setSendNotification(true)
      
      onQuestionnaireAssigned()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Assign questionnaire error:', error)
      toast({
        title: "Greška",
        description: error.message || "Neuspješno dodjeljivanje upitnika",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dodijeli upitnik</DialogTitle>
          <DialogDescription>
            Odaberite upitnik koji želite dodijeliti klijentu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Questionnaire Selection */}
          <div className="space-y-2">
            <Label htmlFor="questionnaire">Upitnik *</Label>
            <Select value={selectedQuestionnaire} onValueChange={setSelectedQuestionnaire}>
              <SelectTrigger>
                <SelectValue placeholder="Odaberite upitnik" />
              </SelectTrigger>
              <SelectContent>
                {questionnaires.map((questionnaire) => (
                  <SelectItem key={questionnaire.id} value={questionnaire.id}>
                    {questionnaire.title}
                    {questionnaire.description && (
                      <span className="text-xs text-muted-foreground block">
                        {questionnaire.description}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Napomena (opcionalno)</Label>
            <Textarea
              id="notes"
              placeholder="Dodajte napomenu uz upitnik..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Send Notification */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="notification" 
                checked={sendNotification}
                onCheckedChange={(checked) => setSendNotification(!!checked)}
              />
              <Label htmlFor="notification" className="text-sm">
                Poslati email obavijest klijentu
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Odustani
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Dodjeljujem..." : "Dodijeli upitnik"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
