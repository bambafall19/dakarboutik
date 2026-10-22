'use client';

import Link from 'next/link';
import React from 'react';

// ─── Événements sénégalais ────────────────────────────────────────────────────

type SenegalEvent = {
  key: string;
  label: string;
  emoji: string;
  description: string;
  color: string;           // Tailwind arbitrary HSL for border/glow
  gradient: string;        // Tailwind gradient classes
  badgeClass: string;      // Badge background
  months: number[];        // 1-indexed
  href: string;
};

const EVENTS: SenegalEvent[] = [
  {
    key: 'joj',
    label: 'JOJ Dakar 2026',
    emoji: '🏅',
    description: 'Célébrez les Jeux Olympiques de la Jeunesse avec nos offres spéciales.',
    color: '#0B6E4F',
    gradient: 'from-emerald-700 to-teal-800',
    badgeClass: 'bg-emerald-700',
    months: [10, 11],
    href: '/products?event=joj',
  },
  {
    key: 'tabaski',
    label: 'Tabaski',
    emoji: '🐑',
    description: 'Habillement, cadeaux, décoration : tout pour une belle fête du Mouton.',
    color: '#1565C0',
    gradient: 'from-blue-700 to-indigo-800',
    badgeClass: 'bg-blue-700',
    months: [5, 6],
    href: '/products?event=tabaski',
  },
  {
    key: 'korite',
    label: 'Korité',
    emoji: '🌙',
    description: 'Boubous, parfums, gourmandises : sublimez votre Aïd El-Fitr.',
    color: '#6A1B9A',
    gradient: 'from-purple-700 to-violet-800',
    badgeClass: 'bg-purple-700',
    months: [3, 4],
    href: '/products?event=korite',
  },
  {
    key: 'magal',
    label: 'Grand Magal',
    emoji: '✨',
    description: 'Tenues de cérémonie, ustensiles, cadeaux pour le Magal de Touba.',
    color: '#8D4E00',
    gradient: 'from-amber-700 to-orange-800',
    badgeClass: 'bg-amber-700',
    months: [8],
    href: '/products?event=magal',
  },
  {
    key: 'rentree',
    label: 'Rentrée Scolaire',
    emoji: '🎒',
    description: 'Fournitures, cartables, tenues : préparez la rentrée au meilleur prix.',
    color: '#E65100',
    gradient: 'from-orange-600 to-red-700',
    badgeClass: 'bg-orange-600',
    months: [9, 10],
    href: '/products?event=rentree',
  },
  {
    key: 'noel',
    label: 'Noël & Nouvel An',
    emoji: '🎉',
    description: 'Cadeaux, décorations, électronique : offrez ce qu\'il y a de mieux.',
    color: '#B71C1C',
    gradient: 'from-red-700 to-rose-800',
    badgeClass: 'bg-red-700',
    months: [12, 1],
    href: '/products?event=noel',
  },
];

/** Returns the current active event (or events near the current month). */
function getActiveEvents(allEvents: SenegalEvent[]): SenegalEvent[] {
  const month = new Date().getMonth() + 1; // 1-indexed
  // Show events of the current or next month
  const active = allEvents.filter(
    (e) => e.months.includes(month) || e.months.includes(month === 12 ? 1 : month + 1)
  );
  return active.length > 0 ? active : allEvents.slice(0, 3);
}

function EventCard({ event, isFeatured }: { event: SenegalEvent; isFeatured?: boolean }) {
  return (
    <Link
      href={event.href}
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br ${event.gradient} text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isFeatured ? 'md:col-span-2 md:row-span-2' : ''}`}
    >
      {/* Glow blob */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100" />

      <div className={`flex flex-col gap-3 p-6 ${isFeatured ? 'md:p-8' : ''}`}>
        {/* Badge */}
        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${event.badgeClass} bg-opacity-80 text-white ring-1 ring-white/20`}
        >
          En ce moment
        </span>

        {/* Emoji */}
        <div
          className={`flex items-center justify-center rounded-2xl bg-white/10 transition-transform duration-300 group-hover:scale-110 ${isFeatured ? 'h-16 w-16 md:h-20 md:w-20' : 'h-12 w-12'}`}
        >
          <span className={isFeatured ? 'text-4xl' : 'text-2xl'}>{event.emoji}</span>
        </div>

        <h3
          className={`font-headline font-extrabold leading-tight text-white ${isFeatured ? 'text-2xl md:text-3xl' : 'text-xl'}`}
        >
          {event.label}
        </h3>
        <p className={`text-sm text-white/80 leading-relaxed ${isFeatured ? '' : 'line-clamp-2'}`}>
          {event.description}
        </p>

        {/* CTA */}
        <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors group-hover:bg-white/25">
          Voir les offres →
        </span>
      </div>
    </Link>
  );
}

interface SeasonsProps {
  /** Override active events (useful for server-side rendering with specific dates) */
  events?: SenegalEvent[];
}

export function SeasonalEvents({ events }: SeasonsProps) {
  const activeEvents = events ?? getActiveEvents(EVENTS);
  const allEvents = EVENTS;

  return (
    <section className="container">
      {/* Section header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Calendrier événements
          </span>
          <h2 className="mt-1 font-headline text-2xl font-extrabold tracking-tight md:text-3xl">
            À ne pas rater 🗓️
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Promotions spéciales pour les grandes fêtes et événements du Sénégal.
          </p>
        </div>
        <Link
          href="/products"
          className="hidden shrink-0 text-sm font-semibold text-primary hover:underline md:block"
        >
          Toutes les offres →
        </Link>
      </div>

      {/* Active events – featured grid */}
      {activeEvents.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeEvents.map((event, i) => (
            <EventCard key={event.key} event={event} isFeatured={i === 0 && activeEvents.length > 1} />
          ))}
        </div>
      )}

      {/* All events – horizontal scroll on mobile */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-3 w-max md:w-auto md:flex-wrap">
          {allEvents.map((event) => {
            const isActive = activeEvents.some((a) => a.key === event.key);
            return (
              <Link
                key={event.key}
                href={event.href}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 hover:shadow-md
                  ${isActive
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-card text-foreground hover:border-primary/60 hover:bg-primary/5'
                  }`}
              >
                <span>{event.emoji}</span>
                <span>{event.label}</span>
                {isActive && (
                  <span className="ml-1 flex h-2 w-2 rounded-full bg-accent">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-accent opacity-75" />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
