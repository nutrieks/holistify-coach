import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface AssignNAQModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onNAQAssigned: () => void;
}

export function AssignNAQModal({ 
  open, 
  onOpenChange, 
  clientId,
  onNAQAssigned 
}: AssignNAQModalProps) {
  const [notes, setNotes] = useState("");
  const [sendNotification, setSendNotification] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  // Fetch NAQ questionnaire (filter by type)
  const { data: naqQuestionnaire, isLoading: isLoadingNAQ } = useQuery({
    queryKey: ['naq-questionnaire'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questionnaires')
        .select('id, title')
        .eq('questionnaire_type', 'naq')
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: open
  });

  const handleSubmit = async () => {
    if (!naqQuestionnaire) {
      toast({
        title: "Greška",
        description: "NAQ upitnik nije pronađen",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Insert assigned questionnaire
      const { error } = await supabase
        .from('assigned_questionnaires')
        .insert({
          client_id: clientId,
          questionnaire_id: naqQuestionnaire.id,
          assigned_by: profile?.id,
          status: 'sent'
        });

      if (error) throw error;

      toast({
        title: "Uspješno",
        description: "NAQ upitnik je uspješno poslan klijentu"
      });

      // Reset form
      setNotes("");
      setSendNotification(true);
      
      onNAQAssigned();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Assign NAQ error:', error);
      toast({
        title: "Greška",
        description: error.message || "Neuspješno slanje NAQ upitnika",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Zatraži NAQ</DialogTitle>
          <DialogDescription>
            Pošaljite NAQ upitnik klijentu za procjenu nutritivnog statusa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Show NAQ Info */}
          {isLoadingNAQ ? (
            <div className="text-center text-muted-foreground">Učitavanje...</div>
          ) : naqQuestionnaire ? (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold">{naqQuestionnaire.title}</h4>
              <p className="text-sm text-muted-foreground">
                NAQ upitnik će biti poslan klijentu
              </p>
            </div>
          ) : (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">
                NAQ upitnik nije pronađen u sustavu. Molimo kontaktirajte podršku.
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Napomena (opcionalno)</Label>
            <Textarea
              id="notes"
              placeholder="Dodajte napomenu uz NAQ upitnik..."
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
            disabled={loading || !naqQuestionnaire}
          >
            {loading ? "Šaljem..." : "Pošalji NAQ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
