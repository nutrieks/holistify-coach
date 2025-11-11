import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart, 
  Users, 
  TrendingUp, 
  Shield, 
  ClipboardCheck, 
  FileText, 
  Target,
  Star,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import logo from '@/assets/logo.png';

const Index = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();


  const steps = [
    {
      icon: ClipboardCheck,
      title: "Napredna nutritivna dijagnostika",
      description: "Detaljan upitnik koji analizira vaše zdravstveno stanje, prehrambene navike i metaboličke parametre"
    },
    {
      icon: FileText,
      title: "Personalizirani algoritmi",
      description: "Napredni algoritmi obrađuju vaše podatke i stvaraju individualni plan prilagođen isključivo vašim potrebama"
    },
    {
      icon: Target,
      title: "Precizno praćenje i optimizacija",
      description: "Kontinuirano praćenje napretka sa automatskom prilagodbom plana na temelju vaših rezultata"
    }
  ];

  const features = [
    {
      icon: Heart,
      title: "Holistički pristup",
      description: "Sveobuhvatan pristup zdravlju koji uključuje prehranu, trening i mentalno zdravlje"
    },
    {
      icon: Users,
      title: "Individualna analiza",
      description: "Napredni algoritmi za maksimalno prilagođenu prehranu na temelju vaših potreba"
    },
    {
      icon: TrendingUp,
      title: "Napredak u stvarnom vremenu",
      description: "Pratite svoj napredak kroz detaljne analize i grafove"
    },
    {
      icon: Shield,
      title: "Sigurno i privatno",
      description: "Vaši podaci su sigurni i privatni uz najnovije sigurnosne mjere"
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section with Food Background */}
      <div className="relative min-h-[90vh] flex items-center">
        {/* Background Food Image - Full Width Cover */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1920&h=1080&fit=crop" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Lighter Teal Overlay - More transparent */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-background/75 to-primary/20"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="mb-8 animate-fade-in flex justify-center">
              <img 
                src={logo} 
                alt="NutriEkspert Logo" 
                className="h-32 md:h-40 w-auto hover-scale"
              />
            </div>

            {/* Title with Subtle Glow */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-scale-in" style={{ textShadow: '0 0 30px hsl(var(--primary) / 0.3)' }}>
              NutriEkspert System
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/90 mb-6 animate-fade-in animate-delay-100">
              Napredna nutritivna dijagnostika i personalizirani algoritmi
            </p>
            
            <p className="text-lg text-muted-foreground mb-12 animate-fade-in animate-delay-200 max-w-2xl mx-auto">
              Platforma temeljena na znanstvenim algoritmima koji omogućuju maksimalnu individualnu prilagodbu 
              prehrane i treninga na temelju napredne nutritivne dijagnostike.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animate-delay-300">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 hover-scale" 
                style={{ boxShadow: '0 0 20px hsl(var(--primary) / 0.4)' }}
                onClick={() => navigate('/auth')}
              >
                Započnite odmah
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 hover-scale" 
                onClick={() => navigate('/auth')}
              >
                Saznajte više
              </Button>
            </div>
          </div>
        </div>
      </div>


      {/* How It Works Section */}
      <HowItWorksSection steps={steps} />
      
      {/* Features Section - Enhanced */}
      <FeaturesSection features={features} />


      {/* CTA Section - Enhanced */}
      <CTASection navigate={navigate} />

      {/* Footer - Enhanced */}
      <footer className="border-t border-primary/20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-2">
              <img 
                src={logo} 
                alt="NutriEkspert Logo" 
                className="h-16 w-auto mb-4"
              />
              <p className="text-muted-foreground mb-4">
                Platforma za naprednu nutritivnu dijagnostiku. 
                Personalizirani algoritmi za maksimalnu individualnu prilagodbu.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Brzi linkovi</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="/auth" className="hover:text-primary transition-colors">Prijava</a></li>
                <li><a href="/auth" className="hover:text-primary transition-colors">Registracija</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">O nama</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Kontakt</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Pravne informacije</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Uvjeti korištenja</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Politika privatnosti</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-border/50 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 NutriEkspert System. Sva prava zadržana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Separate animated sections components
const HowItWorksSection = ({ steps }: { steps: any[] }) => {
  const { elementRef, isVisible } = useScrollAnimation();
  
  return (
    <div ref={elementRef} className="container mx-auto px-4 py-20">
      <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <Badge className="mb-4" style={{ boxShadow: '0 0 15px hsl(var(--primary) / 0.3)' }}>Znanstveni pristup</Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Kako to funkcionira?</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Napredna tehnologija i algoritmi za maksimalnu personalizaciju vaše prehrane
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div 
              key={index}
              className={`flex flex-col md:flex-row gap-6 mb-12 transition-all duration-700 delay-${index * 100}`}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : `translateX(${index % 2 === 0 ? '-50px' : '50px'})`,
                transitionDelay: `${index * 150}ms`
              }}
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline">Korak {index + 1}</Badge>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                </div>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block w-px bg-gradient-to-b from-primary/50 to-transparent h-20 ml-8"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FeaturesSection = ({ features }: { features: any[] }) => {
  const { elementRef, isVisible } = useScrollAnimation();
  
  return (
    <div ref={elementRef} className="relative py-20">
      {/* Background Food Image - Full Width */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=1920&h=1080&fit=crop" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/85 to-background/90"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Zašto odabrati nas?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Platforma temeljena na znanosti, tehnologiji i individualnom pristupu svakom korisniku
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="text-center hover-scale border-primary/20 transition-all duration-700"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4 border border-primary/20">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const CTASection = ({ navigate }: { navigate: any }) => {
  const { elementRef, isVisible } = useScrollAnimation();
  
  return (
    <div ref={elementRef} className="relative py-20 overflow-hidden">
      {/* Background Food Image - Full Width */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1920&h=1080&fit=crop" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20"></div>
      <div className="absolute inset-0 bg-background/70"></div>
      
      <div className={`container mx-auto px-4 text-center relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ textShadow: '0 0 30px hsl(var(--primary) / 0.3)' }}>
          Spremni ste započeti?
        </h2>
        <p className="text-lg text-foreground/90 mb-8 max-w-2xl mx-auto">
          Iskusite naprednu nutritivnu dijagnostiku i personalizirane algoritme 
          koji će transformirati vaš pristup prehrani i zdravlju
        </p>
        <Button 
          size="lg" 
          className="text-xl px-12 py-7 hover-scale" 
          style={{ boxShadow: '0 0 25px hsl(var(--primary) / 0.4)' }}
          onClick={() => navigate('/auth')}
        >
          <CheckCircle2 className="mr-2 h-6 w-6" />
          Započnite danas
        </Button>
      </div>
    </div>
  );
};

export default Index;