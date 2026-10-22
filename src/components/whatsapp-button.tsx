
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
import { buildWhatsAppUrl, getWhatsAppNumber } from '@/lib/order-channels';

export function WhatsAppButton() {
    const { settings, loading } = useSiteSettings();
    const whatsappNumber = getWhatsAppNumber(settings);

    if (loading || !whatsappNumber) {
        return null;
    }
    
    const message = "Bonjour/Bonsoir Dakarboutik, je souhaite passer une commande. @https://dakarboutik.net/";
    
    const whatsappUrl = buildWhatsAppUrl(whatsappNumber, message);

    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 md:bottom-6"
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
