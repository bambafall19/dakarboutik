'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Espace Administrateur</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Ajoutez, modifiez ou supprimez des produits de votre boutique.
            </p>
            <Button asChild>
              <Link href="/admin/add-product">
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter un produit
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
