
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
        role: "Client fidèle, Mermoz",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        text: "Service client au top et livraison super rapide ! J'ai commandé un nouveau téléphone et je l'ai reçu aux Almadies en moins de 24h. Je recommande Dakarboutik à 100%."
    },
    {
        name: "Aïssatou Fall",
        role: "Développeuse Web, Fann",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        text: "Enfin une boutique fiable pour les accessoires informatiques à Dakar. J'avais un besoin urgent d'une carte graphique pour un projet, leurs conseils et leur stock m'ont sauvé la vie."
    },
    {
        name: "Ibrahima Sow",
        role: "Étudiant à l'UCAD",
        avatar: "https://randomuser.me/api/portraits/men/46.jpg",
        text: "Les prix sont vraiment compétitifs pour des produits authentiques. J'ai acheté un ordinateur portable pour mes études, parfait pour un budget étudiant. Le paiement par Wave était un plus."
    },
    {
        name: "Fatima Ba",
        role: "Entrepreneure, Sacré-Cœur",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        text: "En tant qu'entrepreneure, la fiabilité est primordiale. Dakarboutik est mon fournisseur de confiance pour tout le matériel électronique de mon bureau. Jamais déçue."
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
                <Card className="bg-secondary">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <p className="text-foreground italic">"{testimonial.text}"</p>
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
