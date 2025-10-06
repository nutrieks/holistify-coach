import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, AlertTriangle, TrendingUp, FileText } from "lucide-react";
import { NAQScoringEngine } from "@/utils/naqScoringEngine";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface ClientNAQOverview {
  clientId: string;
  clientName: string;
  latestSubmissionDate: string;
  overallBurden: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  totalSubmissions: number;
}

export function CoachNAQDashboard() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<string>("burden");

  const { data: clientsOverview, isLoading } = useQuery({
    queryKey: ['coach-naq-overview', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get all clients for this coach
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('user_id, full_name');

      if (clientsError) throw clientsError;

      const clientsOverview: ClientNAQOverview[] = [];

      for (const client of clients) {
        // Get latest submission via client_submissions
        const { data: latestSubmission } = await supabase
          .from('client_submissions')
          .select('id, created_at')
          .eq('client_id', client.user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (latestSubmission) {
          // Get all scores for the latest submission
          const { data: scores } = await supabase
            .from('questionnaire_scores')
            .select('*')
            .eq('submission_id', latestSubmission.id);

          if (scores && scores.length > 0) {
            // Calculate overall burden
            const totalQuestions = scores.reduce((sum, score) => sum + (score.max_score / 3), 0);
            const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
            const overallBurden = totalScore / totalQuestions;

            // Count severity levels (replaces priority_level)
            const highPriorityCount = scores.filter(s => s.severity_level === 'high').length;
            const mediumPriorityCount = scores.filter(s => s.severity_level === 'medium').length;

            // Get total submissions count
            const { data: allSubmissions } = await supabase
              .from('client_submissions')
              .select('id')
              .eq('client_id', client.user_id);
            
            const uniqueSubmissions = allSubmissions?.length || 0;

            clientsOverview.push({
              clientId: client.user_id,
              clientName: client.full_name || 'Nepoznat klijent',
              latestSubmissionDate: latestSubmission.created_at.split('T')[0],
              overallBurden: Math.round(overallBurden * 100) / 100,
              highPriorityCount,
              mediumPriorityCount,
              totalSubmissions: uniqueSubmissions
            });
          }
        }
      }

      return clientsOverview;
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return <div className="text-center py-8">Učitavanje NAQ pregleda...</div>;
  }

  if (!clientsOverview || clientsOverview.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nema klijenata sa NAQ rezultatima.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort clients based on selected criteria
  const sortedClients = [...clientsOverview].sort((a, b) => {
    switch (sortBy) {
      case 'burden':
        return b.overallBurden - a.overallBurden;
      case 'priority':
        return b.highPriorityCount - a.highPriorityCount;
      case 'name':
        return a.clientName.localeCompare(b.clientName);
      case 'date':
        return new Date(b.latestSubmissionDate).getTime() - new Date(a.latestSubmissionDate).getTime();
      default:
        return 0;
    }
  });

  // Prepare chart data
  const chartData = sortedClients.map(client => ({
    name: client.clientName.length > 10 ? client.clientName.substring(0, 10) + "..." : client.clientName,
    fullName: client.clientName,
    burden: Math.round(client.overallBurden * 100),
    highPriority: client.highPriorityCount,
    mediumPriority: client.mediumPriorityCount
  }));

  const chartConfig = {
    burden: {
      label: "Ukupni Teret (%)",
      color: "hsl(var(--primary))",
    },
    highPriority: {
      label: "Visoki Prioritet",
      color: "hsl(var(--destructive))",
    },
  };

  // Calculate summary statistics
  const totalClients = clientsOverview.length;
  const avgBurden = clientsOverview.reduce((sum, c) => sum + c.overallBurden, 0) / totalClients;
  const totalHighPriority = clientsOverview.reduce((sum, c) => sum + c.highPriorityCount, 0);
  const clientsNeedingAttention = clientsOverview.filter(c => c.highPriorityCount > 0 || c.overallBurden > 0.7).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Ukupno Klijenata</p>
                <p className="text-2xl font-bold">{totalClients}</p>
                <p className="text-xs text-muted-foreground">sa NAQ rezultatima</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Prosječni Teret</p>
                <p className="text-2xl font-bold">{Math.round(avgBurden * 100)}%</p>
                <p className="text-xs text-muted-foreground">svih klijenata</p>
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
                <p className="text-2xl font-bold text-red-600">{totalHighPriority}</p>
                <p className="text-xs text-muted-foreground">ukupno sekcija</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Potrebna Pažnja</p>
                <p className="text-2xl font-bold text-orange-600">{clientsNeedingAttention}</p>
                <p className="text-xs text-muted-foreground">klijenata</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Pregled</TabsTrigger>
          <TabsTrigger value="charts">Grafici</TabsTrigger>
          <TabsTrigger value="clients">Klijenti</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>NAQ Pregled - Svi Klijenti</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px]">
                <BarChart data={chartData} margin={{ bottom: 60 }}>
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value, name, entry) => [
                        name === 'burden' ? `${value}%` : value,
                        name === 'burden' ? 'Ukupni Teret' : 'Visoki Prioritet'
                      ]}
                      labelFormatter={(label, payload) => 
                        payload?.[0]?.payload?.fullName || label
                      }
                    />} 
                  />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis />
                  <Bar dataKey="burden" fill="hsl(var(--primary))" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>NAQ Prioriteti po Klijentima</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px]">
                <BarChart data={chartData}>
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value, name, entry) => [
                        value,
                        name === 'highPriority' ? 'Visoki Prioritet' : 'Srednji Prioritet'
                      ]}
                      labelFormatter={(label, payload) => 
                        payload?.[0]?.payload?.fullName || label
                      }
                    />} 
                  />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis />
                  <Bar dataKey="highPriority" fill="hsl(var(--destructive))" />
                  <Bar dataKey="mediumPriority" fill="hsl(var(--secondary))" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Detalji o Klijentima</h3>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="burden">Sortirati po teretu</SelectItem>
                <SelectItem value="priority">Sortirati po prioritetu</SelectItem>
                <SelectItem value="name">Sortirati po imenu</SelectItem>
                <SelectItem value="date">Sortirati po datumu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {sortedClients.map(client => (
              <Card key={client.clientId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{client.clientName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Posljednja procjena: {client.latestSubmissionDate}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ukupno procjena: {client.totalSubmissions}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {Math.round(client.overallBurden * 100)}%
                        </p>
                        <p className="text-xs text-muted-foreground">ukupni teret</p>
                      </div>
                      
                      <div className="flex flex-col space-y-1">
                        {client.highPriorityCount > 0 && (
                          <Badge variant="destructive">
                            {client.highPriorityCount} visoki prioritet
                          </Badge>
                        )}
                        {client.mediumPriorityCount > 0 && (
                          <Badge variant="secondary">
                            {client.mediumPriorityCount} srednji prioritet
                          </Badge>
                        )}
                        {client.highPriorityCount === 0 && client.mediumPriorityCount === 0 && (
                          <Badge variant="outline">Nema prioriteta</Badge>
                        )}
                      </div>
                      
                      <Button variant="outline" size="sm">
                        Detaljnije
                      </Button>
                    </div>
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