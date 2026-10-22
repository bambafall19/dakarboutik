import Image from 'next/image';
import type { Vendor } from '@/lib/types';
import { BadgeCheck, ShieldCheck } from 'lucide-react';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

interface PartnerBoutiquesProps {
  vendors: Vendor[];
}

export function PartnerBoutiques({ vendors }: PartnerBoutiquesProps) {
  const activeVendors = vendors.filter((vendor) => vendor.isActive !== false && vendor.name);

  if (activeVendors.length === 0) return null;

  return (
    <section className="container" aria-labelledby="partner-boutiques-title">
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-secondary/60 via-background to-accent/10 p-6 shadow-[0_1px_2px_rgba(16,42,35,0.04),0_28px_60px_-42px_rgba(16,42,35,0.35)] md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
              Réseau de confiance · {activeVendors.length} boutique{activeVendors.length > 1 ? 's' : ''}
            </span>
            <h2
              id="partner-boutiques-title"
              className="mt-1.5 font-headline text-2xl font-extrabold tracking-tight md:text-3xl"
            >
              Nos boutiques partenaires
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Des boutiques locales de confiance qui nous accompagnent au quotidien. Une seule
              adresse pour commander : DakarBoutik.
            </p>
          </div>

          <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-3.5 py-2 text-xs font-semibold text-primary shadow-sm backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
            Commandes et service client assurés par DakarBoutik
          </div>
        </div>

        <div className="relative mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6">
          {activeVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="group flex min-h-[7.5rem] flex-col items-center justify-center gap-2.5 rounded-2xl border border-border/60 bg-card/90 px-4 py-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_18px_35px_-25px_rgba(16,42,35,0.45)]"
            >
              <div className="relative flex h-12 w-full items-center justify-center">
                {vendor.logoUrl ? (
                  <Image
                    src={vendor.logoUrl}
                    alt={`Logo ${vendor.name}`}
                    fill
                    sizes="(max-width: 640px) 40vw, 180px"
                    className="object-contain opacity-80 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-600 font-headline text-base font-extrabold text-primary-foreground ring-4 ring-primary/10">
                    {initials(vendor.name)}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight text-foreground">
                  {vendor.name}
                </p>
                <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                  {vendor.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
                  <span className="truncate">{vendor.city || 'Dakar'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
