import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { NAQRadarChart } from "./NAQRadarChart";
import { NAQProgressChart } from "./NAQProgressChart";
import { NAQComparisonChart } from "./NAQComparisonChart";
import { NAQTrendIndicator, NAQOverallTrend } from "./NAQTrendIndicator";
import { useClientNAQHistory } from "@/hooks/useNAQScoring";
import { NAQScoringEngine } from "@/utils/naqScoringEngine";
import { useState } from "react";
import { Activity, TrendingUp, AlertTriangle, Target } from "lucide-react";

interface NAQAnalyticsProps {
  clientId: string;
}

export function NAQAnalytics({ clientId }: NAQAnalyticsProps) {
  const { data: naqHistory, isLoading } = useClientNAQHistory(clientId);
  const [selectedSection, setSelectedSection] = useState<string>("Ukupni Teret");

  if (isLoading) {
    return <div className="text-center py-8">Učitavanje NAQ analitike...</div>;
  }

  if (!naqHistory || naqHistory.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nema dostupnih NAQ podataka za analizu.</p>
        </CardContent>
      </Card>
    );
  }

  const latest = naqHistory[0];
  const previous = naqHistory[1];
  
  // Calculate overall burden for latest
  const latestOverallBurden = latest.scores.reduce((sum, score) => sum + score.totalScore, 0) / 
    latest.scores.reduce((sum, score) => sum + (score.maxPossibleScore / 3), 0);
  
  const previousOverallBurden = previous ? 
    previous.scores.reduce((sum, score) => sum + score.totalScore, 0) / 
    previous.scores.reduce((sum, score) => sum + (score.maxPossibleScore / 3), 0) : undefined;

  const highPriorityCount = latest.scores.filter(s => s.priorityLevel === 'high').length;
  const mediumPriorityCount = latest.scores.filter(s => s.priorityLevel === 'medium').length;

  const sectionOptions = [
    "Ukupni Teret",
    ...latest.scores.map(s => s.sectionName)
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Ukupni Teret</p>
                <p className="text-2xl font-bold">{Math.round(latestOverallBurden * 100)}%</p>
                <NAQOverallTrend 
                  currentOverallBurden={latestOverallBurden}
                  previousOverallBurden={previousOverallBurden}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Visoki Prioritet</p>
                <p className="text-2xl font-bold text-red-600">{highPriorityCount}</p>
                <p className="text-xs text-muted-foreground">sekcija</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Srednji Prioritet</p>
                <p className="text-2xl font-bold text-yellow-600">{mediumPriorityCount}</p>
                <p className="text-xs text-muted-foreground">sekcija</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Broj Procjena</p>
                <p className="text-2xl font-bold">{naqHistory.length}</p>
                <p className="text-xs text-muted-foreground">ukupno</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Pregled</TabsTrigger>
          <TabsTrigger value="progress">Napredak</TabsTrigger>
          <TabsTrigger value="comparison">Poređenje</TabsTrigger>
          <TabsTrigger value="details">Detalji</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NAQRadarChart scores={latest.scores} />
            <Card>
              <CardHeader>
                <CardTitle>Prioritetne Sekcije</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {latest.scores
                    .filter(s => s.priorityLevel !== 'low')
                    .sort((a, b) => {
                      if (a.priorityLevel === 'high' && b.priorityLevel !== 'high') return -1;
                      if (b.priorityLevel === 'high' && a.priorityLevel !== 'high') return 1;
                      return b.symptomBurden - a.symptomBurden;
                    })
                    .map(score => (
                      <div key={score.sectionName} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{score.sectionName}</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.round(score.symptomBurden * 100)}% teret
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={score.priorityLevel === 'high' ? 'destructive' : 'secondary'}>
                            {NAQScoringEngine.getPriorityLabel(score.priorityLevel)}
                          </Badge>
                          <NAQTrendIndicator 
                            currentScore={score}
                            previousScore={previous?.scores.find(p => p.sectionName === score.sectionName)}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium">Sekcija:</label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sectionOptions.map(section => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <NAQProgressChart 
            data={naqHistory} 
            sectionName={selectedSection}
          />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          {previous ? (
            <NAQComparisonChart 
              currentScores={latest.scores}
              previousScores={previous.scores}
              title={`Poređenje: ${latest.submissionDate} vs ${previous.submissionDate}`}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Potrebne su najmanje dvije procjene za poređenje.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4">
            {naqHistory.map((submission, index) => (
              <Card key={submission.submissionId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Procjena #{naqHistory.length - index}</span>
                    <span className="text-sm text-muted-foreground">
                      {submission.submissionDate}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {submission.scores.map(score => (
                      <div key={score.sectionName} className="p-3 border rounded">
                        <p className="text-sm font-medium truncate" title={score.sectionName}>
                          {score.sectionName}
                        </p>
                        <p className="text-lg font-bold">
                          {Math.round(score.symptomBurden * 100)}%
                        </p>
                        <Badge 
                          variant={score.priorityLevel === 'high' ? 'destructive' : 
                                 score.priorityLevel === 'medium' ? 'secondary' : 'outline'}
                        >
                          {NAQScoringEngine.getPriorityLabel(score.priorityLevel)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}