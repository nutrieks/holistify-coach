import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { calculateContractProgress, type ContractStatus } from "@/utils/contractUtils"

export function useContractStatus(clientId: string) {
  const { data: contractData, isLoading } = useQuery({
    queryKey: ['contract-status', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('contract_start_date, contract_end_date')
        .eq('user_id', clientId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!clientId
  })

  // Simplified - just return basic contract info
  const contractStatus: ContractStatus | null = contractData && contractData.contract_start_date
    ? calculateContractProgress(
        contractData.contract_start_date,
        null,
        contractData.contract_end_date
      )
    : null

  return {
    contractData,
    contractStatus,
    isLoading
  }
}

export function useAllContractsStatus() {
  const { data: contractsData, isLoading } = useQuery({
    queryKey: ['all-contracts-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          user_id,
          contract_start_date,
          contract_end_date,
          full_name
        `)

      if (error) throw error
      return data
    }
  })

  const contractsWithStatus = contractsData?.map(contract => ({
    ...contract,
    contractStatus: contract.contract_start_date ? calculateContractProgress(
      contract.contract_start_date,
      null,
      contract.contract_end_date
    ) : null
  }))

  const expiringContracts = contractsWithStatus?.filter(
    contract => contract.contractStatus && (contract.contractStatus.status === 'warning' || contract.contractStatus.status === 'critical')
  )

  return {
    contractsWithStatus,
    expiringContracts,
    isLoading
  }
}