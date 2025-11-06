import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const {
    signUp,
    signIn,
    resetPassword
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const fullName = formData.get('fullName') as string;
    const role = formData.get('role') as 'admin' | 'client';
    if (password !== confirmPassword) {
      setError('Lozinke se ne slažu');
      setIsLoading(false);
      return;
    }
    const {
      error
    } = await signUp(email, password, role, fullName);
    if (error) {
      if (error.message.includes('User already registered')) {
        setError('Korisnik je već registriran. Pokušajte se prijaviti.');
      } else {
        setError(error.message);
      }
    } else {
      toast({
        title: "Registracija uspješna! 📧",
        description: "Provjerite svoj email za link za potvrdu registracije. Email može biti u spam folderu.",
        duration: 8000
      });
      // Ne navigiramo nigdje - korisnik mora potvrditi email
    }
    setIsLoading(false);
  };
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
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Prijava</TabsTrigger>
              <TabsTrigger value="signup">Registracija</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
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
                    {isLoading ? 'Prijavljujem...' : 'Prijaviť se'}
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
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <Alert className="mb-4 border-blue-200 bg-slate-950">
                <AlertDescription className="text-sm">
                  📧 Nakon registracije primit ćete email s linkom za potvrdu. Provjerite spam folder ako email ne stigne za nekoliko minuta.
                </AlertDescription>
              </Alert>
              
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">Puno ime</Label>
                  <Input id="signup-fullname" name="fullName" type="text" placeholder="Ana Anić" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" placeholder="vaš@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Lozinka</Label>
                  <Input id="signup-password" name="password" type="password" placeholder="••••••••" required minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Potvrdi lozinku</Label>
                  <Input id="signup-confirm" name="confirmPassword" type="password" placeholder="••••••••" required minLength={6} />
                </div>
                <div className="space-y-3">
                  <Label>Tip korisnika</Label>
                  <RadioGroup defaultValue="client" name="role">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="client" id="client" />
                      <Label htmlFor="client">Klijent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admin" id="admin" />
                      <Label htmlFor="admin">Trener/Nutricionist</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {error && <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>}
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Registriram...' : 'Registriraj se'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
};
export default Auth;