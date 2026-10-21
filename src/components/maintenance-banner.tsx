'use client';

import { AlertTriangle } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';

export function MaintenanceBanner({ settings }: { settings?: SiteSettings | null }) {
  if (!settings?.maintenanceMode) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        Boutique en maintenance : certaines commandes sont temporairement indisponibles. Merci de
        nous contacter sur WhatsApp.
      </span>
    </div>
  );
}
