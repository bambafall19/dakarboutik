
'use client';

import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function ImageCard({ image }: { image: typeof PlaceHolderImages[0] }) {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(image.imageUrl);
    toast({ title: 'Copié !', description: 'Le lien de l\'image a été copié dans le presse-papiers.' });
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-muted">
        <Image src={image.imageUrl} alt={image.description} fill className="object-contain" />
      </div>
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-medium truncate" title={image.description}>
          {image.description}
        </p>
        <div className="flex items-center gap-2">
          <Input readOnly value={image.imageUrl} className="text-xs h-8" />
          <Button size="icon" variant="outline" className="h-8 w-8 flex-shrink-0" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MediaPage() {
  return (
    <div className="py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Médiathèque</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <Card>
        <CardHeader>
          <CardTitle>Médiathèque</CardTitle>
          <CardDescription>
            Voici la liste des images de référence utilisées dans le projet. Vous pouvez copier leurs URLs pour les utiliser dans les produits ou les bannières.
            <br/>
            Pour ajouter de nouvelles images, vous pouvez utiliser un service comme <a href="https://fr.imgbb.com/" target="_blank" rel="noopener noreferrer" className="underline text-primary">ImgBB</a> et coller le lien direct ici.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {PlaceHolderImages.map(image => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
