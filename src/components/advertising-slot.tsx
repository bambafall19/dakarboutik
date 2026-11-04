 'use client';
import { useEffect, useRef, useState } from 'react';
import { type Campaign, campaignLive, safeAdUrl } from '@/lib/advertising';
import { recordEngagement } from '@/lib/engagement-client';
function AdCard({campaign:c}:{campaign:Campaign}) {
 const ref=useRef<HTMLAnchorElement>(null);
 const seen=useRef(false);
 useEffect(()=>{
  const element=ref.current;
  if(!element || seen.current) return;
  let timer:ReturnType<typeof setTimeout> | undefined;
  const observer=new IntersectionObserver(entries=>{
   clearTimeout(timer);
   if(entries[0]?.isIntersecting && entries[0].intersectionRatio>=0.5) timer=setTimeout(()=>{
    if(document.hidden||seen.current) return;
    seen.current=true;recordEngagement('ad_view',c.placement,c.id);observer.disconnect();
   },1000);
  },{threshold:0.5});
  observer.observe(element);
  return ()=>{clearTimeout(timer);observer.disconnect();};
 },[c.id,c.placement]);
 if(!safeAdUrl(c.targetUrl)||!safeAdUrl(c.imageUrl)) return null;
 return <a ref={ref} href={c.targetUrl} rel="sponsored noopener" onClick={()=>recordEngagement('ad_click',c.placement,c.id)} className="group flex min-w-0 items-center gap-4 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-emerald-50 p-4 text-slate-900 transition-shadow hover:shadow-md">
  <img src={c.imageUrl} alt="" width={160} height={120} loading="lazy" className="h-24 w-24 shrink-0 rounded-xl bg-white object-contain sm:h-32 sm:w-40" />
  <div className="min-w-0"><span className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Sponsorisé</span><h3 className="mt-2 break-words text-lg font-bold">{c.title}</h3><span className="mt-3 block text-sm font-semibold text-emerald-800">Découvrir →</span></div>
 </a>;
}
export function AdvertisingSlot({placement,category=''}:{placement:Campaign['placement'];category?:string}) {
 const [campaigns,setCampaigns]=useState<Campaign[]>([]);
 useEffect(()=>{
  const controller=new AbortController();
  const refresh=()=>{void fetch('/api/advertising',{signal:controller.signal}).then(r=>r.ok?r.json():[]).then(data=>setCampaigns(Array.isArray(data)?data:[])).catch(()=>{});};
  refresh();const timer=setInterval(refresh,60000);
  return ()=>{controller.abort();clearInterval(timer);};
 },[]);
 const day=new Date().toISOString().slice(0,10);
 const visible=campaigns.filter(c=>c.placement===placement&&campaignLive(c,day)&&(!c.category||c.category===category)).slice(0,2);
 if(!visible.length) return null;
 return <section aria-label="Publicités" className="my-5 grid gap-4 md:grid-cols-2">{visible.map(c=><AdCard key={c.id} campaign={c}/>)}</section>;
}
