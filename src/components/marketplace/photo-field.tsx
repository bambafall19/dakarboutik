"use client";
import { useId, useState } from "react";

async function compress(file: File): Promise<Blob> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw Error("Choisissez une photo JPG, PNG ou WebP. Pour une photo HEIC, exportez-la en JPG.");
  if (file.size > 20 * 1024 * 1024) throw Error("Choisissez une photo de moins de 20 Mo.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw Error("Votre navigateur ne peut pas préparer cette photo.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(Error("Photo illisible.")), "image/webp", 0.85));
  } finally { bitmap.close(); }
}

export function PhotoField({ value = "", label, disabled = false, onBusy }: {
  value?: string; label: string; disabled?: boolean; onBusy: (busy: boolean) => void;
}) {
  const id = useId();
  const [url, setUrl] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [broken, setBroken] = useState(false);
  return <div className="space-y-3 rounded-xl border border-slate-200 p-4">
    <p className="font-medium">{label}</p>
    <label htmlFor={id} className="block text-sm font-medium">Ajouter une photo depuis votre appareil</label>
    <input id={id} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || uploading}
      className="block w-full min-w-0 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:text-emerald-900"
      onChange={async e => {
        const file = e.target.files?.[0]; e.target.value = "";
        if (!file) return;
        setUploading(true); onBusy(true); setMessage("");
        try {
          const photo = await compress(file);
          if (photo.size > 3 * 1024 * 1024) throw Error("Cette photo reste trop lourde. Choisissez une image plus petite.");
          const data = new FormData(); data.set("photo", photo, photo.type === "image/webp" ? "photo.webp" : "photo.png");
          const response = await fetch("/api/marketplace/photos", { method: "POST", body: data });
          const result = await response.json();
          if (!response.ok) throw Error(result.error || "Chargement impossible.");
          setUrl(result.url); setBroken(false); setMessage("Photo chargée. Enregistrez le formulaire pour l’associer à votre boutique ou produit.");
        } catch (error) { setMessage(error instanceof Error ? error.message : "Chargement impossible."); }
        finally { setUploading(false); onBusy(false); }
      }} />
    <p className="text-xs text-slate-600">JPG, PNG ou WebP, jusqu’à 20 Mo. La photo est compressée avant l’envoi. Les photos chargées sont publiques.</p>
    <label className="block text-sm">Ou coller un lien HTTPS direct vers l’image
      <input name="image" type="url" maxLength={2000} value={url} readOnly={disabled || uploading}
        placeholder="https://…/photo.jpg" className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900"
        onChange={e => { setUrl(e.target.value); setBroken(false); setMessage(""); }} />
    </label>
    <p className="text-xs text-slate-600">Un lien de partage Google Photos n’est généralement pas une image directe. Téléchargez la photo, puis ajoutez-la ici.</p>
    {url.startsWith("https://") && !broken && <img src={url} alt={`Aperçu : ${label}`} className="h-36 w-full rounded-lg bg-slate-50 object-contain" referrerPolicy="no-referrer" onError={() => setBroken(true)} />}
    {broken && <p className="text-sm text-amber-800">Aperçu indisponible. Vérifiez que le lien ouvre directement une image publique.</p>}
    {url && <button type="button" disabled={disabled || uploading} className="text-sm underline" onClick={() => { setUrl(""); setBroken(false); setMessage(""); }}>Retirer du formulaire</button>}
    <p role="status" aria-live="polite" className="text-sm text-slate-700">{uploading ? "Préparation et chargement de la photo…" : message}</p>
  </div>;
}
