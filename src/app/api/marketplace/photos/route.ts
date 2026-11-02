import { NextRequest, NextResponse } from "next/server";
import { list, put } from "@vercel/blob";
import sharp from "sharp";
import { getSession } from "@/lib/auth";
import { queryOne } from "@/lib/db";

export const runtime = "nodejs";
const MAX_BYTES = 3 * 1024 * 1024;
const error = (message: string, status: number) => NextResponse.json({ error: message }, { status });

export async function POST(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin) return error("Origine refusée.", 403);
  try {
    const session = await getSession();
    if (!session) return error("Connectez-vous pour ajouter une photo.", 401);
    const shop = await queryOne<{ id: string; status: string }>(
      "select id, status from marketplace_shops where owner_id = $1", [session.uid],
    );
    if (!shop) return error("Enregistrez d’abord votre boutique, puis ajoutez sa photo.", 403);
    if (shop.status === "suspended") return error("Cette boutique est suspendue.", 403);
    if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN)
      return error("Le chargement des photos n’est pas encore activé. Vous pouvez utiliser un lien HTTPS.", 503);
    if (Number(req.headers.get("content-length")) > MAX_BYTES + 65536) return error("Photo trop volumineuse (3 Mo maximum).", 413);
    // Bound the body even when content-length is absent or inaccurate.
    const reader = req.body?.getReader();
    if (!reader) return error("Photo manquante.", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES + 65536) { await reader.cancel(); return error("Photo trop volumineuse (3 Mo maximum).", 413); }
      chunks.push(value);
    }
    let file: FormDataEntryValue | null;
    try {
      const form = await new Response(Buffer.concat(chunks), { headers: { "content-type": req.headers.get("content-type") || "" } }).formData();
      file = form.get("photo");
    } catch { return error("Envoi de photo invalide.", 400); }
    if (!(file instanceof File) || !file.size) return error("Sélectionnez une photo.", 400);
    if (file.size > MAX_BYTES) return error("Photo trop volumineuse (3 Mo maximum).", 413);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return error("Utilisez une photo JPG, PNG ou WebP.", 400);
    let photo: Buffer;
    try {
      const input = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40_000_000 });
      const metadata = await input.metadata();
      if (!["jpeg", "png", "webp"].includes(metadata.format || "") || (metadata.pages || 1) > 1) return error("Utilisez une image fixe JPG, PNG ou WebP.", 400);
      // Decode/re-encode: remove GPS/EXIF and reject disguised non-image content.
      photo = await input.rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    } catch { return error("Cette photo est illisible. Essayez une autre image JPG ou PNG.", 400); }
    const prefix = `marketplace/${shop.id}/`;
    const existing = await list({ prefix, limit: 100 });
    if (existing.blobs.length >= 100 || existing.hasMore) return error("La limite de 100 photos est atteinte. Contactez DakarBoutik.", 409);
    const blob = await put(`${prefix}${crypto.randomUUID()}.webp`, photo, {
      access: "public", contentType: "image/webp", addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (e) {
    console.error("Marketplace photo upload failed", e instanceof Error ? e.name : "UnknownError");
    return error("Le chargement a échoué. Réessayez ou utilisez un lien HTTPS.", 500);
  }
}
