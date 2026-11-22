import type { Metadata } from 'next';
import { MerchantAccessForm } from '@/components/marketplace/merchant-access-form';
export const metadata: Metadata = { title: 'Votre accès boutique | DakarBoutik', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default function MerchantAccessPage() {
  return <main className="mx-auto min-h-screen max-w-lg px-5 py-10 text-slate-900"><p className="mb-6 font-bold text-emerald-900">DakarBoutik · Accès commerçant</p><MerchantAccessForm /></main>;
}
