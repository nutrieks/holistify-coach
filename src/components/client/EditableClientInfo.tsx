import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Edit2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { hr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface EditableClientInfoProps {
  clientId: string;
  initialGender: string | null;
  initialPhone: string | null;
  initialContractStartDate: string | null;
  initialContractEndDate: string | null;
  onUpdate: () => void;
}

export function EditableClientInfo({
  clientId,
  initialGender,
  initialPhone,
  initialContractStartDate,
  initialContractEndDate,
  onUpdate
}: EditableClientInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [gender, setGender] = useState(initialGender || '');
  const [phone, setPhone] = useState(initialPhone || '');
  const [contractStartDate, setContractStartDate] = useState<Date | undefined>(
    initialContractStartDate ? new Date(initialContractStartDate) : undefined
  );
  const [contractEndDate, setContractEndDate] = useState<Date | undefined>(
    initialContractEndDate ? new Date(initialContractEndDate) : undefined
  );
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          gender: gender || null,
          phone: phone || null,
          contract_start_date: contractStartDate ? format(contractStartDate, 'yyyy-MM-dd') : null,
          contract_end_date: contractEndDate ? format(contractEndDate, 'yyyy-MM-dd') : null,
        })
        .eq('user_id', clientId);

      if (error) throw error;

      toast({
        title: "Uspjeh",
        description: "Podaci uspješno ažurirani",
      });
      
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast({
        title: "Greška",
        description: "Neuspješno ažuriranje podataka",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setGender(initialGender || '');
    setPhone(initialPhone || '');
    setContractStartDate(initialContractStartDate ? new Date(initialContractStartDate) : undefined);
    setContractEndDate(initialContractEndDate ? new Date(initialContractEndDate) : undefined);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Uredi
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Spol</p>
            <p className="font-medium">
              {gender === 'male' ? 'Muško' : gender === 'female' ? 'Žensko' : '-'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Telefon</p>
            <p className="font-medium">{phone || '-'}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Datum početka</p>
            <p className="font-medium">
              {contractStartDate ? format(contractStartDate, 'dd.MM.yyyy', { locale: hr }) : '-'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Datum kraja</p>
            <p className="font-medium">
              {contractEndDate ? format(contractEndDate, 'dd.MM.yyyy', { locale: hr }) : '-'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}>
          <X className="h-4 w-4 mr-2" />
          Odustani
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Spremanje...' : 'Spremi'}
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Spol</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger>
              <SelectValue placeholder="Odaberi spol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Muško</SelectItem>
              <SelectItem value="female">Žensko</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Telefon</Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+385 91 234 5678"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Datum početka</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !contractStartDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {contractStartDate ? format(contractStartDate, 'dd.MM.yyyy', { locale: hr }) : "Odaberi datum"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={contractStartDate}
                onSelect={setContractStartDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label>Datum kraja</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !contractEndDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {contractEndDate ? format(contractEndDate, 'dd.MM.yyyy', { locale: hr }) : "Odaberi datum"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={contractEndDate}
                onSelect={setContractEndDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
