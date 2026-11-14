
'use client';

import { OrderList } from '@/components/admin/order-list';
import { AdminError } from '@/components/admin/admin-error';
import { Loader2, Search, Download } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/types';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { useApiData } from '@/hooks/use-api-data';
import { exportCsv } from '@/lib/export-csv';

type OrderFilter = OrderStatus | 'all' | 'archived';

export default function OrdersPage() {
  return <Suspense fallback={<p role="status">Chargement des commandes…</p>}><OrdersView /></Suspense>;
}

function OrdersView() {
  const searchParams = useSearchParams();
  const days = searchParams.get('statsDays');
  const statsDays = days === '7' || days === '30' || days === '90' ? Number(days) : null;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setStatusFilter] = useState<OrderFilter | null>(null);
  const statusFilter = selectedStatus ?? (searchParams.get('status') === 'pending' ? 'pending' : 'all');
  const { toast } = useToast();


  const { data: orders, loading, error, refetch } = useApiData<Order[]>('/api/orders?includeArchived=true');

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = orders;
    if (statsDays !== null) {
      const start = new Date();
      // Dakar is UTC year-round. Use calendar days, as in the statistics API.
      start.setUTCHours(0, 0, 0, 0);
      start.setUTCDate(start.getUTCDate() - statsDays + 1);
      filtered = filtered.filter(order =>
        !order.orderId.startsWith('DKB-TEST-') && Date.parse(order.createdAt) >= start.getTime()
      );
    }

    if (statusFilter === 'archived' || statsDays === null || statusFilter !== 'all') {
      filtered = filtered.filter(order => Boolean(order.archivedAt) === (statusFilter === 'archived'));
    }

    if (statusFilter !== 'all' && statusFilter !== 'archived') {
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
  }, [orders, statusFilter, searchTerm, statsDays]);

  const allStatuses: OrderFilter[] = ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled', 'archived'];
  
  const exportToCsv = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      toast({
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
      'Sous-total (FCFA)',
      'Frais Livraison (FCFA)',
      'Total (FCFA)',
      'Produits',
    ];

    const rows = filteredOrders.map(order => {
      const items = order.items.map(item => `${item.quantity}x ${item.product.title}`).join('; ');
      return [
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
    });

    const date = new Date().toISOString().split('T')[0];
    exportCsv(`commandes-dakarboutik-${date}.csv`, headers, rows);
  };
  
  if (loading) {
      return (
          <div className="flex h-full min-h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }

  if (error) {
    return <AdminError onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
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
       <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderFilter)}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="-mx-1 overflow-x-auto px-1 pb-1">
                <TabsList className="w-max">
                  {allStatuses.map(status => (
                    <TabsTrigger key={status} value={status} className="capitalize text-xs md:text-sm">
                      {status === 'all' ? 'Toutes' : status === 'archived' ? 'Archives' : statusLabels[status]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <div className="flex items-center gap-2 lg:ml-auto">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Rechercher une commande..."
                    className="w-full rounded-full bg-secondary/60 pl-8 lg:w-[280px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <Button size="sm" variant="outline" className="rounded-full" onClick={exportToCsv}>
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Exporter
                </Button>
              </div>
            </div>
            <TabsContent value={statusFilter} className="mt-4">
                 <Card className="rounded-2xl border-border/70">
                    <CardHeader className="px-6">
                    <CardTitle className="font-headline font-bold">Commandes</CardTitle>
                    <CardDescription>
                        {statsDays !== null && <>Commandes hors tests · {statsDays} jours<br /></>}
                        {statusFilter === 'all' ? (statsDays === null ? 'Toutes les commandes non archivées' : 'Tous les statuts, archives comprises') : statusFilter === 'archived' ? 'Commandes archivées' : `Commandes avec le statut : ${statusLabels[statusFilter]}`}
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OrderList orders={filteredOrders || []} onRefresh={refetch} />
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
    </div>
  );
}
