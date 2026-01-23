
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

const registerSchema = z.object({
  email: z.string().email('Veuillez entrer une adresse e-mail valide.'),
  password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères.'),
});

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Compte créé avec succès !',
        description: 'Vous pouvez maintenant vous connecter ou configurer votre accès admin.',
      });
      // Redirect to the one-time admin setup page
      router.push('/admin-setup');
    } catch (error: any) {
      let description = 'Une erreur est survenue. Veuillez réessayer.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Cette adresse e-mail est déjà utilisée. Essayez de vous connecter.';
      }
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la création du compte',
        description,
      });
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
            <Logo />
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>
            Créez votre compte pour gérer la boutique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="vous@exemple.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Création...' : 'Créer le compte'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center text-sm">
            <p className="text-muted-foreground">
                Vous avez déjà un compte ?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Se connecter
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
