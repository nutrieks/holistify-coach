import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface UseAsyncOperationOptions {
  successMessage?: string
  errorMessage?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useAsyncOperation(options: UseAsyncOperationOptions = {}) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const execute = async <T,>(
    asyncFunction: () => Promise<T>,
    customOptions?: Partial<UseAsyncOperationOptions>
  ): Promise<T | null> => {
    const finalOptions = { ...options, ...customOptions }
    
    setLoading(true)
    try {
      const result = await asyncFunction()
      
      if (finalOptions.successMessage) {
        toast({
          title: "Uspjeh",
          description: finalOptions.successMessage,
        })
      }
      
      finalOptions.onSuccess?.()
      return result
    } catch (error) {
      const errorMessage = finalOptions.errorMessage || 
        (error instanceof Error ? error.message : "Dogodila se greška")
      
      toast({
        title: "Greška",
        description: errorMessage,
        variant: "destructive",
      })
      
      finalOptions.onError?.(error as Error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { execute, loading }
}