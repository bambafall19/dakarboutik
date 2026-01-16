
'use client';

import { OrderList } from '@/components/admin/order-list';
import { useCollection, useFirestore } from '@/firebase';
import { Loader2, Search, File } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/types';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { statusLabels } from '@/components/admin/status-selector';
import { useToast } from '@/hooks/use-toast';

export default function OrdersPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const { toast } = useToast();


  const ordersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: orders, loading } = useCollection<Order>(ordersQuery);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(lowercasedTerm) ||
        order.customerInfo.name.toLowerCase().includes(lowercasedTerm) ||
        order.customerInfo.email.toLowerCase().includes(lowercasedTerm)
      );
    }

    return filtered;
  }, [orders, statusFilter, searchTerm]);

  const allStatuses: (OrderStatus | 'all')[] = ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  
  const exportToCsv = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Aucune commande à exporter',
        description: 'Veuillez ajuster vos filtres pour exporter des données.',
      });
      return;
    }

    const headers = [
      'ID Commande',
      'Statut',
      'Date',
      'Client',
      'Email',
      'Téléphone',
      'Adresse',
      'Ville',
      'Méthode Livraison',
      'Sous-total (FCA)',
      'Frais Livraison (FCA)',
      'Total (FCA)',
      'Produits',
    ];

    const escapeCsvCell = (cellData: any): string => {
        const cellString = String(cellData);
        // If the cell contains a comma, quote, or newline, wrap it in double quotes
        if (/[",\n]/.test(cellString)) {
            return `"${cellString.replace(/"/g, '""')}"`;
        }
        return cellString;
    };

    const rows = filteredOrders.map(order => {
      const items = order.items.map(item => `${item.quantity}x ${item.product.title}`).join('; ');
      const rowData = [
        order.orderId,
        statusLabels[order.status],
        new Date(order.createdAt).toLocaleDateString('fr-SN'),
        order.customerInfo.name,
        order.customerInfo.email,
        order.customerInfo.phone,
        order.customerInfo.address,
        order.customerInfo.city,
        order.deliveryMethod,
        order.totalPrice,
        order.shippingCost,
        order.grandTotal,
        items,
      ];
      return rowData.map(escapeCsvCell).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Add BOM for UTF-8 support in Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `commandes-dakarboutik-${date}.csv`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  if (loading) {
      return (
          <div className="py-12 flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }

  return (
    <div className="py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Commandes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
       <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
            <div className="flex items-center gap-4">
              <TabsList>
                {allStatuses.map(status => (
                  <TabsTrigger key={status} value={status} className="capitalize text-xs md:text-sm">
                    {status === 'all' ? 'Toutes' : statusLabels[status as OrderStatus]}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <div className="relative flex-1 md:grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Rechercher..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <Button size="sm" variant="outline" onClick={exportToCsv}>
                    <File className="h-3.5 w-3.5 mr-2" />
                    Exporter
                </Button>
              </div>
            </div>
            <TabsContent value={statusFilter} className="mt-4">
                 <Card>
                    <CardHeader className="px-7">
                    <CardTitle>Commandes</CardTitle>
                    <CardDescription>
                        {statusFilter === 'all' ? 'Toutes les commandes' : `Commandes avec le statut: ${statusLabels[statusFilter]}`}
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OrderList orders={filteredOrders || []} />
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
    </div>
  );
}
