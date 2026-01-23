
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, ShieldCheck, TriangleAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminSetupPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                description: 'Vous êtes maintenant administrateur. Redirection...',
            });
            
            // Give a moment for the user hook to re-evaluate
            setTimeout(() => router.push('/admin'), 1000);

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

    if (userLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container flex min-h-screen items-center justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                        <ShieldCheck className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>Devenir Administrateur</CardTitle>
                    <CardDescription>
                       Cette étape est unique et ne peut être réalisée qu'une seule fois.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    {user ? (
                        <>
                            <p className="text-muted-foreground mb-6">
                                Vous êtes connecté en tant que <span className="font-bold text-foreground">{user.email}</span>. Cliquez sur le bouton ci-dessous pour vous attribuer les droits d'administrateur.
                            </p>
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
                                    'Devenir le premier administrateur'
                                )}
                            </Button>
                        </>
                    ) : (
                        <div className='text-center space-y-4'>
                            <div className='flex items-center justify-center gap-2 text-destructive font-semibold'>
                                <TriangleAlert className="h-5 w-5" />
                                <p>Vous n'êtes pas connecté.</p>
                            </div>
                            <p className="text-muted-foreground">
                                Veuillez vous connecter ou créer un compte pour continuer.
                            </p>
                            <div className='flex gap-4 justify-center'>
                                <Button asChild><Link href="/login">Se connecter</Link></Button>
                                <Button asChild variant="outline"><Link href="/register">Créer un compte</Link></Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
