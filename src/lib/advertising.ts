import { z } from 'zod';

export const placements = { home: 'Accueil', catalog: 'Catalogue et catégories', shops: 'Boutiques partenaires' } as const;
export const adCategories = { '': 'Toutes les catégories', solaire: 'Solaire & énergie', telephones: 'Téléphones', 'tech-complete': 'Informatique & électronique', 'maison-complete': 'Maison', 'autres-produits': 'Autres produits' } as const;
export function safeAdUrl(value: string) {
  if (value.startsWith('/') && !value.startsWith('//') && !/[\\\s]/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}
const date = z.string().refine(v => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v), 'Date invalide.');
export const campaignSchema = z.object({
  id: z.string().uuid().optional(), title: z.string().trim().min(2).max(120),
  imageUrl: z.string().trim().max(2048).refine(safeAdUrl, 'Photo : utilisez HTTPS ou un fichier chargé.'),
  targetUrl: z.string().trim().max(2048).refine(safeAdUrl, 'Lien : utilisez HTTPS ou une page du site.'),
  placement: z.enum(['home','catalog','shops']),
  category: z.enum(['','solaire','telephones','tech-complete','maison-complete','autres-produits']).default(''),
  startsOn: date.default(''), endsOn: date.default(''), active: z.boolean().default(false),
}).refine(v => !v.startsOn || !v.endsOn || v.endsOn >= v.startsOn, 'La fin doit être après le début.');
export type Campaign = z.infer<typeof campaignSchema> & { id: string };
export function campaignLive(c: Campaign, day: string) { return c.active && (!c.startsOn || c.startsOn <= day) && (!c.endsOn || c.endsOn >= day); }
export function toCampaign(r: Record<string, any>): Campaign {
  const day = (v: any) => v instanceof Date ? v.toISOString().slice(0,10) : String(v || '').slice(0,10);
  return { id:r.id, title:r.title, imageUrl:r.image_url, targetUrl:r.target_url, placement:r.placement, category:r.category || '', startsOn:day(r.starts_on), endsOn:day(r.ends_on), active:r.active };
}
export const eventSchema = z.object({ id:z.string().uuid(), kind:z.enum(['ad_view','ad_click','whatsapp_click','shop_view','checkout_open']), campaignId:z.string().uuid().optional(), placement:z.enum(['home','catalog','shops','other']) }).strict()
.refine(e => e.kind.startsWith('ad_') ? !!e.campaignId && e.placement !== 'other' : !e.campaignId, 'Événement invalide.');
