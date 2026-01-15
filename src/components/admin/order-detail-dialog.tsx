
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Price } from '../price';
import { cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';

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

interface OrderDetailDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className='flex items-center gap-4'>
            Commande {order.orderId}
            <Badge className={cn(statusColors[order.status])}>
              {statusLabels[order.status]}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Détails de la commande passée le {new Date(order.createdAt).toLocaleString('fr-SN')}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold">Informations du Client</h3>
            <div className="text-sm space-y-1">
              <p><strong>Nom :</strong> {order.customerInfo.name}</p>
              <p><strong>Email :</strong> {order.customerInfo.email}</p>
              <p><strong>Téléphone :</strong> {order.customerInfo.phone}</p>
              <p><strong>Adresse :</strong> {order.customerInfo.address}, {order.customerInfo.city}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Récapitulatif financier</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Sous-total :</span>
                <Price price={order.totalPrice} currency="FCA" />
              </div>
              <div className="flex justify-between">
                <span>Livraison :</span>
                <Price price={order.shippingCost} currency="FCA" />
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total :</span>
                <Price price={order.grandTotal} currency="FCA" />
              </div>
            </div>
          </div>
        </div>

        <div>
            <h3 className="font-semibold mb-2">Articles commandés</h3>
            <ScrollArea className="h-64 border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-[80px]'>Image</TableHead>
                            <TableHead>Produit</TableHead>
                            <TableHead className='text-center'>Quantité</TableHead>
                            <TableHead className='text-right'>Prix Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {order.items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className='relative h-12 w-12 bg-muted rounded-md overflow-hidden'>
                                        <Image src={item.product.images[0].imageUrl} alt={item.product.title} fill className='object-contain p-1' />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className='font-medium'>{item.product.title}</p>
                                    {item.selectedVariants && item.selectedVariants.length > 0 && (
                                        <p className='text-xs text-muted-foreground'>
                                            {item.selectedVariants.map(v => v.value).join(', ')}
                                        </p>
                                    )}
                                </TableCell>
                                <TableCell className='text-center'>{item.quantity}</TableCell>
                                <TableCell className='text-right'>
                                    <Price price={item.quantity * (item.product.salePrice ?? item.product.price)} currency='FCA' />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
