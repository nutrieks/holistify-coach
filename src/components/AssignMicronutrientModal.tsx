import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface AssignMicronutrientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  onAssigned: () => void
}

export function AssignMicronutrientModal({ 
  open, 
  onOpenChange, 
  clientId, 
  onAssigned 
}: AssignMicronutrientModalProps) {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Fetch active micronutrient questionnaires (get only the latest one)
  const { data: questionnaires, isLoading } = useQuery({
    queryKey: ['micronutrient-questionnaires-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('micronutrient_questionnaires')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)

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
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error("Niste prijavljeni")

      // Insert assignment
      const { error } = await supabase
        .from('assigned_micronutrient_questionnaires')
        .insert({
          client_id: clientId,
          questionnaire_id: selectedQuestionnaire,
          assigned_by: user.id,
          status: 'sent',
          notes: notes || null,
        })

      if (error) throw error

      toast({
        title: "Uspješno",
        description: "Mikronutritivni upitnik je dodijeljen klijentu",
      })

      setSelectedQuestionnaire("")
      setNotes("")
      onAssigned()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error assigning micronutrient questionnaire:', error)
      toast({
        title: "Greška",
        description: error.message || "Došlo je do greške prilikom dodjeljivanja upitnika",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dodijeli Mikronutritivni Upitnik</DialogTitle>
          <DialogDescription>
            Odaberite mikronutritivni upitnik koji želite dodijeliti klijentu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="questionnaire">Mikronutritivni Upitnik</Label>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Select 
                value={selectedQuestionnaire} 
                onValueChange={setSelectedQuestionnaire}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Odaberite upitnik" />
                </SelectTrigger>
                <SelectContent>
                  {questionnaires?.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {questionnaires && questionnaires.length > 0 && selectedQuestionnaire && (
              <p className="text-sm text-muted-foreground">
                {questionnaires.find(q => q.id === selectedQuestionnaire)?.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Napomene (opcionalno)</Label>
            <Textarea
              id="notes"
              placeholder="Dodajte dodatne napomene za klijenta..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Otkaži
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedQuestionnaire}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Dodjeljivanje...
              </>
            ) : (
              "Dodijeli upitnik"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
