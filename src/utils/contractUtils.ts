import { differenceInDays, addMonths, isPast, isBefore } from "date-fns"

export interface ContractStatus {
  progress: number
  daysRemaining: number
  totalDays: number
  status: 'active' | 'warning' | 'critical' | 'expired' | 'not_started'
  statusText: string
  color: string
  bgColor: string
}

export function calculateContractProgress(
  startDate: string | null,
  contractDurationMonths: number | null,
  endDate: string | null
): ContractStatus {
  if (!startDate || !contractDurationMonths) {
    return {
      progress: 0,
      daysRemaining: 0,
      totalDays: 0,
      status: 'not_started',
      statusText: 'Ugovor nije započet',
      color: 'hsl(var(--muted-foreground))',
      bgColor: 'hsl(var(--muted))'
    }
  }

  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : addMonths(start, contractDurationMonths)
  const today = new Date()
  
  const totalDays = differenceInDays(end, start)
  const daysElapsed = differenceInDays(today, start)
  const daysRemaining = differenceInDays(end, today)
  
  const progress = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100)

  // Determine status
  let status: ContractStatus['status']
  let statusText: string
  let color: string
  let bgColor: string

  if (isPast(end)) {
    status = 'expired'
    statusText = 'Ugovor je istekao'
    color = 'hsl(var(--destructive))'
    bgColor = 'hsl(var(--destructive) / 0.1)'
  } else if (daysRemaining <= 7) {
    status = 'critical'
    statusText = `Ističe za ${daysRemaining} dana`
    color = 'hsl(var(--destructive))'
    bgColor = 'hsl(var(--destructive) / 0.1)'
  } else if (daysRemaining <= 30) {
    status = 'warning'
    statusText = `Ističe za ${daysRemaining} dana`
    color = 'hsl(35 91% 50%)'
    bgColor = 'hsl(35 91% 50% / 0.1)'
  } else if (isBefore(today, start)) {
    status = 'not_started'
    statusText = 'Ugovor još nije počeo'
    color = 'hsl(var(--muted-foreground))'
    bgColor = 'hsl(var(--muted))'
  } else {
    status = 'active'
    statusText = `Aktivna suradnja (${daysRemaining} dana)`
    color = 'hsl(142 76% 36%)'
    bgColor = 'hsl(142 76% 36% / 0.1)'
  }

  return {
    progress,
    daysRemaining: Math.max(daysRemaining, 0),
    totalDays,
    status,
    statusText,
    color,
    bgColor
  }
}

export function formatTimeRemaining(days: number): string {
  if (days <= 0) return 'Istekao'
  if (days === 1) return '1 dan'
  if (days < 30) return `${days} dana`
  
  const months = Math.floor(days / 30)
  const remainingDays = days % 30
  
  if (months === 1) {
    return remainingDays > 0 ? `1 mjesec i ${remainingDays} dana` : '1 mjesec'
  }
  
  return remainingDays > 0 
    ? `${months} mjeseci i ${remainingDays} dana`
    : `${months} mjeseci`
}

export function getContractTypeLabel(type: string | null): string {
  const labels = {
    'monthly': 'Mjesečni',
    'quarterly': 'Kvartalni', 
    'yearly': 'Godišnji',
    'custom': 'Prilagođeni'
  }
  return labels[type as keyof typeof labels] || 'Nepoznato'
}