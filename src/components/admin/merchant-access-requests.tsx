'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useApiData } from '@/hooks/use-api-data';
type AccessRequest={id:string;shop_name:string;phone:string;reason:string;created_at:string;email_status:string;shop_id:string|null;registered_name:string|null};
export type AccessRequestsData={requests:AccessRequest[];pendingCount:number;emailConfigured:boolean};
const mailLabels:Record<string,string>={queued:'E-mail en attente',sending:'Envoi en cours',sent:'E-mail accepté par le service d’envoi',failed:'Échec de l’e-mail',unconfigured:'E-mail à configurer'};
export function MerchantAccessRequests(){
  const {data,error,refetch}=useApiData<AccessRequestsData>('/api/admin/merchant-access-requests');
  const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
  async function act(id:string,action:'retry'|'resolve'){
    setBusy(true);setMessage('');try{
      const res=await fetch('/api/admin/merchant-access-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,action})});
      const body=await res.json();if(!res.ok)throw Error(body.error||'Action impossible.');
      setMessage(action==='resolve'?'Demande classée comme traitée. Aucun accès modifié.':'Relance de l’e-mail demandée.');await refetch();
    }catch(e){setMessage(e instanceof Error?e.message:'Action impossible.');}finally{setBusy(false);}
  }
  return <section id="demandes-acces" aria-labelledby="access-requests-title" className="scroll-mt-24 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
    <h2 id="access-requests-title" className="text-lg font-bold">Demandes d’accès commerçants · {data?.pendingCount??'…'}</h2>
    <p className="mt-2 text-sm">Mot de passe oublié ou premier accès : vérifiez le propriétaire et le numéro enregistré, puis préparez le lien depuis sa fiche boutique. Une demande ne prouve pas l’identité de son auteur.</p>
    {error?<button type="button" onClick={()=>void refetch()} className="min-h-11 underline">Demandes indisponibles · Réessayer</button>:!data?<p>Chargement…</p>:<>
      {!data.emailConfigured&&<p className="mt-3 rounded-xl border bg-white p-3 text-sm">L’e-mail n’est pas configuré. Les demandes restent visibles ici. Configurez le destinataire d’alertes et le service d’envoi.</p>}
      {!data.requests.length&&<p className="mt-3 text-sm">Aucune demande en attente.</p>}
      <div className="mt-3 grid gap-3 md:grid-cols-2">{data.requests.map(r=><article key={r.id} className="min-w-0 space-y-2 rounded-xl border bg-white p-4 text-sm">
        <h3 className="break-words font-bold">{r.shop_name}</h3><p>Numéro déclaré : <span className="break-all">{r.phone}</span></p>
        <p>{r.reason==='forgot'?'Mot de passe oublié':'Premier accès'} · {new Date(r.created_at).toLocaleString('fr-FR',{timeZone:'Africa/Dakar'})} (Dakar)</p>
        <p>{mailLabels[r.email_status]||r.email_status}</p>
        {r.shop_id?<Link href={`/admin/boutiques?shop=${r.shop_id}#acces-commercant`} className="inline-flex min-h-11 items-center font-semibold text-emerald-900 underline">Vérifier la boutique enregistrée : {r.registered_name} →</Link>:<p>Aucune boutique retrouvée avec ce numéro. Vérifiez directement avec le commerçant ; aucun rattachement automatique.</p>}
        <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>void act(r.id,'resolve')} className="min-h-11 rounded-lg border px-3 font-semibold disabled:opacity-50">Marquer comme traitée</button>
          {r.email_status!=='sent'&&<button type="button" disabled={busy} onClick={()=>void act(r.id,'retry')} className="min-h-11 rounded-lg border px-3 disabled:opacity-50">Réessayer l’e-mail</button>}</div>
      </article>)}</div>
      {data.pendingCount>data.requests.length&&<p className="mt-3 text-sm">Les 50 demandes les plus récentes sont affichées. Traitez-les pour afficher les suivantes.</p>}
    </>}{message&&<p role="status" className="mt-3 text-sm">{message}</p>}
  </section>;
}
