import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProgressData, DATE_RANGES } from "@/hooks/useProgressData";
import { ProgressChart } from "@/components/progress/ProgressChart";
import { EnergyMoodChart } from "@/components/progress/EnergyMoodChart";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyProgress() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState(30);
  
  const { data: progressData, isLoading } = useProgressData(user?.id || "", dateRange);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-8 w-48" />
          </div>
          
          {/* Date Range Skeleton */}
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-48" />
          </div>
          
          {/* Charts Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/client')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Povratak
          </Button>
          <h1 className="text-2xl font-semibold">Moj Napredak</h1>
        </div>

        {/* Date Range Filter */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Vremenski period:</span>
          </div>
          <Select value={dateRange.toString()} onValueChange={(value) => setDateRange(parseInt(value))}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((range) => (
                <SelectItem key={range.days} value={range.days.toString()}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Progress Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProgressChart
            data={progressData || []}
            title="Težina"
            dataKey="weight"
            color="hsl(var(--primary))"
            unit=" kg"
          />
          
          <ProgressChart
            data={progressData || []}
            title="Opseg Struka"
            dataKey="waist_circumference"
            color="hsl(var(--accent-foreground))"
            unit=" cm"
          />
          
          <div className="lg:col-span-2">
            <EnergyMoodChart data={progressData || []} />
          </div>
        </div>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sažetak Napretka</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {progressData?.filter(d => d.weight).length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Check-inova s težinom</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {progressData?.filter(d => d.waist_circumference).length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Mjerenja opsega</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {progressData?.filter(d => d.energy_level).length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Unosa energije</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {progressData?.filter(d => d.mood).length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Unosa raspoloženja</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/check-in')}>
            Novi Check-in
          </Button>
          <Button variant="outline" onClick={() => navigate('/client')}>
            Povratak na Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}