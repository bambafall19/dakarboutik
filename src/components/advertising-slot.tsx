"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Campaign, campaignLive, safeAdUrl } from "@/lib/advertising";
import { OFFICIAL_CATALOG_ENABLED } from "@/lib/catalog-mode";
import { recordEngagement } from "@/lib/engagement-client";
import { AdCreative } from "./ad-creative";
import styles from "./advertising-slot.module.css";

function AdCard({
  campaign: c,
  seen,
}: {
  campaign: Campaign;
  seen: Set<string>;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || seen.has(c.id)) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let visible = false;
    const schedule = () => {
      clearTimeout(timer);
      if (!visible || document.hidden || seen.has(c.id)) return;
      timer = setTimeout(() => {
        if (document.hidden || seen.has(c.id)) return;
        seen.add(c.id);
        recordEngagement("ad_view", c.placement, c.id);
      }, 1000);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        visible =
          entries[0]?.isIntersecting && entries[0].intersectionRatio >= 0.5;
        schedule();
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [c.id, c.placement, seen]);
  return (
    <a
      ref={ref}
      href={c.targetUrl}
      rel="sponsored noopener"
      onClick={() => recordEngagement("ad_click", c.placement, c.id)}
      className="block min-w-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600"
    >
      <AdCreative campaign={c} />
    </a>
  );
}

export function AdvertisingSlot({
  placement,
  category = "",
}: {
  placement: Campaign["placement"];
  category?: string;
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const seen = useRef(new Set<string>());
  useEffect(() => {
    const controller = new AbortController();
    const refresh = () => {
      void fetch("/api/advertising", { signal: controller.signal })
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setCampaigns(Array.isArray(data) ? data : []))
        .catch(() => {});
    };
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, []);
  const day = new Date().toISOString().slice(0, 10);
  const visible = campaigns.filter(
    (c) =>
      safeAdUrl(c.targetUrl) &&
      safeAdUrl(c.imageUrl) &&
      (OFFICIAL_CATALOG_ENABLED ||
        !/^https:\/\/dakarboutik.net\/products(?:[/?#]|$)|^\/products(?:[/?#]|$)/.test(
          c.targetUrl,
        )) &&
      c.placement === placement &&
      campaignLive(c, day) &&
      (!c.category || c.category === category),
  );
  const count = visible.length;
  const position = count ? index % count : 0;
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    change();
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    if (!root.current) return;
    const observer = new IntersectionObserver(
      (entries) => setOnScreen(entries[0]?.isIntersecting ?? false),
      { threshold: 0 },
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [count]);
  useEffect(() => {
    if (count < 2 || hovered || focused || reduced || !onScreen)
      return;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count);
    }, 6000);
    return () => clearInterval(timer);
  }, [count, hovered, focused, reduced, onScreen]);
  if (!count) return null;
  const move = (delta: number) => setIndex((i) => (i + delta + count) % count);
  return (
    <section
      ref={root}
      aria-label="Publicités"
      aria-roledescription="carrousel"
      className="my-5 min-w-0 space-y-3"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={(e) =>
        setFocused((e.target as HTMLElement).matches(":focus-visible"))
      }
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-emerald-800">
          À découvrir chez nos partenaires
        </p>
        {count > 1 && (
          <span className="text-sm tabular-nums text-slate-600">
            Publicité {position + 1} sur {count}
          </span>
        )}
      </div>
      <div aria-live={focused ? "polite" : "off"} aria-atomic="true">
        <AdCard
          key={visible[position].id}
          campaign={visible[position]}
          seen={seen.current}
        />
      </div>
      {count > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Publicité précédente"
            onClick={() => move(-1)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full border bg-white text-emerald-900"
          >
            <ChevronLeft size={20} />
          </button>
          <div className={styles.indicators} aria-label="Choisir une publicité">
            {visible.map((campaign, i) => (
              <button
                key={campaign.id}
                type="button"
                aria-label={`Afficher la publicité ${i + 1} : ${campaign.title}`}
                aria-current={i === position ? "true" : undefined}
                onClick={() => setIndex(i)}
              >
                <span />
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Publicité suivante"
            onClick={() => move(1)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full border bg-white text-emerald-900"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </section>
  );
}
