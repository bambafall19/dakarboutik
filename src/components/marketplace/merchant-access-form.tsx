'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';

export function MerchantAccessForm() {
  const [token, setToken] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState('');
  const read = useRef(false);
  useEffect(() => {
    if (read.current) return;
    read.current = true;
    const value = window.location.hash.slice(1);
    setToken(/^[a-f0-9]{64}$/.test(value) ? value : '');
    window.history.replaceState(null, '', window.location.pathname);
    setReady(true);
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get('password') || '');
    if (password !== data.get('confirmation')) { setMessage('Les deux mots de passe ne correspondent pas.'); return; }
    if (new TextEncoder().encode(password).length > 72) { setMessage('Mot de passe trop long : 72 octets maximum.'); return; }
    setBusy(true); setMessage('');
    try {
      const res = await fetch('/api/merchant-access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const body = await res.json();
      if (!res.ok) throw Error(body.error || 'Enregistrement impossible.');
      form.reset(); setToken(''); setDone(true);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Enregistrement impossible.'); }
    finally { setBusy(false); }
  }
  if (done) return <section role="status" className="space-y-4"><h1 className="text-2xl font-bold">Votre accès est prêt</h1><p>Votre mot de passe est enregistré. Connectez-vous avec votre numéro de téléphone pour gérer votre boutique et ajouter vos produits.</p><Link href="/commercant" className="inline-block rounded-xl bg-emerald-900 px-5 py-3 font-bold text-white">Me connecter à ma boutique</Link></section>;
  return <section className="space-y-4">
    <h1 className="text-2xl font-bold">Choisir mon mot de passe</h1>
    <p>Accès personnel à votre boutique DakarBoutik. Choisissez votre mot de passe vous-même ; ne le communiquez à personne.</p>
    {!ready ? <p>Chargement du lien personnel…</p> : !token ? <p role="alert">Le lien personnel est absent ou incomplet. Ouvrez le lien complet reçu sur WhatsApp ou demandez-en un nouveau à DakarBoutik.</p> : <form onSubmit={submit} className="space-y-4">
      <label className="block">Nouveau mot de passe<input className="mt-2 block w-full rounded-xl border p-3 text-base" type="password" name="password" autoComplete="new-password" minLength={10} maxLength={72} required disabled={busy} aria-describedby="password-rules" /></label>
      <p id="password-rules" className="text-sm text-slate-600">10 caractères minimum. Choisissez un mot de passe unique ; 72 octets maximum.</p>
      <label className="block">Confirmer le mot de passe<input className="mt-2 block w-full rounded-xl border p-3 text-base" type="password" name="confirmation" autoComplete="new-password" minLength={10} maxLength={72} required disabled={busy} /></label>
      <button className="min-h-12 rounded-xl bg-emerald-900 px-5 py-3 font-bold text-white disabled:opacity-50" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer mon mot de passe'}</button>
      {message && <p role="alert">{message}</p>}
    </form>}
    <p className="text-sm text-slate-600">Ce lien expire après 30 minutes et ne sert qu’une fois. Si vous actualisez cette page, rouvrez le lien du message WhatsApp.</p>
  </section>;
}
