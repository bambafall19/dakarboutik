
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PlusCircle,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  LineChart,
  Users2,
  Image as ImageIcon,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

const stats = [
  {
    title: 'Chiffre d\'affaires total',
    value: '12,345,678 F CFA',
    icon: DollarSign,
  },
  { title: 'Ventes', value: '1,250', icon: ShoppingCart },
  { title: 'Clients', value: '820', icon: Users },
  { title: 'Produits', value: '132', icon: Package },
];

export default function AdminPage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Espace Administrateur</h1>

      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Gestion des Produits</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-muted-foreground mb-4">
              Ajoutez, modifiez ou supprimez des produits de votre boutique.
            </p>
          </CardContent>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/add-product">
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter un produit
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Gestion des Commandes</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-muted-foreground mb-4">
              Consultez et gérez les commandes de vos clients.
            </p>
          </CardContent>
          <CardContent>
            <Button asChild className="w-full" variant="secondary">
              <Link href="#">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Voir les commandes
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Gestion des Clients</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-muted-foreground mb-4">
              Consultez la liste et l'historique de vos clients.
            </p>
          </CardContent>
          <CardContent>
            <Button asChild className="w-full" variant="secondary">
              <Link href="#">
                <Users2 className="mr-2 h-4 w-4" />
                Voir les clients
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Gestion des Bannières</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-muted-foreground mb-4">
              Gérez les bannières promotionnelles de la page d'accueil.
            </p>
          </CardContent>
          <CardContent>
            <Button asChild className="w-full" variant="secondary">
              <Link href="#">
                <ImageIcon className="mr-2 h-4 w-4" />
                Gérer les bannières
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Rapports et Analyses</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-muted-foreground mb-4">
              Analysez les performances de votre boutique.
            </p>
          </CardContent>
          <CardContent>
            <Button asChild className="w-full" variant="secondary">
              <Link href="#">
                <LineChart className="mr-2 h-4 w-4" />
                Voir les rapports
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Réglages du site</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-muted-foreground mb-4">
              Gérez les paramètres généraux comme le logo.
            </p>
          </CardContent>
          <CardContent>
            <Button asChild className="w-full" variant="secondary">
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Modifier les réglages
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
