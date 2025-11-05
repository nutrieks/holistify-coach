import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

export function useClientActions() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const archiveClient = async (userId: string, fullName: string) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('clients')
        .update({ 
          is_archived: true,
          archived_at: new Date().toISOString(),
          archived_by: user?.id
        })
        .eq('user_id', userId)

      if (error) throw error

      toast({
        title: "Uspješno",
        description: `Klijent ${fullName} je arhiviran`,
      })

      return true
    } catch (error: any) {
      toast({
        title: "Greška",
        description: error.message || "Neuspješno arhiviranje klijenta",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const unarchiveClient = async (userId: string, fullName: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          is_archived: false,
          archived_at: null,
          archived_by: null
        })
        .eq('user_id', userId)

      if (error) throw error

      toast({
        title: "Uspješno",
        description: `Klijent ${fullName} je reaktiviran`,
      })

      return true
    } catch (error: any) {
      toast({
        title: "Greška",
        description: error.message || "Neuspješno reaktiviranje klijenta",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteClient = async (userId: string, fullName: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.functions.invoke('delete-client', {
        body: { clientUserId: userId }
      })

      if (error) throw error

      toast({
        title: "Uspješno",
        description: `Klijent ${fullName} je trajno obrisan`,
      })

      navigate('/admin/clients')
      return true
    } catch (error: any) {
      toast({
        title: "Greška",
        description: error.message || "Neuspješno brisanje klijenta",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    archiveClient,
    unarchiveClient,
    deleteClient,
    loading
  }
}
