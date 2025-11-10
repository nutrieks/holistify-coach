import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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

  const features = [
    {
      icon: Heart,
      title: "Holistički pristup",
      description: "Sveobuhvatan pristup zdravlju koji uključuje prehranu, trening i mentalno zdravlje"
    },
    {
      icon: Users,
      title: "Personalizirano praćenje",
      description: "Individualni planovi prehrane i treninga prilagođeni vašim potrebama"
    },
    {
      icon: TrendingUp,
      title: "Napredak u realnom vremenu",
      description: "Pratite svoj napredak kroz detaljne analize i grafove"
    },
    {
      icon: Shield,
      title: "Sigurno i privatno",
      description: "Vaši podaci su sigurni i privatni sa najnovijim sigurnosnim mjerama"
    }
  ];

  const steps = [
    {
      icon: ClipboardCheck,
      title: "Registrujte se i ispunite upitnike",
      description: "Brza registracija i detaljan upitnik o vašem zdravlju i ciljevima"
    },
    {
      icon: FileText,
      title: "Dobijte personalizirani plan",
      description: "Stručnjaci kreiraju plan prehrane i treninga posebno za vas"
    },
    {
      icon: Target,
      title: "Pratite napredak i ostvarite ciljeve",
      description: "Real-time praćenje rezultata i prilagodba plana za maksimalan uspjeh"
    }
  ];

  const stats = [
    { number: "500+", label: "Zadovoljnih klijenata" },
    { number: "1000+", label: "Personaliziranih planova" },
    { number: "95%", label: "Stopa uspjeha" },
    { number: "24/7", label: "Podrška" }
  ];

  const testimonials = [
    {
      name: "Marija K.",
      rating: 5,
      text: "NutriEkspert mi je promijenio život! Izgubila sam 15kg i nikada se nisam osjećala bolje."
    },
    {
      name: "Ivan P.",
      rating: 5,
      text: "Profesionalan pristup i nevjerovatni rezultati. Konačno sam postigao svoje fitness ciljeve!"
    },
    {
      name: "Ana M.",
      rating: 5,
      text: "Najbolja investicija u moje zdravlje. Tim je stručan, a platforma jednostavna za korištenje."
    }
  ];

  const foodImages = [
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=300&fit=crop"
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section with Animated Gradient Background */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 animate-gradient-x"></div>
        <div className="absolute inset-0 neon-glow opacity-30"></div>
        
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

            {/* Title with Neon Glow */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 neon-glow-text animate-scale-in">
              NutriEkspert System
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/90 mb-6 animate-fade-in animate-delay-100">
              Vaša platforma za cjelovito zdravlje i wellness
            </p>
            
            <p className="text-lg text-muted-foreground mb-12 animate-fade-in animate-delay-200 max-w-2xl mx-auto">
              Povezujemo nutricioniste, fitness trenere i njihove klijente u jedinstvenoj platformi 
              za praćenje i unapređenje holističkog zdravlja.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animate-delay-300">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 neon-glow pulse-glow hover-scale" 
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

      {/* Stats Section */}
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="text-center card-neon animate-fade-in hover-scale"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="text-4xl md:text-5xl font-bold neon-glow-text mb-2 animate-count">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge className="mb-4 neon-glow">Jednostavno & Efektivno</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Kako funkcionira?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tri jednostavna koraka do vašeg personaliziranog plana zdravlja
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className="flex flex-col md:flex-row gap-6 mb-12 animate-fade-in animate-delay-200"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center card-neon">
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

      {/* Features Section - Enhanced */}
      <div className="bg-accent/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Zašto odabrati nas?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Naša platforma omogućuje vam potpunu kontrolu nad vašim zdravljem i wellness putovanjem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="text-center card-neon hover-scale animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4 neon-glow">
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

      {/* Food Gallery Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge className="mb-4 neon-glow">Zdravi & Ukusni Obroci</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Inspiracija za vašu prehranu</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ukusna i zdrava hrana koja vam pomaže da dostignete svoje ciljeve
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {foodImages.map((image, index) => (
            <div 
              key={index}
              className="relative aspect-[4/3] rounded-lg overflow-hidden hover-scale animate-fade-in group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img 
                src={image} 
                alt={`Healthy food ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 card-neon"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Što kažu naši klijenti?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pridružite se tisućama zadovoljnih korisnika koji su transformirali svoj život
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="card-neon animate-fade-in hover-scale"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section - Enhanced */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary animate-border"></div>
        <div className="absolute inset-0 neon-glow opacity-40"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 neon-glow-text animate-scale-in">
            Spremni ste početi svoje putovanje?
          </h2>
          <p className="text-lg text-foreground/90 mb-8 max-w-2xl mx-auto animate-fade-in">
            Pridružite se tisućama zadovoljnih korisnika koji su već transformirali svoj način života
          </p>
          <Button 
            size="lg" 
            className="text-xl px-12 py-7 neon-glow pulse-glow hover-scale animate-fade-in" 
            onClick={() => navigate('/auth')}
          >
            <CheckCircle2 className="mr-2 h-6 w-6" />
            Registrirajte se besplatno
          </Button>
        </div>
      </div>

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
                Vaša platforma za cjelovito zdravlje i wellness. 
                Personalizirani planovi prehrane i treninga.
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

export default Index;