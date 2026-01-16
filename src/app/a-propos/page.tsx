'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import Image from 'next/image';
import { findImage } from '@/lib/placeholder-images';

export default function AboutPage() {
    const aboutImage = findImage('banner1');

  return (
    <div className="container py-8 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>À Propos de Nous</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader className="items-center text-center">
            <Logo />
          <CardTitle className="text-3xl md:text-4xl mt-4">Notre Histoire</CardTitle>
          <p className="text-muted-foreground pt-2 max-w-2xl mx-auto">
            Découvrez comment DakarBoutik est devenue la destination de confiance pour l'électronique de qualité au Sénégal.
          </p>
        </CardHeader>
        <CardContent className="prose max-w-4xl mx-auto text-foreground/80 space-y-8 pt-6">
            <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image 
                    src={aboutImage.imageUrl}
                    alt="Boutique DakarBoutik"
                    fill
                    className="object-cover"
                />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Notre Mission</h2>
              <p>
                Chez DakarBoutik, notre mission est simple : rendre la technologie de pointe accessible à tous au Sénégal. Nous croyons que chaque personne mérite d'avoir accès aux meilleurs outils pour communiquer, travailler et se divertir. C'est pourquoi nous nous engageons à offrir des produits électroniques authentiques, de haute qualité, à des prix compétitifs.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">De Dakar, pour le Sénégal</h2>
              <p>
                Fondée au cœur de Dakar, notre entreprise est fièrement sénégalaise. Nous comprenons les besoins spécifiques de nos clients et nous nous efforçons de proposer un catalogue de produits adapté, allant des derniers smartphones aux ordinateurs portables performants, en passant par une large gamme d'accessoires. Chaque produit est soigneusement sélectionné pour sa fiabilité et sa performance.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Un Service Client à Votre Écoute</h2>
              <p>
                Plus qu'un simple vendeur, nous aspirons à être votre partenaire de confiance. Notre service client est basé à Dakar et est toujours prêt à vous conseiller et à vous assister, que ce soit pour choisir le bon produit ou pour un suivi après-vente. Votre satisfaction est notre plus grande récompense.
              </p>
              <p>Merci de faire partie de l'aventure DakarBoutik !</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
