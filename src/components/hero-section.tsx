import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { getBanners } from '@/lib/data';
import { Button } from './ui/button';

export function HeroSection() {
  const banners = getBanners();

  return (
    <section className="w-full">
      <div className="container">
      <Carousel
        className="w-full"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className="relative aspect-[16/6] w-full rounded-xl overflow-hidden">
                <Image
                  src={banner.image.imageUrl}
                  alt={banner.title}
                  data-ai-hint={banner.image.imageHint}
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                  <div className="container px-4 md:px-6">
                    <div className="max-w-xl text-white">
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                        {banner.title}
                      </h1>
                       <Button asChild className="mt-6" size="lg" variant="secondary">
                        <Link href={banner.linkUrl}>Découvrir</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:inline-flex" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:inline-flex" />
      </Carousel>
      </div>
    </section>
  );
}
