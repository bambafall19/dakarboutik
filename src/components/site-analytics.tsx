 'use client';
import { Analytics } from '@vercel/analytics/next';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { measurementAllowed, recordEngagement } from '@/lib/engagement-client';
const privatePath = (p:string) => /^\/(admin|commercant|login|register|signup|suivi|checkout|api|auth)(\/|$)/.test(p);
export function SiteAnalytics() {
 const path=usePathname();
 useEffect(()=>{
  if(privatePath(path)) return;
  if(/^\/boutiques\/[^/]+$/.test(path)) recordEngagement('shop_view','shops');
  const click=(event:MouseEvent)=>{
   const link=(event.target as Element)?.closest?.('a');
   if(!link) return;
   const url=new URL(link.href,location.origin);
   const place=path==='/'?'home':path.startsWith('/products')?'catalog':path.startsWith('/boutiques')?'shops':'other';
   if(url.hostname==='wa.me'||url.hostname==='api.whatsapp.com') recordEngagement('whatsapp_click',place);
   if(url.origin===location.origin&&url.pathname==='/checkout') recordEngagement('checkout_open',place);
  };
  document.addEventListener('click',click);
  return ()=>document.removeEventListener('click',click);
 },[path]);
 return <Analytics beforeSend={event=>{
  if(!measurementAllowed()) return null;
  const url=new URL(event.url);
  if(privatePath(url.pathname)) return null;
  url.search='';url.hash='';
  return {...event,url:url.toString()};
 }} />;
}
