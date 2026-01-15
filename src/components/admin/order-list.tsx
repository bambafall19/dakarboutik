
'use client';

import * as React from 'react';
import { MoreHorizontal, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Price } from '../price';
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
import { useRouter } from 'next/navigation';
import type { Order, OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { OrderDetailDialog } from './order-detail-dialog';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  paid: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<OrderStatus, string> = {
    pending: 'En attente',
    paid: 'Payée',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
}


function StatusSelector({ order }: { order: Order }) {
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
      <SelectTrigger className={cn("h-8 w-[120px] text-xs", statusColors[order.status])}>
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

export function OrderList({ orders }: { orders: Order[] }) {
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Commandes</CardTitle>
              <CardDescription>
                Suivez et gérez les commandes de vos clients.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <File className="h-3.5 w-3.5 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden md:table-cell">Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderId}</TableCell>
                  <TableCell>
                    <StatusSelector order={order} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="font-medium">{order.customerInfo.name}</div>
                    <div className="text-xs text-muted-foreground">{order.customerInfo.email}</div>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                   <TableCell className="text-right">
                    <Price price={order.grandTotal} currency="FCA" />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                          Voir les détails
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedOrder && (
        <OrderDetailDialog 
          order={selectedOrder} 
          open={!!selectedOrder}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedOrder(null);
            }
          }}
        />
      )}
    </>
  );
}
