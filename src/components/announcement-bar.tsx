
'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { Banner, SiteSettings } from "@/lib/types";
import Autoplay from "embla-carousel-autoplay";
import { useBanners } from "@/hooks/use-site-data";
import Link from "next/link";
import Image from "next/image";

export function AnnouncementBar() {
  const { banners, loading } = useBanners();
  
  const announcementBanners = banners.filter(b => b.id.startsWith('announcement-'));

  if (loading || announcementBanners.length === 0) {
    return null;
  }

  return (
    <div className="bg-background text-foreground text-sm border-b">
      <Carousel
        className="w-full"
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {announcementBanners.map((banner) => (
            <CarouselItem key={banner.id}>
              <Link href={banner.linkUrl} className="relative flex h-10 w-full items-center justify-center">
                <Image 
                  src={banner.image.imageUrl} 
                  alt={banner.title} 
                  fill
                  className="object-contain"
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
