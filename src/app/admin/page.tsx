'use client';

import { useCollection, useFirestore } from '@/firebase';
import type { Order, Product } from '@/lib/types';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import { DollarSign, ShoppingCart, Loader2, Receipt, PackageWarning } from 'lucide-react';
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

export default function AdminDashboardPage() {
    const firestore = useFirestore();
    const { products, loading: productsLoading } = useAdminProducts();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
    const ordersQuery = useMemo(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
    }, [firestore]);
  
    const { data: orders, loading: ordersLoading } = useCollection<Order>(ordersQuery);

    const { totalRevenue, totalSales, salesLast7Days, chartData, averageOrderValue } = useMemo(() => {
        if (!orders) return { totalRevenue: 0, totalSales: 0, salesLast7Days: 0, chartData: [], averageOrderValue: 0 };

        const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'paid' || o.status === 'shipped');

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
    
    const lowStockProducts = useMemo(() => {
        if (!products) return [];
        return products
            .filter(p => p.stock <= 5 && p.stock > 0 && p.status === 'active')
            .sort((a,b) => a.stock - b.stock)
            .slice(0, 5);
    }, [products]);


    if (ordersLoading || productsLoading) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
  
    return (
      <>
        <div className="flex flex-col gap-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                        <CardTitle className="text-sm font-medium">Panier Moyen</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            <Price price={averageOrderValue} currency="FCA" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Valeur moyenne par commande
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
            
            {lowStockProducts.length > 0 && (
                 <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                             <PackageWarning className="h-5 w-5 text-destructive" />
                             <CardTitle>Alerte Stock Faible</CardTitle>
                        </div>
                        <CardDescription>
                            Ces produits ont un stock de 5 articles ou moins.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                                <div className="relative h-10 w-10 shrink-0">
                                                    <Image src={product.images[0].imageUrl} alt={product.title} fill className="rounded-md object-contain" />
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
                    </CardContent>
                </Card>
            )}

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
                            ))}
                        </TableBody>
                    </Table>
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
