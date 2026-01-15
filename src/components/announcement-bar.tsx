
'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { SiteSettings } from "@/lib/types";
import Autoplay from "embla-carousel-autoplay";

interface AnnouncementBarProps {
  settings?: SiteSettings | null;
}

export function AnnouncementBar({ settings }: AnnouncementBarProps) {
  const messages = [
    settings?.announcementMessage1,
    settings?.announcementMessage2,
    settings?.announcementMessage3,
  ].filter((msg): msg is string => !!msg);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="bg-white text-black text-sm border-b">
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
          {messages.map((message, index) => (
            <CarouselItem key={index}>
              <div className="py-2 text-center">{message}</div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
