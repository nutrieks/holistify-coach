import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { X, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
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
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: open
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

    if (!startDate || !endDate) {
      toast({
        title: "Greška",
        description: "Molimo odaberite datum početka i kraja suradnje",
        variant: "destructive"
      })
      return
    }

    if (endDate <= startDate) {
      toast({
        title: "Greška",
        description: "Datum kraja mora biti poslije datuma početka",
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

      // Call edge function to create client account (admin operation)
      const { data: clientData, error: clientError } = await supabase.functions.invoke('create-client-account', {
        body: {
          clientName,
          clientEmail,
          tempPassword,
          contractStartDate: startDate.toISOString().split('T')[0],
          contractEndDate: endDate.toISOString().split('T')[0],
          questionnaireId: selectedQuestionnaire === "none" ? null : (selectedQuestionnaire === "auto-naq" ? null : selectedQuestionnaire),
          createNAQ: selectedQuestionnaire === "auto-naq",
          coachId: profile?.id
        }
      })

      if (clientError) {
        console.error('Edge function error:', clientError)
        throw new Error(clientError.message || 'Neuspješno kreiranje klijenta')
      }

      if (!clientData?.success) {
        throw new Error(clientData?.error || 'Neuspješno kreiranje klijenta')
      }

      toast({
        title: "Uspješno",
        description: `Klijent ${clientName} je uspješno dodan. Privremena lozinka: ${tempPassword}`,
      })

      // Reset form
      setClientName("")
      setClientEmail("")
      setClientTag("")
      setSelectedQuestionnaire("auto-naq")
      setStartDate(undefined)
      setEndDate(undefined)
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

          {/* Trajanje suradnje */}
          <div className="space-y-3">
            <Label>Trajanje suradnje *</Label>
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm">Datum početka</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd.MM.yyyy") : "Odaberi datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm">Datum kraja</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd.MM.yyyy") : "Odaberi datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => startDate ? date <= startDate : false}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
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