import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { X } from "lucide-react"

interface AddClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClientAdded: () => void
}

export function AddClientModal({ open, onOpenChange, onClientAdded }: AddClientModalProps) {
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientTag, setClientTag] = useState("")
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string>("auto-naq")
  const [setStartDate, setSetStartDate] = useState(false)
  const [setEndDate, setSetEndDate] = useState(false)
  const [sendInstructions, setSendInstructions] = useState(true)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { profile } = useAuth()

  // Fetch available questionnaires
  const { data: questionnaires = [] } = useQuery({
    queryKey: ['questionnaires-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questionnaires')
        .select('id, title, description')
        .eq('coach_id', profile?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!profile?.id && open
  })

  const handleSubmit = async () => {
    if (!clientName.trim() || !clientEmail.trim()) {
      toast({
        title: "Greška",
        description: "Molimo unesite ime i email klijenta",
        variant: "destructive"
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(clientEmail)) {
      toast({
        title: "Greška",
        description: "Molimo unesite valjani email format",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Check if email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('id', `%${clientEmail}%`)
      
      if (checkError) {
        console.warn('Could not check existing users:', checkError)
      }

      // Generate temporary password for client
      const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!'

      // Create user account using standard signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: clientEmail,
        password: tempPassword,
        options: {
          data: {
            full_name: clientName,
            role: 'client'
          }
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('Email je već registriran u sustavu')
        }
        throw authError
      }

      if (!authData.user) {
        throw new Error('Neuspješno kreiranje korisničkog računa')
      }

      let finalQuestionnaireId = selectedQuestionnaire === "none" ? null : selectedQuestionnaire

      // If auto-NAQ is selected, create NAQ questionnaire
      if (selectedQuestionnaire === "auto-naq") {
        try {
          const { data: naqData, error: naqError } = await supabase.functions.invoke('create-naq-questionnaire', {
            body: { coachId: profile?.id }
          })

          if (naqError) throw naqError
          finalQuestionnaireId = naqData.questionnaireId
        } catch (naqError) {
          console.warn('Failed to create NAQ questionnaire:', naqError)
          finalQuestionnaireId = null
        }
      }

      // Create client record
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          client_id: authData.user.id,
          coach_id: profile?.id,
          status: 'pending',
          start_date: setStartDate ? new Date().toISOString().split('T')[0] : null,
          initial_questionnaire_id: finalQuestionnaireId
        })

      if (clientError) throw clientError

      toast({
        title: "Uspješno",
        description: `Klijent ${clientName} je uspješno dodan. Privremena lozinka: ${tempPassword}`,
      })

      // Reset form
      setClientName("")
      setClientEmail("")
      setClientTag("")
      setSelectedQuestionnaire("auto-naq")
      setSetStartDate(false)
      setSetEndDate(false)
      setSendInstructions(true)
      
      onClientAdded()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Add client error:', error)
      toast({
        title: "Greška",
        description: error.message || "Neuspješno dodavanje klijenta",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const removeTag = () => {
    setClientTag("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dodaj novog klijenta</DialogTitle>
          <DialogDescription>
            Unesite podatke za novog klijenta i pošaljite pozivnicu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="clientName">Ime klijenta *</Label>
            <Input
              id="clientName"
              placeholder="Unesite puno ime klijenta"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          {/* Client Email */}
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email klijenta *</Label>
            <Input
              id="clientEmail"
              type="email"
              placeholder="klijent@email.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>

          {/* Client Tag */}
          <div className="space-y-2">
            <Label htmlFor="clientTag">Tag klijenta (opcionalno)</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="clientTag"
                placeholder="Unesite tag za klijenta"
                value={clientTag}
                onChange={(e) => setClientTag(e.target.value)}
              />
              {clientTag && (
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1 px-2 py-1"
                >
                  {clientTag}
                  <button 
                    onClick={removeTag}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>

          {/* Date Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="startDate" 
                checked={setStartDate}
                onCheckedChange={(checked) => setSetStartDate(!!checked)}
              />
              <Label htmlFor="startDate" className="text-sm">
                Označiti početni datum (danas)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="endDate" 
                checked={setEndDate}
                onCheckedChange={(checked) => setSetEndDate(!!checked)}
              />
              <Label htmlFor="endDate" className="text-sm">
                Označiti završni datum (30 dana)
              </Label>
            </div>
          </div>

          {/* Initial Questionnaire */}
          <div className="space-y-2">
            <Label htmlFor="questionnaire">Početni upitnik (opcionalno)</Label>
            <Select value={selectedQuestionnaire} onValueChange={setSelectedQuestionnaire}>
              <SelectTrigger>
                <SelectValue placeholder="Odaberite upitnik za dodjelu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto-naq">Auto-kreiranje NAQ upitnika (preporučeno)</SelectItem>
                <SelectItem value="none">Bez upitnika</SelectItem>
                {questionnaires.map((questionnaire) => (
                  <SelectItem key={questionnaire.id} value={questionnaire.id}>
                    {questionnaire.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectedQuestionnaire === "auto-naq" 
                ? "NAQ upitnik će biti automatski kreiran i dodijeljen klijentu" 
                : selectedQuestionnaire === "none"
                ? "Klijent neće dobiti početni upitnik"
                : "Odabrani upitnik će biti automatski dodijeljen klijentu"
              }
            </p>
          </div>

          {/* Email Instructions */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="instructions" 
                checked={sendInstructions}
                onCheckedChange={(checked) => setSendInstructions(!!checked)}
              />
              <Label htmlFor="instructions" className="text-sm">
                Poslati email s instrukcijama klijentu
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
            {loading ? "Dodajem..." : "Dodaj klijenta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}