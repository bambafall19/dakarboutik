
'use client';

import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import type { Order, OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

export const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-accent/15 text-accent-foreground border-accent/30',
    paid: 'bg-primary/10 text-primary border-primary/20',
    shipped: 'bg-primary/15 text-primary border-primary/25',
    delivered: 'bg-primary/20 text-primary border-primary/30',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};
  
export const statusLabels: Record<OrderStatus, string> = {
      pending: 'En attente',
      paid: 'Payée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
}

export function StatusSelector({
    order,
    className,
    onStatusChange,
}: {
    order: Order;
    className?: string;
    onStatusChange?: (newStatus: OrderStatus) => void;
}) {
    const { toast } = useToast();
    const [status, setStatus] = useState<OrderStatus>(order.status);
  
    const handleStatusChange = async (newStatus: OrderStatus) => {
      const previous = status;
      setStatus(newStatus);
      try {
        await api.put('/api/orders', { id: order.id, status: newStatus });

        toast({
          title: 'Statut mis à jour',
          description: `La commande ${order.orderId} est maintenant "${statusLabels[newStatus]}".`,
        });
        onStatusChange?.(newStatus);
      } catch (error) {
        console.error(error);
        setStatus(previous);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de mettre à jour le statut.',
        });
      }
    };
  
    return (
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger className={cn("h-8 w-[130px] rounded-full text-xs", statusColors[status], className)} aria-label={`Statut de la commande ${order.orderId}`}>
          <SelectValue placeholder="Changer statut" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(statusLabels).map((s) => (
            <SelectItem key={s} value={s}>
              {statusLabels[s as OrderStatus]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
}
