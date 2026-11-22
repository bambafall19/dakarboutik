"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { marjiPage } from "@/lib/marji-assistant";
import { MarjiHelp } from "./marketplace/marji-help";
import { MessageCircle, Search, ArrowRight } from "lucide-react";
import { Icons } from "./icons";
import { useSiteSettings } from "@/hooks/use-site-data";
import { buildWhatsAppUrl, getWhatsAppNumber } from "@/lib/order-channels";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

const topics = [
  {
    label: "Trouver un produit",
    text: "Recherchez parmi les produits des boutiques partenaires. Le prix, la disponibilité, la livraison et le paiement se confirment directement avec le vendeur.",
    href: "/boutiques#recherche",
    action: "Rechercher un produit",
  },
  {
    label: "Contacter une boutique",
    text: "Ouvrez la boutique ou la fiche du produit, puis appuyez sur « Contacter le vendeur ». WhatsApp prépare un message pour ce commerçant ; vous choisissez de l’envoyer.",
    href: "/boutiques#boutiques-resultats",
    action: "Trouver une boutique",
  },
  {
    label: "Inscrire ma boutique",
    text: "Créez votre espace commerçant, présentez votre boutique et ajoutez vos produits. Les fiches sont publiées après validation.",
    href: "/commercant?inscription=1",
    action: "Inscrire ma boutique",
  },
  {
    label: "Faire connaître ma boutique",
    text: "Découvrez les forfaits selon le nombre de produits et les possibilités de publicité. La facturation des forfaits est en préparation ; les espaces publicitaires sont sur devis.",
    href: "/forfaits",
    action: "Voir les forfaits et la publicité",
  },
  {
    label: "Suivre une ancienne commande",
    text: "Retrouvez une ancienne commande DakarBoutik avec sa référence. Pour un achat auprès d’une boutique partenaire, contactez directement ce commerçant.",
    href: "/suivi",
    action: "Ouvrir le suivi",
  },
];

export function WhatsAppButton() {
  const pathname = usePathname();
  const context = marjiPage(pathname || '');
  return context ? <MarjiHelp key={pathname} productId={context.productId} /> : <GeneralHelp />;
}

function GeneralHelp() {
  const { settings } = useSiteSettings();
  const number = getWhatsAppNumber(settings);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const show = () => {
      returnFocus.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setSelected(null);
      setOpen(true);
    };
    window.addEventListener("dakarboutik:open-help", show);
    return () => window.removeEventListener("dakarboutik:open-help", show);
  }, []);
  const topic = selected === null ? null : topics[selected];
  const whatsappUrl = number
    ? buildWhatsAppUrl(
        number,
        `Bonjour DakarBoutik, j’ai besoin d’aide${topic ? ` : ${topic.label}` : ""}.`,
      )
    : null;
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setSelected(null);
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="relative mx-auto mb-24 mt-6 md:fixed md:mb-0 md:mt-0 z-40 flex min-h-11 items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 shadow-sm md:right-4 md:min-h-12 md:gap-2 md:border-transparent md:bg-emerald-700 md:px-4 md:py-3 md:text-base md:text-white md:shadow-lg hover:bg-emerald-50 md:hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:bottom-6"
          aria-label="On vous guide ? Ouvrir l’aide DakarBoutik"
        >
          <MessageCircle className="h-4 w-4 md:h-6 md:w-6" aria-hidden="true" />
          On vous guide ?
        </button>
      </DialogTrigger>
      <DialogContent
        animated={false}
        onCloseAutoFocus={(event) => {
          if (returnFocus.current?.isConnected) {
            event.preventDefault();
            returnFocus.current.focus({ preventScroll: true });
          }
          returnFocus.current = null;
        }}
        className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-5 motion-reduce:animate-none"
      >
        <DialogTitle className="pr-5 text-xl text-emerald-800">
          On vous guide ?
        </DialogTitle>
        <DialogDescription>
          Trouvez un produit ou une boutique, ou développez votre activité. Le
          prix, la livraison et le paiement se confirment directement avec
          chaque boutique.
        </DialogDescription>
        <div className="grid grid-cols-2 gap-2">
          {topics.map((item, index) => (
            <button
              type="button"
              key={item.label}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
              className={`min-h-12 rounded-xl border p-3 text-left text-sm font-medium ${selected === index ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "hover:bg-muted"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div aria-live="polite" aria-atomic="true">
          {topic && (
            <div className="rounded-xl bg-muted p-4">
              <p className="text-sm leading-relaxed">{topic.text}</p>
              <Link
                href={topic.href}
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-emerald-800 underline"
              >
                {topic.action}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
        <form action="/boutiques" role="search" className="space-y-2">
          <label htmlFor="assistant-product" className="text-sm font-medium">
            Quel produit recherchez-vous ?
          </label>
          <div className="flex gap-2">
            <input
              id="assistant-product"
              name="q"
              type="search"
              required
              maxLength={120}
              placeholder="Batterie, ordinateur, téléphone…"
              className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 text-base"
            />
            <button
              type="submit"
              aria-label="Rechercher un produit"
              className="min-h-11 rounded-lg bg-emerald-700 px-3 text-white"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            data-engagement-audience="support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-3 font-semibold text-white hover:bg-emerald-800"
          >
            <Icons.whatsapp className="h-5 w-5" />
            Contacter l’équipe sur WhatsApp
          </a>
        ) : (
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="font-semibold underline"
          >
            Contacter l’équipe
          </Link>
        )}
        <p className="text-xs text-muted-foreground">
          WhatsApp s’ouvre avec un message à vérifier et à envoyer. Aucun
          message n’est envoyé automatiquement par cet assistant.
        </p>
      </DialogContent>
    </Dialog>
  );
}
