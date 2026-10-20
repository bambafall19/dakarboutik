
'use client';

import Link from 'next/link';
import { Icons } from './icons';
import { useSiteSettings } from '@/hooks/use-site-data';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function WhatsAppButton() {
    const { settings, loading } = useSiteSettings();

    if (loading || !settings?.whatsappNumber) {
        return null;
    }
    
    const message = "Bonjour/Bonsoir Dakarboutik, j'ai besoin de plus d'informations. @https://dakarboutik.net/";
    
    const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;

    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fixed bottom-24 md:bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
                    >
                        <Icons.whatsapp className="h-8 w-8" />
                        <span className="sr-only">Contactez-nous sur WhatsApp</span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-[#25D366] text-white border-0">
                    <p>Une question ?</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
