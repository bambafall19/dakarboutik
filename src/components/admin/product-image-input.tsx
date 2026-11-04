'use client';

import { useId, useState } from 'react';
import { Input } from '@/components/ui/input';

export function ProductImageInput({ value, onChange, onBusyChange }: {
  value: string;
  onChange: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [failedUrl, setFailedUrl] = useState('');
  const valid = /^https?:\/\//i.test(value) || /^\/api\/media\/file\/[a-zA-Z0-9_-]+$/.test(value);

  async function upload(file?: File) {
    if (!file) return;
    setError('');
    if (file.size > 4 * 1024 * 1024) {
      setError('Cette photo dépasse 4 Mo. Choisissez une version plus légère.');
      return;
    }
    setBusy(true);
    onBusyChange(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/media/upload', { method: 'POST', body });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.url) throw new Error(result?.error || (response.status === 413 ? 'Photo trop volumineuse (4 Mo maximum).' : 'Le chargement a échoué. Réessayez ou reconnectez-vous.'));
      onChange(result.url);
      setFailedUrl('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de charger la photo.');
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }

  return <div className="min-w-0 space-y-3">
    <label htmlFor={`${id}-file`} className="block text-sm font-medium">Charger une photo depuis votre appareil</label>
    <Input id={`${id}-file`} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" disabled={busy}
      onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; void upload(file); }} />
    <p className="text-xs text-muted-foreground">JPG, PNG, WebP, AVIF ou GIF · 4 Mo maximum. Enregistrez ensuite le produit.</p>
    <label htmlFor={`${id}-url`} className="block text-sm font-medium">Ou coller le lien direct de la photo</label>
    <Input id={`${id}-url`} value={value} disabled={busy} placeholder="https://..." onChange={event => onChange(event.target.value.trim())} />
    {busy && <p role="status">Chargement de la photo…</p>}
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {valid && failedUrl !== value && <img src={value} alt="Aperçu de la photo du produit" className="h-36 w-full rounded-lg border bg-white object-contain" onError={() => setFailedUrl(value)} />}
    {value && (!valid || failedUrl === value) && <p className="text-sm text-amber-700">Aperçu indisponible. Chargez la photo depuis votre appareil ou utilisez un lien direct accessible.</p>}
  </div>;
}
