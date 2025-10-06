import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, ExternalLink } from "lucide-react"
import { useAllContractsStatus } from "@/hooks/useContractStatus"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { formatTimeRemaining } from "@/utils/contractUtils"
import { useNavigate } from "react-router-dom"

export function ContractsExpiringWidget() {
  const { expiringContracts, isLoading } = useAllContractsStatus()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg">Ugovori koji ističu</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!expiringContracts || expiringContracts.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Nema ugovora koji uskoro ističu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expiringContracts.slice(0, 5).map((contract) => (
              <div 
                key={contract.user_id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">
                        {contract.full_name || 'Nepoznato ime'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTimeRemaining(contract.contractStatus.daysRemaining)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline"
                    style={{
                      borderColor: contract.contractStatus.color,
                      color: contract.contractStatus.color,
                      backgroundColor: contract.contractStatus.bgColor
                    }}
                  >
                    {contract.contractStatus.status === 'critical' ? 'Kritično' : 'Upozorenje'}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(`/admin/clients/${contract.user_id}`)}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {expiringContracts.length > 5 && (
              <div className="text-center pt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/admin/clients')}
                >
                  Pogledaj sve ({expiringContracts.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}