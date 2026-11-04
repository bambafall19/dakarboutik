 'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductImageInput } from '@/components/admin/product-image-input';
import { campaignSchema, campaignLive, placements, adCategories, type Campaign } from '@/lib/advertising';
const empty = {title:'',imageUrl:'',targetUrl:'/products',placement:'home' as const,category:'' as const,startsOn:'',endsOn:'',active:false};
export default function PublicitesPage() {
 const [campaigns,setCampaigns]=useState<Campaign[]>([]);
 const [form,setForm]=useState<Partial<Campaign>>(empty);
 const [busy,setBusy]=useState(false);
 const [uploading,setUploading]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const refresh=useCallback(async()=>{
  try{const r=await fetch('/api/advertising?admin=1');const data=await r.json();if(!r.ok)throw new Error(data.error);setCampaigns(data);}catch(e){setError(e instanceof Error?e.message:'Chargement impossible.');}
 },[]);
 useEffect(()=>{void refresh();},[refresh]);
 const field=(key:keyof Campaign,value:string|boolean)=>setForm(old=>({...old,[key]:value}));
 async function save(event:React.FormEvent) {
  event.preventDefault();setError('');setMessage('');
  const parsed=campaignSchema.safeParse(form);
  if(!parsed.success){setError(parsed.error.issues[0].message);return;}
  setBusy(true);
  try{
   const r=await fetch('/api/advertising',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(parsed.data)});
   const data=await r.json();if(!r.ok)throw new Error(data.error||'Enregistrement impossible.');
   setForm(empty);setMessage('Publicité enregistrée. Sa diffusion dépend de son activation et des dates choisies.');await refresh();
  }catch(e){setError(e instanceof Error?e.message:'Enregistrement impossible.');}finally{setBusy(false);}
 }
 const input='mt-2 w-full rounded-xl border bg-background px-3 py-3';
 return <div className="mx-auto max-w-6xl space-y-6 py-6">
  <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Espaces publicitaires</h1><p className="mt-2 text-muted-foreground">Créez une campagne, choisissez sa page et programmez sa diffusion.</p></div><Link href="/admin/statistiques" className="rounded-xl border px-4 py-3 font-semibold">Voir les résultats →</Link></div>
  <p className="rounded-xl bg-amber-50 p-4 text-sm text-slate-800">Deux publicités au maximum par emplacement : les plus récentes parmi celles actives et dans leur période. Les dates incluent le dernier jour, à l’heure de Dakar. Toutes les annonces portent la mention « Sponsorisé ».</p>
  {message&&<p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-900">{message}</p>}
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
  <form onSubmit={save} className="space-y-5 rounded-2xl border bg-card p-5 sm:p-7">
   <h2 className="text-xl font-bold">{form.id?'Modifier la publicité':'Nouvelle publicité'}</h2>
   <fieldset disabled={busy||uploading} className="grid gap-5 sm:grid-cols-2">
    <label>Titre<input required maxLength={120} className={input} value={form.title||''} onChange={e=>field('title',e.target.value)} /></label>
    <label>Lien de destination<input required className={input} placeholder="/products/batterie-lithium-50-kwh" value={form.targetUrl||''} onChange={e=>field('targetUrl',e.target.value)} /></label>
    <label>Emplacement<select className={input} value={form.placement} onChange={e=>field('placement',e.target.value)}>{Object.entries(placements).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
    {form.placement==='catalog'&&<label>Catégorie ciblée<select className={input} value={form.category} onChange={e=>field('category',e.target.value)}>{Object.entries(adCategories).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>}
    <label>Premier jour (facultatif)<input type="date" className={input} value={form.startsOn||''} onChange={e=>field('startsOn',e.target.value)} /></label>
    <label>Dernier jour (facultatif)<input type="date" className={input} min={form.startsOn||undefined} value={form.endsOn||''} onChange={e=>field('endsOn',e.target.value)} /></label>
   </fieldset>
   <ProductImageInput value={form.imageUrl||''} onChange={url=>field('imageUrl',url)} onBusyChange={setUploading}/>
   <label className="flex items-center gap-3"><input type="checkbox" checked={!!form.active} disabled={busy||uploading} onChange={e=>field('active',e.target.checked)} />Activer la diffusion aux dates prévues</label>
   <div className="flex flex-wrap gap-3"><button disabled={busy||uploading} className="rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy?'Enregistrement…':'Enregistrer la publicité'}</button>{form.id&&<button type="button" disabled={busy||uploading} className="rounded-xl border px-5 py-3" onClick={()=>setForm(empty)}>Annuler la modification</button>}</div>
  </form>
  <section aria-labelledby="campaign-list"><h2 id="campaign-list" className="mb-4 text-xl font-bold">Vos campagnes ({campaigns.length})</h2><div className="grid gap-4 sm:grid-cols-2">{campaigns.map(c=><article key={c.id} className="rounded-2xl border bg-card p-5"><div className="flex gap-4"><img src={c.imageUrl} alt="" className="h-20 w-20 rounded-lg object-contain"/><div><h3 className="font-bold">{c.title}</h3><p className="text-sm text-muted-foreground">{placements[c.placement]}{c.category?' · '+adCategories[c.category]:''}</p><p className="mt-2 text-sm">{!c.active?'Désactivée / brouillon':campaignLive(c,new Date().toISOString().slice(0,10))?'Dans sa période de diffusion':c.startsOn>new Date().toISOString().slice(0,10)?'Programmée':'Terminée'}</p></div></div><p className="my-3 text-sm">{c.startsOn||'Sans date de début'} → {c.endsOn||'Sans date de fin'}</p><button disabled={busy||uploading} className="rounded-xl border px-4 py-2 font-semibold" onClick={()=>{setForm(c);setError('');setMessage('');window.scrollTo({top:0,behavior:'smooth'});}}>Modifier / désactiver</button></article>)}</div>{!campaigns.length&&!error&&<p className="rounded-xl border border-dashed p-6">Aucune campagne pour le moment. Préparez votre première publicité avec le formulaire ci-dessus.</p>}</section>
 </div>;
}
