"use client";
import { Analytics } from "@vercel/analytics/next";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { internalTestEnabled, measurementAllowed, recordEngagement } from "@/lib/engagement-client";
import { contactAttribution } from "@/lib/engagement-attribution";
const privatePath = (p: string) =>
  /^\/(admin|commercant|acces-boutique|recuperer-acces|login|register|signup|suivi|checkout|api|auth|order-confirmation)(\/|$)/.test(
    p,
  );
export function SiteAnalytics() {
  const path = usePathname();
  useEffect(() => {
    const shop = path.match(/^\/boutiques\/([^/]+)\/?$/)?.[1];
    if (shop)
      recordEngagement(
        "shop_view",
        "shops",
        undefined,
        contactAttribution("partner", shop),
      );
    const click = (event: MouseEvent) => {
      const link = (event.target as Element)?.closest?.("a");
      if (!link) return;
      if (
        privatePath(path) &&
        link.getAttribute("data-engagement-audience") !== "support"
      )
        return;
      const url = new URL(link.href, location.origin);
      const place =
        path === "/"
          ? "home"
          : path.startsWith("/products")
            ? "catalog"
            : path.startsWith("/boutiques")
              ? "shops"
              : "other";
      if (url.hostname === "wa.me" || url.hostname === "api.whatsapp.com") {
        const audience = link.getAttribute("data-engagement-audience");
        const attribution = contactAttribution(
          audience,
          link.getAttribute("data-shop-id"),
        );
        recordEngagement("whatsapp_click", place, undefined, attribution);
      }
      if (url.origin === location.origin && url.pathname === "/checkout")
        recordEngagement("checkout_open", place);
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, [path]);
  return (
    <Analytics
      beforeSend={(event) => {
        if (internalTestEnabled() || !measurementAllowed()) return null;
        const url = new URL(event.url);
        if (privatePath(url.pathname)) return null;
        url.search = "";
        url.hash = "";
        return { ...event, url: url.toString() };
      }}
    />
  );
}
