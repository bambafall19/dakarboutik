
'use client';

import type { Order, Product } from '@/lib/types';
import { useMemo, useState } from 'react';
import { DollarSign, ShoppingCart, Loader2, Receipt, TriangleAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Price } from '@/components/price';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdminProducts } from '@/hooks/use-site-data';
import Image from 'next/image';
import { statusLabels } from '@/components/admin/status-selector';
import { Badge } from '@/components/ui/badge';
import { OrderDetailDialog } from '@/components/admin/order-detail-dialog';
import { useApiData } from '@/hooks/use-api-data';
import { AdminError } from '@/components/admin/admin-error';

const COMPLETED = ['delivered', 'paid', 'shipped'];
const EXCLUDED = ['cancelled'];

export default function AdminDashboardPage() {
    const { products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useAdminProducts();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
    const { data: orders, loading: ordersLoading, error: ordersError, refetch: refetchOrders } = useApiData<Order[]>('/api/orders');

    const { totalRevenue, totalSales, salesLast7Days, chartData, averageOrderValue } = useMemo(() => {
        if (!orders) return { totalRevenue: 0, totalSales: 0, salesLast7Days: 0, chartData: [], averageOrderValue: 0 };

        const completedOrders = orders.filter(o => COMPLETED.includes(o.status));

        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.grandTotal, 0);
        const totalSales = completedOrders.length;
        const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const salesLast7Days = completedOrders
            .filter(o => new Date(o.createdAt) >= sevenDaysAgo)
            .reduce((sum, order) => sum + order.grandTotal, 0);

        const dailySales = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return {
              name: d.toLocaleDateString('fr-SN', { weekday: 'short', day: '2-digit' }),
              date: d.toISOString().split('T')[0],
              Total: 0,
            };
        }).reverse();
      
        completedOrders.forEach(order => {
            const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
            const dayData = dailySales.find(d => d.date === orderDate);
            if (dayData) {
              dayData.Total += order.grandTotal;
            }
        });

        return { totalRevenue, totalSales, salesLast7Days, chartData: dailySales, averageOrderValue };
    }, [orders]);

    const topProducts = useMemo(() => {
        if (!orders || !products) return [];

        const productSales: { [productId: string]: { product: Product, quantity: number } } = {};

        orders
            .filter(order => !EXCLUDED.includes(order.status))
            .forEach(order => {
            order.items.forEach(item => {
                const productId = item.product.id;
                // Ensure we have the full product info from the products hook, not just the cart item snapshot
                const fullProduct = products.find(p => p.id === productId);
                if (fullProduct) {
                    if (productSales[productId]) {
                        productSales[productId].quantity += item.quantity;
                    } else {
                        productSales[productId] = {
                            product: fullProduct,
                            quantity: item.quantity,
                        };
                    }
                }
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

    }, [orders, products]);
    
    const lowStockProducts = useMemo(() => {
        if (!products) return [];
        return products
            .filter(p => p.stock <= 5 && p.status === 'active')
            .sort((a,b) => a.stock - b.stock)
            .slice(0, 5);
    }, [products]);

    const recentOrders = useMemo(() => {
        if (!orders) return [];
        return [...orders]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
    }, [orders]);


    if (ordersLoading || productsLoading) {
      return (
        <div className="flex h-full w-full min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (ordersError || productsError) {
      return (
        <AdminError
          onRetry={() => {
            refetchOrders();
            refetchProducts();
          }}
        />
      );
    }
  
    return (
      <>
        <div className="flex flex-col gap-8">
            <div>
              <h1 className="font-headline text-2xl font-extrabold">Tableau de bord</h1>
              <p className="text-sm text-muted-foreground">Vue d&apos;ensemble de votre activité.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="overflow-hidden rounded-2xl border-border/70">
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-400" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Revenu Total
                        </CardTitle>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="font-headline text-2xl font-extrabold">
                            <Price price={totalRevenue} currency="FCA" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total des ventes finalisées
                        </p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden rounded-2xl border-border/70">
                    <div className="h-1.5 w-full bg-gradient-to-r from-accent to-amber-300" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ventes</CardTitle>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15">
                          <ShoppingCart className="h-4 w-4 text-accent" />
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="font-headline text-2xl font-extrabold">{totalSales}</div>
                        <p className="text-xs text-muted-foreground">
                        Nombre de commandes finalisées
                        </p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden rounded-2xl border-border/70">
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-400" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Panier Moyen</CardTitle>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Receipt className="h-4 w-4 text-primary" />
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="font-headline text-2xl font-extrabold">
                            <Price price={averageOrderValue} currency="FCA" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Valeur moyenne par commande
                        </p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden rounded-2xl border-border/70">
                    <div className="h-1.5 w-full bg-gradient-to-r from-accent to-amber-300" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ventes (7 derniers jours)</CardTitle>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15">
                          <DollarSign className="h-4 w-4 text-accent" />
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="font-headline text-2xl font-extrabold">
                            <Price price={salesLast7Days} currency="FCA" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Revenu des 7 derniers jours
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <Card className="rounded-2xl border-border/70">
                    <CardHeader>
                        <CardTitle>Ventes des 7 derniers jours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value as number / 1000)}k`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        borderColor: 'hsl(var(--border))'
                                    }}
                                    formatter={(value) => new Intl.NumberFormat('fr-SN').format(value as number) + ' FCFA'}
                                />
                                <Line type="monotone" dataKey="Total" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-border/70">
                    <CardHeader>
                        <CardTitle>Meilleures Ventes</CardTitle>
                        <CardDescription>
                            Les 5 produits les plus vendus.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produit</TableHead>
                                    <TableHead className="text-right">Ventes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topProducts.length > 0 ? topProducts.map(({ product, quantity }) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-secondary">
                                                    {product.images[0]?.imageUrl ? (
                                                        <Image src={product.images[0].imageUrl} alt={product.title} fill className="object-contain" />
                                                    ) : null}
                                                </div>
                                                <span className="font-medium text-sm truncate">{product.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">{quantity}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="py-8 text-center text-sm text-muted-foreground">
                                            Aucune vente enregistrée pour le moment.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {lowStockProducts.length > 0 && (
                 <Card className="rounded-2xl border-border/70">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                             <TriangleAlert className="h-5 w-5 text-destructive" />
                             <CardTitle>Alerte Stock Faible</CardTitle>
                        </div>
                        <CardDescription>
                            Ces produits ont un stock de 5 articles ou moins.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produit</TableHead>
                                    <TableHead className="text-right">Stock Restant</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lowStockProducts.map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <Link href={`/admin/edit-product/${product.id}`} className="flex items-center gap-3 group">
                                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-secondary">
                                                    {product.images[0]?.imageUrl ? (
                                                        <Image src={product.images[0].imageUrl} alt={product.title} fill className="object-contain" />
                                                    ) : null}
                                                </div>
                                                <span className="font-medium text-sm truncate group-hover:underline">{product.title}</span>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="destructive">{product.stock}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="rounded-2xl border-border/70">
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle>Commandes Récentes</CardTitle>
                        <CardDescription>
                            Les 5 dernières commandes passées.
                        </CardDescription>
                    </div>
                    <Button asChild size="sm" className="ml-auto gap-1">
                        <Link href="/admin/orders">
                            Voir tout
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOrders.length > 0 ? recentOrders.map(order => (
                                <TableRow key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                    <TableCell>
                                        <div className="font-medium">{order.customerInfo.name}</div>
                                        <div className="text-sm text-muted-foreground">{order.customerInfo.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{statusLabels[order.status]}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right"><Price price={order.grandTotal} currency="FCA" /></TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                                        Aucune commande pour le moment.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
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

    