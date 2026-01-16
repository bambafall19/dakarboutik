
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, Truck } from "lucide-react";
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from "next/navigation";

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const queryOrderId = searchParams.get('orderId');
    const [orderId, setOrderId] = useState<string | null>(queryOrderId);

    useEffect(() => {
        if (!queryOrderId) {
            const storedOrderId = sessionStorage.getItem('lastOrderId');
            if (storedOrderId) {
                setOrderId(storedOrderId);
                sessionStorage.removeItem('lastOrderId');
            }
        }
    }, [queryOrderId]);


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
                <CardContent className="space-y-6 pt-6">
                    {orderId ? (
                         <p className="text-muted-foreground">
                            Votre numéro de commande est le <span className="font-bold text-foreground">{orderId}</span>.
                            Vous pouvez suivre son état d'avancement à tout moment.
                        </p>
                    ) : (
                        <p className="text-muted-foreground">
                            Votre commande a été enregistrée. Nous vous contacterons bientôt avec les détails.
                        </p>
                    )}
                    <div className="flex w-full flex-col sm:flex-row gap-4 justify-center pt-2">
                        {orderId && (
                            <Button asChild size="lg" className="w-full sm:w-auto">
                                <Link href={`/suivi/${orderId}`}>
                                    <Truck className="mr-2 h-4 w-4" />
                                    Suivre ma commande
                                </Link>
                            </Button>
                        )}
                        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                            <Link href="/products">Continuer mes achats</Link>
                        </Button>
                    </div>
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

// This is the Server Component that reads searchParams and passes them to the client component.
export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<OrderConfirmationSkeleton />}>
            <OrderConfirmationContent />
        </Suspense>
    );
}
