'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from './icons';
import { useSiteSettings } from '@/hooks/use-site-data';
import {
  buildOrderMessage,
  buildOrderPayload,
  buildWhatsAppUrl,
  getOrderPhoneNumber,
  getWhatsAppNumber,
  type OrderChannelItem,
} from '@/lib/order-channels';
import type { DeliveryMethod } from '@/lib/shipping';
import { useToast } from '@/hooks/use-toast';

type OrderChannelsProps = {
  items: OrderChannelItem[];
  deliveryMethod?: DeliveryMethod;
  customMessage?: string;
  className?: string;
  buttonClassName?: string;
  size?: 'default' | 'lg' | 'sm';
  whatsappLabel?: string;
  phoneLabel?: string;
  showPhone?: boolean;
  layout?: 'row' | 'column';
};

export function OrderChannels({
  items,
  deliveryMethod,
  customMessage,
  className,
  buttonClassName,
  size = 'lg',
  whatsappLabel = 'Commander sur WhatsApp',
  phoneLabel = 'Appeler pour commander',
  showPhone = true,
  layout = 'row',
}: OrderChannelsProps) {
  const { settings } = useSiteSettings();
  const { toast } = useToast();

  const whatsappUrl = useMemo(() => {
    const number = getWhatsAppNumber(settings);
    if (!number) return null;
    const message =
      customMessage ??
      buildOrderMessage(buildOrderPayload(settings, items, deliveryMethod));
    return buildWhatsAppUrl(number, message);
  }, [settings, items, deliveryMethod, customMessage]);

  const phoneNumber = useMemo(() => getOrderPhoneNumber(settings), [settings]);

  if (!whatsappUrl && !phoneNumber) return null;

  const handleWhatsApp = () => {
    if (!whatsappUrl) {
      toast({
        variant: 'destructive',
        title: 'Configuration requise',
        description: "Le numéro WhatsApp n'a pas été configuré par l'administrateur.",
      });
      return;
    }
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={className}>
      <div className={layout === 'column' ? 'flex flex-col gap-3' : 'flex flex-col gap-3 sm:flex-row'}>
        {whatsappUrl && (
          <Button
            type="button"
            size={size}
            onClick={handleWhatsApp}
            className={`h-12 flex-1 rounded-full bg-[#25D366] text-white hover:bg-[#1eb955] ${buttonClassName ?? ''}`}
          >
            <Icons.whatsapp className="mr-2 h-5 w-5" />
            {whatsappLabel}
          </Button>
        )}
        {showPhone && phoneNumber && (
          <Button asChild size={size} variant="outline" className={`h-12 flex-1 rounded-full ${buttonClassName ?? ''}`}>
            <a href={`tel:${phoneNumber}`}>
              <Icons.phone className="mr-2 h-5 w-5" />
              {phoneLabel}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
