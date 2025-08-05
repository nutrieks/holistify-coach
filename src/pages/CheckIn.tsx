import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const checkInSchema = z.object({
  weight: z.string().optional(),
  waistCircumference: z.string().optional(),
  energyLevel: z.number().min(1).max(10).default(5),
  mood: z.number().min(1).max(10).default(5),
  notes: z.string().optional(),
});

type CheckInFormData = z.infer<typeof checkInSchema>;

const CheckIn = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      weight: '',
      waistCircumference: '',
      energyLevel: 5,
      mood: 5,
      notes: '',
    },
  });

  const onSubmit = async (data: CheckInFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const progressEntries = [];
      const today = new Date().toISOString().split('T')[0];

      // Add weight entry if provided
      if (data.weight && data.weight.trim()) {
        progressEntries.push({
          client_id: user.id,
          date: today,
          metric_type: 'weight',
          value: data.weight.trim(),
        });
      }

      // Add waist circumference entry if provided
      if (data.waistCircumference && data.waistCircumference.trim()) {
        progressEntries.push({
          client_id: user.id,
          date: today,
          metric_type: 'waist_circumference',
          value: data.waistCircumference.trim(),
        });
      }

      // Add energy level entry
      progressEntries.push({
        client_id: user.id,
        date: today,
        metric_type: 'energy_level',
        value: data.energyLevel.toString(),
      });

      // Add mood entry
      progressEntries.push({
        client_id: user.id,
        date: today,
        metric_type: 'mood',
        value: data.mood.toString(),
      });

      // Add notes entry if provided
      if (data.notes && data.notes.trim()) {
        progressEntries.push({
          client_id: user.id,
          date: today,
          metric_type: 'notes',
          value: data.notes.trim(),
        });
      }

      // Insert all entries
      if (progressEntries.length > 0) {
        const { error } = await supabase
          .from('progress_tracking')
          .insert(progressEntries);

        if (error) throw error;
      }

      toast({
        title: "Check-in uspješno zabilježen",
        description: "Vaš napredak je uspješno spremljen.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting check-in:', error);
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom spremanja check-ina.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Natrag na Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dnevni Check-in
          </h1>
          <p className="text-muted-foreground">
            Zabilježite svoj napredak i kako se osjećate danas
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Antropometrijske mjere */}
              <Card>
                <CardHeader>
                  <CardTitle>Antropometrijske mjere</CardTitle>
                  <CardDescription>
                    Unesite svoje trenutne mjere (opcionalno)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Težina (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="npr. 70.5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="waistCircumference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opseg struka (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="npr. 80.0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Subjektivne mjere */}
              <Card>
                <CardHeader>
                  <CardTitle>Kako se osjećate?</CardTitle>
                  <CardDescription>
                    Ocijenite svoje trenutno stanje na skali od 1 do 10
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="energyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Razina energije: {field.value}/10
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Vrlo niska</span>
                          <span>Vrlo visoka</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Raspoloženje: {field.value}/10
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Vrlo loše</span>
                          <span>Odlično</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Bilješke */}
              <Card>
                <CardHeader>
                  <CardTitle>Bilješke za trenera</CardTitle>
                  <CardDescription>
                    Opišite kako se osjećate, probleme ili pitanja (opcionalno)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="npr. Osjećam se odlično nakon jutarnjeg treninga. Imao sam problema sa spavanjem..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Spremam...' : 'Spremi Check-in'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;