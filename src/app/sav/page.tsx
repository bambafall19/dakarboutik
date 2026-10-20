
'use client';

import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Wrench, PackageCheck, Banknote, CheckCircle2, XCircle, Phone, Clock, ArrowRight } from 'lucide-react';

const covered = [
  'Tour type de défaillance matérielle empêchant l\'opérabilité basique',
  'Les mêmes issues que la garantie UE',
  'Prise en charge par les services de réparation DakarBoutik',
];

const notCovered = [
  'Le remplacement ou la défaillance de tout accessoire',
  'Une mauvaise utilisation ou utilisation non conforme aux instructions',
  'Un mauvais stockage non conforme au manuel',
  'Des réparations effectuées par un centre non autorisé',
  'L\'usage d\'accessoires non conformes ou d\'équipements non professionnels',
  'Des influences externes (accidents, catastrophes naturelles)',
  'L\'immersion d\'appareils résistants à l\'eau dans l\'eau salée ou chlorée',
  'Les dommages mécaniques, force majeure ou conditions inadéquates',
  'Les défauts déjà connus de l\'acheteur au moment de l\'achat',
  'Les dommages provoqués par l\'eau',
];

const options = [
  {
    icon: Wrench,
    title: 'Réparation',
    description: 'Constatation de panne et intervention par nos techniciens.',
  },
  {
    icon: PackageCheck,
    title: 'Remplacement',
    description: 'Nous vous livrons le même produit, à nos frais.',
  },
  {
    icon: Banknote,
    title: 'Remboursement',
    description: 'À l\'exclusion des frais d\'assurance.',
  },
];

export default function SAVPage() {
  return (
    <div className="container py-8 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Garantie & SAV</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-nav px-6 py-12 text-nav-foreground md:px-12 md:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
            <ShieldCheck className="h-3.5 w-3.5" />
            Service après-vente
          </span>
          <h1 className="mt-4 font-headline text-3xl font-extrabold tracking-tight text-balance md:text-4xl">
            Garantie & SAV
          </h1>
          <p className="mt-3 max-w-xl text-balance text-sm text-nav-foreground/70 md:text-base">
            La garantie du vendeur, de 12 à 24 mois selon le fournisseur. DakarBoutik
            dispose de ses propres services de réparation pour vous accompagner.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/contact">
                <Phone className="mr-2 h-4 w-4" />
                Contacter le SAV
              </Link>
            </Button>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-nav-foreground/80">
              <Clock className="h-4 w-4 text-accent" />
              Lun – Ven, 8h30 – 14h30
            </span>
          </div>
        </div>
      </div>

      {/* Covered / Not covered */}
      <div className="mb-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <h2 className="font-headline text-xl font-bold">Ce que couvre la garantie</h2>
          </div>
          <ul className="space-y-3">
            {covered.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <XCircle className="h-5 w-5" />
            </span>
            <h2 className="font-headline text-xl font-bold">Ce qu&apos;elle ne couvre pas</h2>
          </div>
          <ul className="space-y-2.5">
            {notCovered.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive/70" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Options */}
      <div className="mb-10">
        <h2 className="mb-6 font-headline text-2xl font-extrabold tracking-tight">
          En cas de panne, trois options
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {options.map((option, index) => (
            <div
              key={option.title}
              className="card-premium group relative flex flex-col gap-3 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-22px_rgba(11,110,79,0.35)]"
            >
              <span className="absolute right-5 top-5 font-headline text-3xl font-extrabold text-primary/10">
                {index + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
                <option.icon className="h-6 w-6" />
              </span>
              <h3 className="font-headline text-lg font-bold">{option.title}</h3>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Legal notes */}
      <div className="space-y-5 rounded-2xl border border-border/70 bg-card p-6 text-sm text-foreground/80 md:p-8">
        <p>
          DakarBoutik ne sera tenu responsable en aucun cas si les fournisseurs refusent
          d&apos;accepter la garantie pour l&apos;un des motifs énoncés ci-dessus.
        </p>
        <p>
          Dans le cas où la garantie est refusée, le producteur vous fera une proposition
          pour la réparation du produit. Si le client refuse cette proposition, le
          producteur a le droit d&apos;exiger que ses dépenses administratives soient
          couvertes par le client. S&apos;il accepte, il est obligé de payer le montant
          total de la facture au producteur.
        </p>
        <p>
          Si le produit n&apos;est pas garanti UE et que la garantie UE ne couvre pas la
          réparation, vous bénéficiez de la garantie du vendeur. Notre service client vous
          communiquera l&apos;adresse du centre de réparation. Une fois le produit reçu, il
          sera testé afin de déterminer son état, suite à quoi DakarBoutik vous offrira
          l&apos;une des trois options ci-dessus.
        </p>
        <p>
          DakarBoutik se réserve le droit de proposer au client l&apos;option la plus
          adéquate compte tenu de la particularité de chaque dossier.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-primary/20 bg-primary/5 p-6 text-center sm:flex-row sm:text-left md:p-8">
        <div>
          <h3 className="font-headline text-xl font-bold">Un problème sur un produit ?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Notre équipe SAV vous répond du lundi au vendredi, de 8h30 à 14h30.
          </p>
        </div>
        <Button asChild className="rounded-full bg-primary px-6 hover:bg-primary/90">
          <Link href="/contact">
            Nous contacter
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
