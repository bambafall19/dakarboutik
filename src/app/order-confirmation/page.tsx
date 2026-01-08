"use client";

import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function OrderConfirmationPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <div className="container py-12 md:py-20 flex items-center justify-center">
            <Card className="w-full max-w-lg text-center">
                <CardHeader className="items-center">
                    <div className="bg-primary/10 rounded-full p-3">
                        <CheckCircle2 className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="mt-4 text-2xl">Merci pour votre commande !</CardTitle>
                    <CardDescription>Votre commande a été passée avec succès.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Votre numéro de commande est le <span className="font-bold text-foreground">{orderId}</span>.
                        Vous recevrez bientôt un email de confirmation avec les détails de votre commande.
                    </p>
                    <Button asChild>
                        <Link href="/">Retour à l'accueil</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
