
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Search, ShieldCheck, TriangleAlert } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAuth, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// This new component combines the logic for first-time setup and access denied scenarios.
function AdminSetupFlow({ user, onAdminCreated }: { user: any; onAdminCreated: () => void }) {
  const [status, setStatus] = useState<'initial' | 'submitting' | 'denied' | 'error'>('initial');
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleBecomeAdmin = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté.' });
      return;
    }

    setStatus('submitting');
    try {
      const adminDocRef = doc(firestore, 'admins', user.uid);
      await setDoc(adminDocRef, { role: 'admin', createdAt: new Date().toISOString() });
      
      toast({
        title: 'Félicitations !',
        description: 'Vous êtes maintenant administrateur. Rechargement...',
      });
      
      onAdminCreated();

    } catch (error: any) {
      console.error("Error setting admin role:", error);
      if (error.code === 'permission-denied') {
        setStatus('denied');
      } else {
        setStatus('error');
        toast({
          variant: 'destructive',
          title: 'Opération échouée',
          description: "Une erreur inattendue est survenue. Veuillez réessayer.",
        });
      }
    }
  };

  if (status === 'denied') {
      return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40">
           <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
                        <TriangleAlert className="h-10 w-10 text-destructive" />
                    </div>
                    <CardTitle>Accès Refusé</CardTitle>
                    <CardDescription>
                      Un administrateur a déjà été configuré pour ce site. Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
  }

  // Initial and error states will show the setup button, allowing retry
  return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
           <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                        <ShieldCheck className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>Devenir le premier administrateur</CardTitle>
                    <CardDescription>
                       Cette étape est unique et ne peut être réalisée qu'une seule fois.
                       Le compte <span className="font-bold text-foreground">{user.email}</span> deviendra l'administrateur du site.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button
                        size="lg"
                        onClick={handleBecomeAdmin}
                        disabled={status === 'submitting'}
                    >
                        {status === 'submitting' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Veuillez patienter
                            </>
                        ) : (
                            'Confirmer et devenir Administrateur'
                        )}
                    </Button>
                </CardContent>
            </Card>
      </div>
  )
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/admin');
    }
  }, [user, loading, router]);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté.',
      });
      router.push('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de déconnexion',
        description: 'Impossible de se déconnecter. Veuillez réessayer.',
      });
    }
  };
  
  const handleAdminCreated = () => {
    window.location.reload();
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (user && !isAdmin) {
    return <AdminSetupFlow user={user} onAdminCreated={handleAdminCreated} />;
  }
  
  if (user && isAdmin) {
    return (
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full bg-background pl-8 md:w-[200px] lg:w-[300px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                     <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? 'Admin'} />
                    <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/admin/settings')}>Réglages</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Se déconnecter</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/40">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
}

