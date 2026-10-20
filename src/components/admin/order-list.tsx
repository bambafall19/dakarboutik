
'use client';

import * as React from 'react';
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

export function OrderList({ orders }: { orders: Order[] }) {
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

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
