
'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2, Search, ShieldCheck, TriangleAlert, Menu } from 'lucide-react';
import { AdminSidebar, AdminSidebarContent } from '@/components/admin/admin-sidebar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
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
import { api } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// This new component combines the logic for first-time setup and access denied scenarios.
function AdminSetupFlow({ user, onAdminCreated }: { user: any; onAdminCreated: () => void }) {
  const [status, setStatus] = useState<'initial' | 'submitting' | 'denied' | 'error'>('initial');
  const { toast } = useToast();

  const handleBecomeAdmin = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté.' });
      return;
    }

    setStatus('submitting');
    try {
      await api.post('/api/auth/become-admin');
      toast({
        title: 'Félicitations !',
        description: 'Vous êtes maintenant administrateur. Rechargement...',
      });
      onAdminCreated();
    } catch (error: any) {
      if (error?.message?.includes('existe déjà')) {
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
                      Un administrateur a déjà été configuré pour ce site. Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
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
                       Cette étape est unique et ne peut être réalisée qu&apos;une seule fois.
                       Le compte <span className="font-bold text-foreground">{user.email}</span> deviendra l&apos;administrateur du site.
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
  const { user, isAdmin, loading, setUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/admin');
    }
  }, [user, loading, router]);
  
  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      setUser(null);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/admin/products?q=${encodeURIComponent(q)}` : '/admin/products');
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
          <header className="flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur md:px-6">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-0 p-0">
                <SheetTitle className="sr-only">Navigation administrateur</SheetTitle>
                <AdminSidebarContent onNavigate={() => setMobileNavOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="hidden sm:block">
              <h1 className="font-headline text-sm font-extrabold">Administration</h1>
              <p className="text-[11px] text-muted-foreground">Gérez votre boutique</p>
            </div>
            <form onSubmit={handleSearch} className="relative ml-auto w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full rounded-full bg-secondary/60 pl-9"
              />
            </form>
            <Button asChild variant="outline" size="sm" className="hidden rounded-full md:flex">
              <Link href="/" target="_blank">
                Voir la boutique
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-full ring-2 ring-primary/20"
                >
                  <Avatar className="h-9 w-9">
                     <AvatarImage src={''} alt={user?.email ?? 'Admin'} />
                    <AvatarFallback className="bg-primary text-primary-foreground">{user?.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>Mon Compte</span>
                    <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/admin/settings')}>Réglages</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Se déconnecter</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 overflow-auto bg-muted/40 p-4 md:p-6">
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

