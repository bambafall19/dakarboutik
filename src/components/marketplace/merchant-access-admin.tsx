'use client';
import { useState } from 'react';
import type { Shop } from '@/lib/marketplace-model';

export function MerchantAccessAdmin({ shop }: { shop: Shop }) {
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  async function prepare() {
    setBusy(true); setMessage(''); setUrl('');
    try {
      const res = await fetch('/api/admin/merchant-access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shopId: shop.id, verified }) });
      const data = await res.json();
      if (!res.ok) throw Error(data.error || 'Préparation impossible.');
      setUrl(data.url); setMessage('Lien prêt, valable 30 minutes. Aucun message envoyé.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Préparation impossible.'); }
    finally { setBusy(false); }
  }
  const whatsapp = `https://wa.me/${shop.profile.whatsapp}?text=${encodeURIComponent(`Bonjour ${shop.profile.name}, voici votre lien personnel DakarBoutik pour choisir vous-même votre mot de passe et accéder à votre boutique : ${url}\nValable 30 minutes, une seule utilisation. Connectez-vous ensuite avec le numéro +${shop.profile.whatsapp}. Ne partagez ni ce lien ni votre mot de passe.`)}`;
  return <details className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
    <summary className="cursor-pointer py-2 font-bold">Accès du commerçant par téléphone</summary>
    <p className="mt-2">Numéro destinataire enregistré : <strong>+{shop.profile.whatsapp}</strong>.</p>
    <p className="mt-2">Le lien permet au propriétaire de choisir son mot de passe puis de gérer cette boutique et ses produits. À son utilisation, la boutique sera rattachée au compte de ce numéro et ses anciennes sessions téléphone seront déconnectées. Les produits, publicités et statistiques sont conservés. Aucun mot de passe du compte e-mail d’origine n’est modifié.</p>
    <label className="mt-3 flex items-start gap-2"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={verified} onChange={event => setVerified(event.target.checked)} disabled={busy} />J’ai vérifié directement l’identité du propriétaire de cette boutique et son contrôle de ce numéro WhatsApp.</label>
    <button type="button" className="mt-3 min-h-11 rounded-xl bg-emerald-900 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={!verified || busy || shop.status === 'suspended'} onClick={prepare}>{busy ? 'Préparation…' : 'Générer un lien personnel'}</button>
    {shop.status === 'suspended' && <p>Réactivez la boutique avant de préparer son accès.</p>}
    <p className="mt-2 text-xs">Générer un autre lien invalide les précédents. L’ouverture d’un lien, y compris son aperçu WhatsApp, ne change aucun mot de passe.</p>
    {message && <p role="status" className="mt-3 font-semibold">{message}</p>}
    {url && <div className="mt-3 flex flex-wrap gap-3">
      <a className="min-h-11 rounded-xl border border-emerald-700 bg-white px-4 py-3 font-semibold text-emerald-900" href={whatsapp} target="_blank" rel="noopener noreferrer" data-engagement-audience="support">Ouvrir WhatsApp pour transmettre le lien</a>
      <button type="button" className="min-h-11 rounded-xl border bg-white px-4 py-2" onClick={async () => { try { await navigator.clipboard.writeText(url); setMessage('Lien privé copié. À transmettre uniquement au propriétaire vérifié.'); } catch { setMessage('Copie impossible. Utilisez le bouton WhatsApp.'); } }}>Copier le lien privé</button>
    </div>}
  </details>;
}
