import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Calendar, AlertTriangle } from "lucide-react"
import { useContractStatus } from "@/hooks/useContractStatus"
import { formatTimeRemaining, getContractTypeLabel } from "@/utils/contractUtils"
import { LoadingSpinner } from "@/components/LoadingSpinner"

interface ContractStatusCardProps {
  clientId: string
  variant?: 'default' | 'compact'
}

export function ContractStatusCard({ clientId, variant = 'default' }: ContractStatusCardProps) {
  const { contractData, contractStatus, isLoading } = useContractStatus(clientId)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (!contractStatus || !contractData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Suradnje</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Podaci o ugovoru nisu dostupni</p>
        </CardContent>
      </Card>
    )
  }

  const isCompact = variant === 'compact'

  return (
    <Card>
      <CardHeader className={isCompact ? "pb-3" : undefined}>
        <div className="flex items-center justify-between">
          <CardTitle className={isCompact ? "text-base" : "text-lg"}>
            Status Suradnje
          </CardTitle>
          {contractStatus.status === 'critical' && (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Circle for Compact, Bar for Default */}
        {isCompact ? (
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={contractStatus.color}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${contractStatus.progress * 2.83} 283`}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium">
                  {Math.round(contractStatus.progress)}%
                </span>
              </div>
            </div>
            <div className="flex-1">
              <Badge 
                variant="outline" 
                style={{ 
                  borderColor: contractStatus.color,
                  color: contractStatus.color,
                  backgroundColor: contractStatus.bgColor
                }}
              >
                {contractStatus.statusText}
              </Badge>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Napredak</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(contractStatus.progress)}%
                </span>
              </div>
              <Progress 
                value={contractStatus.progress} 
                className="h-2"
                style={{
                  background: 'hsl(var(--muted))'
                }}
              />
            </div>

            <div 
              className="p-3 rounded-lg border"
              style={{ 
                borderColor: contractStatus.color,
                backgroundColor: contractStatus.bgColor
              }}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: contractStatus.color }} />
                <span className="font-medium" style={{ color: contractStatus.color }}>
                  {contractStatus.statusText}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Contract Details */}
        {!isCompact && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Tip ugovora</p>
                <p className="font-medium">
                  {getContractTypeLabel(contractData.contract_type)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Preostalo vrijeme</p>
                <p className="font-medium">
                  {formatTimeRemaining(contractStatus.daysRemaining)}
                </p>
              </div>
            </div>
          </div>
        )}

        {contractData.start_date && !isCompact && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Početak: {new Date(contractData.start_date).toLocaleDateString('hr-HR')}
            {contractData.end_date && (
              <> • Kraj: {new Date(contractData.end_date).toLocaleDateString('hr-HR')}</>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}