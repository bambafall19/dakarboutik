
'use client';

import { ShieldCheck, MessageSquareHeart, Truck, BadgeCheck } from 'lucide-react';
import { Card } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const engagements = [
  {
    icon: ShieldCheck,
    title: 'Qualité Garantie',
    description: 'Nous sélectionnons les meilleurs produits pour vous.',
  },
  {
    icon: MessageSquareHeart,
    title: 'Service Client Réactif',
    description: 'Notre équipe est à votre écoute pour vous assister.',
  },
  {
    icon: BadgeCheck,
    title: 'Produits Authentiques',
    description: 'Nous ne vendons que des articles neufs et certifiés.',
  },
  {
    icon: Truck,
    title: 'Livraison Rapide',
    description: 'Recevez vos commandes dans les plus brefs délais.',
  },
];

export function Engagements() {
  return (
    <section className="bg-muted py-12 md:py-16">
      <div className="container">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Pourquoi nous choisir ?</h2>
            <p className="mt-2 text-muted-foreground">Votre satisfaction est notre priorité absolue.</p>
        </div>
        
        {/* Mobile Carousel View */}
        <div className="md:hidden px-4">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full max-w-xs mx-auto"
          >
            <CarouselContent>
              {engagements.map((engagement, index) => (
                <CarouselItem key={index}>
                  <div className="p-1 h-full">
                     <Card className="flex flex-col items-center text-center p-6 rounded-lg h-full">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <engagement.icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg">{engagement.title}</h3>
                        <p className="text-muted-foreground mt-1 text-sm">{engagement.description}</p>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
          {engagements.map((engagement) => (
            <Card key={engagement.title} className="text-center p-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="flex justify-center mb-4">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <engagement.icon className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <h3 className="font-bold text-lg">{engagement.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{engagement.description}</p>
            </Card>
          ))}
        </div>
        
      </div>
    </section>
  );
}
