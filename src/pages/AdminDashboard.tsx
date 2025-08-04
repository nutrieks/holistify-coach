import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Calendar, TrendingUp, PlusCircle, Activity } from 'lucide-react';
import { AddClientModal } from '@/components/AddClientModal';

const AdminDashboard = () => {
  const [showAddModal, setShowAddModal] = useState(false)

  const stats = [
    {
      title: "Aktivni klijenti",
      value: "8",
      description: "Ukupno aktivnih klijenata",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Nove poruke",
      value: "12",
      description: "Nepročitanih poruka",
      icon: MessageSquare,
      color: "text-green-600"
    },
    {
      title: "Današnji termini",
      value: "3",
      description: "Zakazani sastanci",
      icon: Calendar,
      color: "text-orange-600"
    },
    {
      title: "Check-in-ovi",
      value: "5",
      description: "Čeka na pregled",
      icon: Activity,
      color: "text-purple-600"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      client: "Ana Anić",
      action: "Poslala novi check-in",
      time: "prije 2 sata",
      type: "checkin"
    },
    {
      id: 2,
      client: "Marko Marković",
      action: "Završio trening",
      time: "prije 4 sata",
      type: "workout"
    },
    {
      id: 3,
      client: "Petra Petrić",
      action: "Nova poruka",
      time: "prije 6 sati",
      type: "message"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Nedavne aktivnosti</CardTitle>
              <CardDescription>Najnovije aktivnosti vaših klijenata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.client}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Brze akcije</CardTitle>
              <CardDescription>Često korištene funkcije</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setShowAddModal(true)}
                >
                  <PlusCircle className="h-6 w-6" />
                  <span className="text-sm">Dodaj klijenta</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <MessageSquare className="h-6 w-6" />
                  <span className="text-sm">Poruke</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Kalendar</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-sm">Izvještaji</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Nadolazeći termini</CardTitle>
            <CardDescription>Današnji i sutrašnji raspored</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Ana Anić - Početna konzultacija</p>
                  <p className="text-sm text-muted-foreground">Danas u 14:00</p>
                </div>
                <Button variant="outline" size="sm">Pripremi</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Marko Marković - Mjesečni pregled</p>
                  <p className="text-sm text-muted-foreground">Danas u 16:30</p>
                </div>
                <Button variant="outline" size="sm">Pripremi</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Petra Petrić - Plan prehrane</p>
                  <p className="text-sm text-muted-foreground">Sutra u 10:00</p>
                </div>
                <Button variant="outline" size="sm">Pripremi</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Client Modal */}
        <AddClientModal 
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onClientAdded={() => {
            // Refresh dashboard data if needed
            console.log('Client added successfully')
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;