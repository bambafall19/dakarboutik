
'use client';

import type { SiteSettings } from '@/lib/types';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import Link from "next/link";
import { ThemeToggle } from './theme-toggle';
import { Skeleton } from './ui/skeleton';

interface AnnouncementBarProps {
  settings?: SiteSettings | null;
  loading: boolean;
}

export function AnnouncementBar({ settings, loading }: AnnouncementBarProps) {
  if (loading) {
    return <Skeleton className="h-10" />;
  }

  return (
    <div className="bg-primary text-primary-foreground text-xs">
      <div className="container h-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <p className='hidden md:block'>{settings?.announcementMessage1 || 'Annonce -10% sur tous les articles'}</p>
        </div>
        <div className='flex items-center gap-4'>
            <div className="flex items-center gap-3">
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
