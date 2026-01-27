
'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Price } from '../price';
import type { Order } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';
import { StatusSelector, statusLabels } from './status-selector';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { Icons } from '../icons';

interface OrderDetailDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const paymentMethodLabels: Record<Order['paymentMethod'], string> = {
    cod: 'Paiement à la livraison',
    mobile_money: 'Mobile Money'
};


export function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [newPublicNote, setNewPublicNote] = useState('');
  const [isSavingPublicNote, setIsSavingPublicNote] = useState(false);

  const { toast } = useToast();
  const firestore = useFirestore();

  const handleSaveNotes = async () => {
    if (!firestore) return;
    setIsSavingNotes(true);
    const orderRef = doc(firestore, 'orders', order.id);
    try {
      await updateDoc(orderRef, { adminNotes });
      toast({ title: 'Note enregistrée' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'enregistrer la note.' });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleSavePublicNote = async () => {
    if (!firestore || !newPublicNote.trim()) return;
    setIsSavingPublicNote(true);
    const orderRef = doc(firestore, 'orders', order.id);
    const publicOrderRef = doc(firestore, 'publicOrders', order.id);
    const noteToAdd = {
        note: newPublicNote,
        date: new Date().toISOString(),
    };

    try {
      await updateDoc(orderRef, { publicNotes: arrayUnion(noteToAdd) });
      
      await setDoc(publicOrderRef, { 
        id: order.id,
        orderId: order.orderId,
        status: order.status,
        createdAt: order.createdAt,
        publicNotes: arrayUnion(noteToAdd) 
      }, { merge: true });

      toast({ title: 'Note publique ajoutée' });
      setNewPublicNote('');
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'ajouter la note publique.' });
    } finally {
      setIsSavingPublicNote(false);
    }
};

 const handleShareViaWhatsApp = () => {
    const {
      orderId,
      customerInfo,
      items,
      totalPrice,
      shippingCost,
      grandTotal,
      status,
    } = order;

    let phoneNumber = customerInfo.phone.replace(/\s/g, ''); // Remove spaces
    if (phoneNumber.length === 9 && !phoneNumber.startsWith('+')) {
        // Most likely a Senegalese number without country code, add '221'
        phoneNumber = `221${phoneNumber}`;
    }

    const siteUrl = window.location.origin;
    const trackingUrl = `${siteUrl}/suivi/${orderId}`;

    let message = `*Récapitulatif de votre commande - DakarBoutik*\n\n`;
    message += `Bonjour ${customerInfo.name},\n\n`;
    message += `Voici les détails de votre commande *${orderId}*:\n\n`;
    
    message += "*Articles commandés :*\n";
    items.forEach(item => {
      const itemPrice = item.quantity * (item.product.salePrice ?? item.product.price);
      const variantText = item.selectedVariants?.map(v => v.value).join(', ') || '';
      message += `- ${item.quantity} x ${item.product.title} ${variantText ? `(${variantText})` : ''} : ${itemPrice.toLocaleString('fr-SN')} FCA\n`;
    });
    message += "\n";

    message += `*Résumé du paiement :*\n`;
    message += `Sous-total : ${totalPrice.toLocaleString('fr-SN')} FCA\n`;
    message += `Livraison : ${shippingCost.toLocaleString('fr-SN')} FCA\n`;
    message += `*Total à payer : ${grandTotal.toLocaleString('fr-SN')} FCA*\n\n`;

    message += `Statut actuel : *${statusLabels[status]}*\n\n`;

    message += `Vous pouvez suivre votre commande à tout moment ici :\n${trackingUrl}\n\n`;
    message += `Merci de votre confiance,\nL'équipe DakarBoutik`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className='flex items-center gap-4'>
            Commande {order.orderId}
            <StatusSelector order={order} />
          </DialogTitle>
          <DialogDescription>
            Détails de la commande passée le {new Date(order.createdAt).toLocaleString('fr-SN')}.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-6">
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
                    <span>Méthode de paiement :</span>
                    <span className="font-medium">{paymentMethodLabels[order.paymentMethod] || 'N/A'}</span>
                </div>
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

            <div className='my-4'>
                <h3 className="font-semibold mb-2">Articles commandés</h3>
                <div className="border rounded-md">
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
                </div>
            </div>

             <div className="space-y-4 my-6">
                <h3 className="font-semibold">Ajouter une note publique (visible par le client)</h3>
                <Textarea 
                    placeholder="Ex: Nous préparons votre commande. Elle sera expédiée demain."
                    value={newPublicNote}
                    onChange={(e) => setNewPublicNote(e.target.value)}
                    rows={3}
                />
                <Button onClick={handleSavePublicNote} disabled={isSavingPublicNote || !newPublicNote.trim()} size="sm">
                    {isSavingPublicNote ? 'Envoi...' : 'Envoyer la note au client'}
                </Button>
            </div>

             <div className="space-y-4 my-6">
                <h3 className="font-semibold">Notes Administrateur (privées)</h3>
                <Textarea 
                    placeholder="Ajouter une note sur la commande, le client, etc."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                />
                <Button onClick={handleSaveNotes} disabled={isSavingNotes} size="sm">
                    {isSavingNotes ? 'Enregistrement...' : 'Enregistrer la note'}
                </Button>
            </div>
        </ScrollArea>
        
        <DialogFooter className='pt-4 border-t'>
          <Button onClick={handleShareViaWhatsApp} variant="outline">
            <Icons.whatsapp className="mr-2 h-5 w-5"/> Envoyer via WhatsApp
          </Button>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
