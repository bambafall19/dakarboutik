import type { Metadata } from 'next';
import { MerchantRecoveryRequest } from '@/components/marketplace/merchant-recovery-request';
export const metadata:Metadata={title:'Mot de passe oublié | DakarBoutik',robots:{index:false,follow:false},referrer:'no-referrer'};
export default function RecoveryPage(){return <main className="mx-auto min-h-screen max-w-lg px-5 py-8 text-slate-900"><p className="mb-5 font-bold text-emerald-900">DakarBoutik · Accès commerçant</p><MerchantRecoveryRequest/></main>;}
