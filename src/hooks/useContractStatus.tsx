import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { calculateContractProgress, type ContractStatus } from "@/utils/contractUtils"

export function useContractStatus(clientId: string) {
  const { data: contractData, isLoading } = useQuery({
    queryKey: ['contract-status', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('start_date, end_date, contract_duration_months, contract_type, status')
        .eq('client_id', clientId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!clientId
  })

  const contractStatus: ContractStatus | null = contractData 
    ? calculateContractProgress(
        contractData.start_date,
        contractData.contract_duration_months,
        contractData.end_date
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
          client_id,
          start_date,
          end_date,
          contract_duration_months,
          contract_type,
          status,
          client_profile:profiles!clients_client_id_fkey (
            full_name
          )
        `)
        .eq('status', 'active')

      if (error) throw error
      return data
    }
  })

  const contractsWithStatus = contractsData?.map(contract => ({
    ...contract,
    contractStatus: calculateContractProgress(
      contract.start_date,
      contract.contract_duration_months,
      contract.end_date
    )
  }))

  const expiringContracts = contractsWithStatus?.filter(
    contract => contract.contractStatus.status === 'warning' || contract.contractStatus.status === 'critical'
  )

  return {
    contractsWithStatus,
    expiringContracts,
    isLoading
  }
}