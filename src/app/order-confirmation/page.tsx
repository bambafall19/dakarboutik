
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Suspense } from 'react';

function OrderConfirmationContent({ orderId }: { orderId: string | null }) {
    return (
        <div className="flex min-h-[calc(100vh-20rem)] items-center justify-center">
            <Card className="w-full max-w-lg text-center">
                <CardHeader className="items-center">
                    <div className="bg-primary/10 rounded-full p-3">
                        <CheckCircle2 className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="mt-4 text-2xl">Merci pour votre commande !</CardTitle>
                    <CardDescription>Votre commande a été passée avec succès.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {orderId ? (
                         <p className="text-muted-foreground">
                            Votre numéro de commande est le <span className="font-bold text-foreground">{orderId}</span>.
                            Vous recevrez bientôt un email de confirmation avec les détails de votre commande.
                        </p>
                    ) : (
                        <p className="text-muted-foreground">
                            Vous recevrez bientôt un email de confirmation avec les détails de votre commande.
                        </p>
                    )}
                    <Button asChild>
                        <Link href="/">Retour à l'accueil</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

function OrderConfirmationSkeleton() {
    return (
        <div className="flex min-h-[calc(100vh-20rem)] items-center justify-center py-12 md:py-20">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Chargement de votre confirmation...</p>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
    const orderId = typeof searchParams.orderId === 'string' ? searchParams.orderId : null;

    return (
        <Suspense fallback={<OrderConfirmationSkeleton />}>
            <OrderConfirmationContent orderId={orderId} />
        </Suspense>
    );
}
