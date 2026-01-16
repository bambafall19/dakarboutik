
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function SuiviPage() {
  const [orderId, setOrderId] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      router.push(`/suivi/${orderId.trim()}`);
    }
  };

  return (
    <div className="container py-12 md:py-20 flex justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Suivre ma commande</CardTitle>
          <CardDescription>
            Entrez votre numéro de commande pour voir son statut.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Numéro de commande</Label>
              <Input
                id="orderId"
                placeholder="DKB-1705425257412-abcde"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Suivre
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
