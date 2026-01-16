'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Order, OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

export const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    paid: 'bg-blue-100 text-blue-800 border-blue-200',
    shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
};
  
export const statusLabels: Record<OrderStatus, string> = {
      pending: 'En attente',
      paid: 'Payée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
}

export function StatusSelector({ order, className }: { order: Order; className?: string }) {
    const firestore = useFirestore();
    const { toast } = useToast();
  
    const handleStatusChange = async (newStatus: OrderStatus) => {
      if (!firestore) return;
      const orderRef = doc(firestore, 'orders', order.id);
      try {
        await updateDoc(orderRef, { status: newStatus });
        toast({
          title: 'Statut mis à jour',
          description: `La commande ${order.orderId} est maintenant "${statusLabels[newStatus]}".`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de mettre à jour le statut.',
        });
      }
    };
  
    return (
      <Select defaultValue={order.status} onValueChange={handleStatusChange}>
        <SelectTrigger className={cn("h-8 w-[120px] text-xs", statusColors[order.status], className)}>
          <SelectValue placeholder="Changer statut" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(statusLabels).map((status) => (
            <SelectItem key={status} value={status}>
              {statusLabels[status as OrderStatus]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
}
