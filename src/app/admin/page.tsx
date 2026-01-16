'use client';

import { useCollection, useFirestore } from '@/firebase';
import type { Order, Product } from '@/lib/types';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemo } from 'react';
import { DollarSign, ShoppingCart, Loader2 } from 'lucide-react';
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

export default function AdminDashboardPage() {
    const firestore = useFirestore();
    const { products, loading: productsLoading } = useAdminProducts();
  
    const ordersQuery = useMemo(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
    }, [firestore]);
  
    const { data: orders, loading: ordersLoading } = useCollection<Order>(ordersQuery);

    const { totalRevenue, totalSales, salesLast7Days, chartData } = useMemo(() => {
        if (!orders) return { totalRevenue: 0, totalSales: 0, salesLast7Days: 0, chartData: [] };

        const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'paid' || o.status === 'shipped');

        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.grandTotal, 0);
        const totalSales = completedOrders.length;
        
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

        return { totalRevenue, totalSales, salesLast7Days, chartData: dailySales };
    }, [orders]);

    const topProducts = useMemo(() => {
        if (!orders || !products) return [];

        const productSales: { [productId: string]: { product: Product, quantity: number } } = {};

        orders.forEach(order => {
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


    if (ordersLoading || productsLoading) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
  
    return (
      <div className="flex flex-col gap-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Revenu Total
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        <Price price={totalRevenue} currency="FCA" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Total des ventes finalisées
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ventes</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalSales}</div>
                    <p className="text-xs text-muted-foreground">
                       Nombre de commandes finalisées
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ventes (7 derniers jours)</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     <div className="text-2xl font-bold">
                        <Price price={salesLast7Days} currency="FCA" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Revenu des 7 derniers jours
                    </p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
            <Card>
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
                                formatter={(value) => new Intl.NumberFormat('fr-SN').format(value as number) + ' FCA'}
                             />
                            <Line type="monotone" dataKey="Total" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Meilleures Ventes</CardTitle>
                    <CardDescription>
                        Les 5 produits les plus vendus.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produit</TableHead>
                                <TableHead className="text-right">Ventes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topProducts.map(({ product, quantity }) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-10 w-10 shrink-0">
                                                <Image src={product.images[0].imageUrl} alt={product.title} fill className="rounded-md object-contain" />
                                            </div>
                                            <span className="font-medium text-sm truncate">{product.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-bold">{quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        
         <Card>
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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(orders || []).slice(0, 5).map(order => (
                             <TableRow key={order.id}>
                                <TableCell>
                                    <div className="font-medium">{order.customerInfo.name}</div>
                                    <div className="text-sm text-muted-foreground">{order.customerInfo.email}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{statusLabels[order.status]}</Badge>
                                </TableCell>
                                <TableCell className="text-right"><Price price={order.grandTotal} currency="FCA" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    );
  }
