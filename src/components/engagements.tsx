
'use client';

import { ShieldCheck, MessageSquareHeart, Truck, CreditCard } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card"
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
    icon: CreditCard,
    title: 'Paiement Sécurisé',
    description: 'Achetez en toute confiance grâce à nos systèmes de paiement.',
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
        <div className="md:hidden">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {engagements.map((engagement, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
                  <div className="p-1">
                     <div className="flex flex-col items-center text-center p-6 rounded-lg h-full">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <engagement.icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg">{engagement.title}</h3>
                        <p className="text-muted-foreground mt-1 text-sm">{engagement.description}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-[-10px]" />
            <CarouselNext className="absolute right-[-10px]" />
          </Carousel>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
          {engagements.map((engagement) => (
            <div key={engagement.title} className="flex flex-col items-center text-center p-6 rounded-lg transition-all duration-300">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <engagement.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg">{engagement.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{engagement.description}</p>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
