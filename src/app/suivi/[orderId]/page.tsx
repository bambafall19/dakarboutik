
'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { PublicOrder } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, Package, Truck, Home, MessageSquare } from 'lucide-react';
import { statusLabels } from '@/components/admin/status-selector';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const timelineIcons: Record<string, React.ElementType> = {
  pending: Package,
  paid: CheckCircle,
  shipped: Truck,
  delivered: Home,
  cancelled: Loader2,
  note: MessageSquare,
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

  const timelineEvents = useMemo(() => {
    if (!order) return [];

    const statusEvents = (order.statusHistory || []).map(h => ({
        type: 'status',
        date: h.date,
        content: statusLabels[h.status],
        status: h.status,
    }));

    const noteEvents = (order.publicNotes || []).map(n => ({
        type: 'note',
        date: n.date,
        content: n.note,
    }));

    return [...statusEvents, ...noteEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [order]);


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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Suivi de la commande {order.orderId}</CardTitle>
        <CardDescription>
          Commande passée le {new Date(order.createdAt).toLocaleDateString('fr-SN')}.
          Dernière mise à jour: {new Date(timelineEvents[0].date).toLocaleString('fr-SN')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
            {timelineEvents.map((event, index) => {
                const Icon = timelineIcons[event.type === 'status' ? event.status : 'note'] || Package;
                const isCurrent = index === 0;

                return (
                    <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "flex items-center justify-center h-10 w-10 rounded-full border-2",
                                isCurrent ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-muted-foreground/20 text-muted-foreground",
                            )}>
                                <Icon className="h-5 w-5" />
                            </div>
                            {index < timelineEvents.length - 1 && (
                                <div className="w-0.5 flex-1 mt-2 bg-muted-foreground/20"></div>
                            )}
                        </div>
                        <div className="pt-1.5 flex-1">
                            <h3 className={cn("font-semibold", isCurrent && "text-primary")}>
                                {event.type === 'status' ? event.content : 'Message de la boutique'}
                            </h3>
                            <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleString('fr-SN', { dateStyle: 'long', timeStyle: 'short' })}</p>
                            {event.type === 'note' && (
                                <p className="mt-2 text-sm text-foreground bg-accent/50 p-3 rounded-md">{event.content}</p>
                            )}
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
