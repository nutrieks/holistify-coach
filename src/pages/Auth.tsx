import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const {
    signIn,
    resetPassword
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const {
      error
    } = await signIn(email, password);
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Neispravni podaci za prijavu. Provjerite email i lozinku.');
      } else {
        setError(error.message);
      }
    } else {
      navigate('/dashboard');
    }
    setIsLoading(false);
  };
  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const {
      error
    } = await resetPassword(email);
    if (error) {
      setError(error.message);
    } else {
      toast({
        title: "Email poslan",
        description: "Provjerite email za link za resetiranje lozinke."
      });
      setShowForgotPassword(false);
    }
    setIsLoading(false);
  };
  return <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">NutriEkspert</CardTitle>
          <CardDescription>Dobrodošli na platformu za holistično zdravlje</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!showForgotPassword ? <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" name="email" type="email" placeholder="vaš@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Lozinka</Label>
                  <Input id="signin-password" name="password" type="password" placeholder="••••••••" required />
                </div>
                
                {error && <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>}
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Prijavljujem...' : 'Prijavi se'}
                </Button>
                
                <Button type="button" variant="link" className="w-full" onClick={() => setShowForgotPassword(true)}>
                  Zaboravili ste lozinku?
                </Button>
              </form> : <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input id="reset-email" name="email" type="email" placeholder="vaš@email.com" required />
                </div>
                
                {error && <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>}
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Šaljem...' : 'Pošalji link za resetiranje'}
                </Button>
                
                <Button type="button" variant="link" className="w-full" onClick={() => setShowForgotPassword(false)}>
                  Natrag na prijavu
                </Button>
              </form>}

            <Alert className="mt-6 border-primary/20 bg-primary/5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Klijenti dobivaju pristup platformi preko pozivnice od savjetnika.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Auth;