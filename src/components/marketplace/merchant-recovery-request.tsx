'use client';
import Link from 'next/link';
import { useState,type FormEvent } from 'react';
export function MerchantRecoveryRequest() {
  const [busy,setBusy]=useState(false),[sent,setSent]=useState(false),[message,setMessage]=useState('');
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();const form=event.currentTarget,data=new FormData(form);setBusy(true);setMessage('');
    try {
      const res=await fetch('/api/merchant-access-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({shopName:data.get('shopName'),phone:data.get('phone'),reason:data.get('reason')})});
      const body=await res.json();if(!res.ok)throw Error(body.error||'Demande impossible.');
      form.reset();setSent(true);
    }catch(error){setMessage(error instanceof Error?error.message:'Demande impossible.');}finally{setBusy(false);}
  }
  const field='mt-2 min-h-12 w-full rounded-xl border bg-white p-3 text-base';
  return <section className="space-y-5 rounded-3xl border bg-emerald-50 p-5 sm:p-7">
    <h1 className="text-2xl font-bold">Retrouver l’accès à ma boutique</h1>
    {sent?<div role="status" className="space-y-3"><h2 className="text-lg font-bold">Votre demande est enregistrée</h2><p>DakarBoutik vérifiera votre identité et vous contactera sur WhatsApp. Si votre demande est déjà en attente, elle est conservée sans doublon.</p><p>Après vérification, vous recevrez un lien personnel pour choisir vous-même votre mot de passe. Aucun mot de passe n’a été modifié.</p></div>:<>
      <p>Mot de passe oublié ou boutique créée avec notre équipe ? Indiquez votre boutique et son numéro WhatsApp habituel.</p>
      <form onSubmit={submit} className="space-y-4" aria-busy={busy}><fieldset disabled={busy} className="space-y-4">
        <label className="block text-sm">Nom de la boutique<input name="shopName" className={field} autoComplete="organization" required minLength={2} maxLength={100}/></label>
        <label className="block text-sm">Téléphone WhatsApp de la boutique<input name="phone" className={field} type="tel" inputMode="tel" autoComplete="tel" placeholder="77 123 45 67" required maxLength={25} aria-describedby="recovery-phone-help"/></label>
        <p id="recovery-phone-help" className="text-xs">Sénégal : 9 chiffres. Autre pays : ajoutez l’indicatif (+…). Le numéro doit être celui enregistré pour votre boutique.</p>
        <label className="block text-sm">Votre besoin<select name="reason" className={field}><option value="forgot">J’ai oublié mon mot de passe</option><option value="first-access">Je souhaite mon premier accès</option></select></label>
        <p className="text-sm">Ces informations seront transmises à l’administration DakarBoutik pour vérifier votre demande. Ne saisissez aucun mot de passe.</p>
        <button className="min-h-12 w-full rounded-xl bg-emerald-900 p-3 font-bold text-white disabled:opacity-60">{busy?'Envoi…':'Demander mon accès'}</button>
      </fieldset>{message&&<p role="alert" className="rounded-xl bg-amber-50 p-3">{message}</p>}</form>
    </>}
    <p className="text-sm">Un lien reçu reste valable 30 minutes et une seule utilisation. Notre équipe ne vous demandera jamais votre mot de passe.</p>
    <Link href="/commercant" className="inline-flex min-h-11 items-center font-semibold text-emerald-900 underline">Retour à la connexion</Link>
  </section>;
}
