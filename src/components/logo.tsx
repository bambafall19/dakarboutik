"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  onClick?: () => void;
  imageUrl?: string | null;
  loading?: boolean;
  hideTextOnMobile?: boolean;
  inverted?: boolean;
}
// One official brand asset across the storefront, marketplace and account pages.
// Legacy settings props are retained for compatibility, but cannot replace the brand.
export const Logo = ({ className, onClick, inverted = false }: LogoProps) => (
  <Link href="/" aria-label="DakarBoutik — accueil" onClick={onClick}
    className={cn("inline-flex shrink-0 items-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700", inverted && "bg-white p-1", className)}>
    <img src="/dakarboutik-logo-tricolore.png" alt="DakarBoutik" width={64} height={64} className="h-16 w-16 object-contain" />
  </Link>
);
