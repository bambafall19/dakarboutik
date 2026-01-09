
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const testimonials = [
    {
        name: "Moussa Diop",
        role: "Client fidèle",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        text: "Service client au top et livraison super rapide ! J'ai reçu mon nouveau téléphone en moins de 24h. Je recommande Dakarboutik à 100%."
    },
    {
        name: "Aïssatou Fall",
        role: "Développeuse Web",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        text: "J'ai enfin trouvé des accessoires informatiques de qualité à Dakar. Leurs conseils m'ont permis de choisir la carte graphique parfaite pour mes besoins."
    },
    {
        name: "Ibrahima Sow",
        role: "Étudiant",
        avatar: "https://randomuser.me/api/portraits/men/46.jpg",
        text: "Les prix sont vraiment compétitifs et les produits sont authentiques. J'ai acheté un ordinateur portable pour mes études et j'en suis très satisfait."
    },
    {
        name: "Fatima Ba",
        role: "Entrepreneure",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        text: "Une boutique en ligne fiable et professionnelle. L'équipe est très réactive et les produits sont toujours conformes à la description. Bravo !"
    }
]

export function Testimonials() {
  return (
    <section>
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight">L'avis de nos Clients</h2>
            <p className="mt-2 text-muted-foreground">Découvrez pourquoi ils nous font confiance.</p>
        </div>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {testimonials.map((testimonial, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                    <div className="flex items-center gap-4 pt-4">
                        <Avatar>
                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                            <AvatarFallback>{testimonial.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-sm text-left">{testimonial.name}</p>
                            <p className="text-xs text-muted-foreground text-left">{testimonial.role}</p>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  )
}
