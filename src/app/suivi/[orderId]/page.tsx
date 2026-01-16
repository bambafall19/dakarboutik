
'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { PublicOrder } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, Package, Truck, Home } from 'lucide-react';
import { statusLabels } from '@/components/admin/status-selector';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const statusIcons: Record<PublicOrder['status'], React.ElementType> = {
  pending: Package,
  paid: CheckCircle,
  shipped: Truck,
  delivered: Home,
  cancelled: Loader2, // Or another icon
};

function OrderTracker() {
  const params = useParams();
  const orderId = params.orderId as string;
  const firestore = useFirestore();

  const publicOrderRef = useMemo(() => {
    if (!firestore || !orderId) return null;
    return doc(firestore, 'publicOrders', orderId);
  }, [firestore, orderId]);

  const { data: order, loading, error } = useDoc<PublicOrder>(publicOrderRef);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Recherche de votre commande...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <Card className="w-full max-w-lg mx-auto text-center border-destructive">
        <CardHeader>
          <CardTitle>Commande non trouvée</CardTitle>
          <CardDescription>
            Impossible de trouver une commande avec le numéro <span className="font-bold">{orderId}</span>.
            Vérifiez le numéro et réessayez.
          </CardDescription>
        </CardHeader>
         <CardContent>
          <Button asChild>
            <Link href="/suivi">Réessayer</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentStatusIndex = order.statusHistory.findIndex(h => h.status === order.status);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Suivi de la commande {order.orderId}</CardTitle>
        <CardDescription>
          Commande passée le {new Date(order.createdAt).toLocaleDateString('fr-SN')}.
          Dernière mise à jour: {new Date(order.statusHistory[order.statusHistory.length - 1].date).toLocaleString('fr-SN')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
            {order.statusHistory.map((historyItem, index) => {
                const Icon = statusIcons[historyItem.status] || Package;
                const isCompleted = index < order.statusHistory.length -1;
                const isCurrent = index === order.statusHistory.length -1;

                return (
                    <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "flex items-center justify-center h-10 w-10 rounded-full border-2",
                                isCompleted || isCurrent ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-muted-foreground/20 text-muted-foreground",
                            )}>
                                <Icon className="h-5 w-5" />
                            </div>
                            {index < order.statusHistory.length - 1 && (
                                <div className={cn(
                                    "w-0.5 flex-1 mt-2",
                                    isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                                )}></div>
                            )}
                        </div>
                        <div className="pt-1.5">
                            <h3 className={cn("font-semibold", isCurrent && "text-primary")}>{statusLabels[historyItem.status]}</h3>
                            <p className="text-sm text-muted-foreground">{new Date(historyItem.date).toLocaleString('fr-SN', { dateStyle: 'long', timeStyle: 'short' })}</p>
                        </div>
                    </div>
                )
            })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrderTrackingPage() {
    return (
        <div className="container py-12 md:py-20">
            <OrderTracker />
        </div>
    )
}
