
'use client';

import type { SiteSettings } from '@/lib/types';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import Link from "next/link";
import { ThemeToggle } from './theme-toggle';
import { Skeleton } from './ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from './ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import React from 'react';


// This wrapper ensures the component only renders on the client side.
function ClientOnly({ children }: { children: React.ReactNode }) {
    const [hasMounted, setHasMounted] = React.useState(false);
    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    return <>{children}</>;
}


interface AnnouncementBarProps {
  settings?: SiteSettings | null;
  loading: boolean;
}

export function AnnouncementBar({ settings, loading }: AnnouncementBarProps) {
  if (loading) {
    return <Skeleton className="h-10" />;
  }

  const announcements = [
    settings?.announcementMessage1,
    settings?.announcementMessage2,
    settings?.announcementMessage3
  ].filter(Boolean);

  if (announcements.length === 0) {
      announcements.push('Annonce -10% sur tous les articles');
  }

  return (
    <div className="bg-primary text-primary-foreground text-xs">
      <div className="container h-10 flex items-center justify-between">
        <div className="flex-1 overflow-hidden">
            <ClientOnly>
                <Carousel 
                    opts={{ loop: true, align: 'start' }}
                    plugins={[Autoplay({ delay: 3000 })]}
                    className="w-full"
                >
                    <CarouselContent>
                        {announcements.map((text, index) => (
                            <CarouselItem key={index} className="flex items-center justify-center md:justify-start">
                                <p className='truncate'>{text}</p>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </ClientOnly>
        </div>
        <div className='flex items-center gap-4 pl-4'>
            <div className="hidden md:flex items-center gap-3">
                <Link href="#" className="hover:opacity-80 transition-opacity"><Facebook className="h-4 w-4" /></Link>
                <Link href="#" className="hover:opacity-80 transition-opacity"><Instagram className="h-4 w-4" /></Link>
                <Link href="#" className="hover:opacity-80 transition-opacity"><Youtube className="h-4 w-4" /></Link>
            </div>
            <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
