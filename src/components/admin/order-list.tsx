
'use client';

import * as React from 'react';
import { api } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal } from 'lucide-react';
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
import type { Order } from '@/lib/types';
import { OrderDetailDialog } from './order-detail-dialog';
import { StatusSelector } from './status-selector';

export function OrderList({ orders, onRefresh }: { orders: Order[]; onRefresh?: () => void }) {
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  const { toast } = useToast();
  const [updatingOrder, setUpdatingOrder] = React.useState<string | null>(null);

  async function changeArchive(order: Order) {
    setUpdatingOrder(order.id);
    try {
      await api.patch('/api/orders', { id: order.id, archived: !order.archivedAt });
      await onRefresh?.();
      toast({ title: order.archivedAt ? 'Commande restaurée' : 'Commande archivée' });
    } catch {
      toast({ variant: 'destructive', title: 'Impossible de modifier l’archivage' });
    } finally {
      setUpdatingOrder(null);
    }
  }

  if (orders.length === 0) {
    return (
        <div className="text-center py-16">
            <h3 className="text-lg font-semibold">Aucune commande trouvée</h3>
            <p className="text-muted-foreground text-sm">Essayez de changer vos filtres ou votre recherche.</p>
        </div>
    )
  }
  
  return (
    <>
        <div className="overflow-x-auto">
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
                    <StatusSelector order={order} onStatusChange={onRefresh} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="font-medium">{order.customerInfo.name}</div>
                    <div className="text-xs text-muted-foreground">{order.customerInfo.email}</div>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('fr-SN', { timeZone: 'Africa/Dakar' })}
                  </TableCell>
                   <TableCell className="text-right">
                    <Price price={order.grandTotal} currency="FCA" />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost" aria-label="Actions de la commande">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                          Voir les détails
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={updatingOrder !== null} onSelect={() => void changeArchive(order)}>
                          {order.archivedAt ? 'Restaurer' : 'Archiver'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
      {selectedOrder && (
        <OrderDetailDialog 
          order={selectedOrder} 
          open={!!selectedOrder}
          onUpdated={onRefresh}
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
