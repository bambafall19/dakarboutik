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
import { collection, doc, getDocs, limit, query, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function FirstAdminSetup({ user, onAdminCreated }: { user: any; onAdminCreated: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleBecomeAdmin = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté.' });
      return;
    }

    setIsSubmitting(true);
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
      let description = "Une erreur est survenue.";
      if (error.code === 'permission-denied') {
        description = "Un administrateur existe déjà. L'accès a été refusé.";
      }
      toast({
        variant: 'destructive',
        title: 'Opération échouée',
        description,
      });
      setIsSubmitting(false);
    }
  };

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
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
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

function AccessDenied() {
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


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth();
  const firestore = useFirestore();
  const [needsFirstAdminSetup, setNeedsFirstAdminSetup] = useState(false);

  useEffect(() => {
    if (loading) return; 

    if (!user) {
      router.replace('/login?redirect=/admin');
      return;
    }

    if (!isAdmin) {
      // User is logged in but not an admin. Check if they should be the first admin.
      const checkAdminCollection = async () => {
        if (!firestore) return;
        const adminsRef = collection(firestore, 'admins');
        const q = query(adminsRef, limit(1));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          // No admins exist, this user needs to complete the setup.
          setNeedsFirstAdminSetup(true);
        } else {
          // An admin exists, but it's not this user. Deny access.
          setNeedsFirstAdminSetup(false);
          router.replace('/');
          toast({ variant: 'destructive', title: 'Accès refusé', description: 'Vous n\'avez pas les droits d\'administrateur.' });
        }
      };
      
      checkAdminCollection();
    }
  }, [user, isAdmin, loading, router, firestore, toast]);
  
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
    setNeedsFirstAdminSetup(false);
    router.refresh();
  }

  if (loading || (!isAdmin && !needsFirstAdminSetup)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (needsFirstAdminSetup && user) {
      return <FirstAdminSetup user={user} onAdminCreated={handleAdminCreated} />;
  }
  
  if (!isAdmin) {
      return <AccessDenied />;
  }

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
