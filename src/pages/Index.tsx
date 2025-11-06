import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, TrendingUp, Shield } from 'lucide-react';
const Index = () => {
  const {
    user,
    profile
  } = useAuth();
  const navigate = useNavigate();

  const features = [{
    icon: Heart,
    title: "Holistički pristup",
    description: "Sveobuhvatan pristup zdravlju koji uključuje prehranu, trening i mentalno zdravlje"
  }, {
    icon: Users,
    title: "Personalizirano praćenje",
    description: "Individualni planovi prehrane i treninga prilagođeni vašim potrebama"
  }, {
    icon: TrendingUp,
    title: "Napredak u realnom vremenu",
    description: "Pratite svoj napredak kroz detaljne analize i grafove"
  }, {
    icon: Shield,
    title: "Sigurno i privatno",
    description: "Vaši podaci su sigurni i privatni sa najnovijim sigurnosnim mjerama"
  }];
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">NutriEkspert System</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Vaša platforma za cjelovito zdravlje i wellness
          </p>
          <p className="text-lg text-muted-foreground mb-12">
            Povezujemo nutricioniste, fitness trenere i njihove klijente u jedinstvenoj platformi 
            za praćenje i unapređenje holistického zdravlja.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate('/auth')}>Započnite odmah</Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => navigate('/auth')}>
              Saznajte više
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Zašto odabrati nas?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Naša platforma omogućuje vam potpunu kontrolu nad vašim zdravljem i wellness putovanjem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
          const Icon = feature.icon;
          return <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>;
        })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Spremni ste početi svoje putovanje?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Pridružite se tisućama zadovoljnih korisnika koji su već transformirali svoj način života
          </p>
          <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate('/auth')}>
            Registrirajte se besplatno
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Holistic Health Coach. Sva prava zadržana.</p>
        </div>
      </footer>
    </div>;
};
export default Index;