import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { useContractStatus } from "@/hooks/useContractStatus"
import { formatTimeRemaining } from "@/utils/contractUtils"

interface ContractProgressBarProps {
  clientId: string
  showLabel?: boolean
}

export function ContractProgressBar({ clientId, showLabel = true }: ContractProgressBarProps) {
  const { contractStatus, isLoading } = useContractStatus(clientId)

  if (isLoading || !contractStatus) {
    return (
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded animate-pulse" />
        {showLabel && <div className="h-4 w-20 bg-muted rounded animate-pulse" />}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Progress 
        value={contractStatus.progress} 
        className="h-2"
        style={{
          backgroundColor: 'hsl(var(--muted))'
        }}
      />
      {showLabel && (
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className="text-xs"
            style={{
              borderColor: contractStatus.color,
              color: contractStatus.color,
              backgroundColor: contractStatus.bgColor
            }}
          >
            {contractStatus.status === 'expired' ? 'Istekao' : 
             contractStatus.status === 'critical' ? 'Kritično' :
             contractStatus.status === 'warning' ? 'Upozorenje' :
             contractStatus.status === 'not_started' ? 'Nije počeo' : 'Aktivan'}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatTimeRemaining(contractStatus.daysRemaining)}</span>
          </div>
        </div>
      )}
    </div>
  )
}