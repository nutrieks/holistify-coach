import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const SetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        // Supabase automatski prepoznaje recovery session iz URL-a
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('No recovery session found:', userError);
          setError('Link je istekao ili nije validan. Molimo kontaktirajte svog coach-a.');
          setCheckingSession(false);
          return;
        }

        setEmail(user.email || '');
        setCheckingSession(false);
      } catch (err) {
        console.error('Error checking recovery session:', err);
        setError('Greška pri učitavanju. Molimo pokušajte ponovo.');
        setCheckingSession(false);
      }
    };

    checkRecoverySession();
  }, []);

  const handleSetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Lozinke se ne slažu');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Lozinka mora imati najmanje 6 karaktera');
      setIsLoading(false);
      return;
    }

    try {
      // Postavi novu lozinku i authenticira korisnika
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (updateError) {
        console.error('Error setting password:', updateError);
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      toast({
        title: "Lozinka postavljena! ✅",
        description: "Dobrodošli u aplikaciju.",
      });

      // Redirect na client dashboard
      navigate('/client');
    } catch (err) {
      console.error('Error in setPassword:', err);
      setError('Greška pri postavljanju lozinke. Molimo pokušajte ponovo.');
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-lg">Učitavam...</div>
      </div>
    );
  }

  if (error && !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Link Istekao</CardTitle>
            <CardDescription>Nažalost, ovaj link više nije validan</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              className="w-full mt-4" 
              onClick={() => navigate('/auth')}
            >
              Natrag na prijavu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Dobrodošli! 🎯</CardTitle>
          <CardDescription>
            Postavite Vašu Lozinku
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm">
              Vaš coach je kreirao račun za vas. Odaberite lozinku za pristup aplikaciji.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Nova Lozinka</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Minimalno 6 karaktera
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potvrdi Lozinku</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Postavljam...' : 'Postavi Lozinku i Pristupi →'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetPassword;
