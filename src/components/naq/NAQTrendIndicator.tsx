import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { NAQScore } from "@/utils/naqScoringEngine";

interface NAQTrendIndicatorProps {
  currentScore: NAQScore;
  previousScore?: NAQScore;
  className?: string;
}

export function NAQTrendIndicator({ 
  currentScore, 
  previousScore, 
  className = "" 
}: NAQTrendIndicatorProps) {
  if (!previousScore) {
    return (
      <Badge variant="outline" className={className}>
        <Minus className="w-3 h-3 mr-1" />
        Nova sekcija
      </Badge>
    );
  }

  const change = currentScore.symptomBurden - previousScore.symptomBurden;
  const changePercent = Math.round(change * 100);

  if (Math.abs(changePercent) < 5) {
    return (
      <Badge variant="outline" className={className}>
        <Minus className="w-3 h-3 mr-1" />
        Stabilno
      </Badge>
    );
  }

  if (change > 0) {
    // Worsening - higher burden is bad
    return (
      <Badge variant="destructive" className={className}>
        <TrendingUp className="w-3 h-3 mr-1" />
        +{changePercent}%
      </Badge>
    );
  }

  // Improving - lower burden is good
  return (
    <Badge variant="secondary" className={`${className} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100`}>
      <TrendingDown className="w-3 h-3 mr-1" />
      {changePercent}%
    </Badge>
  );
}

interface NAQOverallTrendProps {
  currentOverallBurden: number;
  previousOverallBurden?: number;
  className?: string;
}

export function NAQOverallTrend({ 
  currentOverallBurden, 
  previousOverallBurden, 
  className = "" 
}: NAQOverallTrendProps) {
  if (!previousOverallBurden) {
    return (
      <div className={`flex items-center ${className}`}>
        <Minus className="w-4 h-4 mr-2 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Prva procjena</span>
      </div>
    );
  }

  const change = currentOverallBurden - previousOverallBurden;
  const changePercent = Math.round(change * 100) / 100;

  if (Math.abs(changePercent) < 0.1) {
    return (
      <div className={`flex items-center ${className}`}>
        <Minus className="w-4 h-4 mr-2 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Stabilno ({changePercent >= 0 ? '+' : ''}{changePercent})
        </span>
      </div>
    );
  }

  if (change > 0) {
    return (
      <div className={`flex items-center ${className}`}>
        <TrendingUp className="w-4 h-4 mr-2 text-red-600" />
        <span className="text-sm text-red-600">
          Pogoršanje (+{changePercent})
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <TrendingDown className="w-4 h-4 mr-2 text-green-600" />
      <span className="text-sm text-green-600">
        Poboljšanje ({changePercent})
      </span>
    </div>
  );
}