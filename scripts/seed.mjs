import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const placeholders = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'src/lib/placeholder-images.json'), 'utf8')
).placeholderImages;

function imgById(id) {
  const p = placeholders.find((x) => x.id === id) || placeholders[0];
  return [{ id: p.id, description: p.description, imageUrl: p.imageUrl, imageHint: p.imageHint }];
}

const envPath = path.resolve(process.cwd(), '.env.local');
const env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const url =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL ||
  env.match(/^DATABASE_URL_UNPOOLED="?([^"\n]+)"?/m)?.[1] ||
  env.match(/^DATABASE_URL="?([^"\n]+)"?/m)?.[1];

if (!url) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}
const sql = neon(url);

const categories = [
  { id: 'cat-electronique', name: 'Électronique', slug: 'electronique', order: 1 },
  { id: 'cat-informatique', name: 'Informatique', slug: 'informatique', order: 2 },
  { id: 'cat-telephones', name: 'Téléphones & Tablettes', slug: 'telephones-and-tablettes', order: 3 },
  { id: 'cat-audio', name: 'Audio', slug: 'audio', order: 4 },
  { id: 'cat-accessoires', name: 'Accessoires', slug: 'accessoires', order: 5 },
  { id: 'cat-maison', name: 'Maison & Cuisine', slug: 'maison-and-cuisine', order: 6 },
  { id: 'cat-mode', name: 'Mode', slug: 'mode', order: 7 },
  { id: 'cat-sante', name: 'Santé & Beauté', slug: 'sante-and-beaute', order: 8 },
];

const products = [
  {
    id: 'prod-routeur-tenda',
    imageId: 'product-laptop-1a',
    title: 'Routeur WiFi intelligent Tenda WiFi 6 AX3000',
    slug: 'routeur-wifi-intelligent-tenda-wifi-6-ax3000',
    price: 45000,
    salePrice: 39900,
    brand: 'Tenda',
    category: 'cat-informatique',
    stock: 12,
    isBestseller: true,
    isNew: true,
    description: 'Routeur WiFi 6 AX3000 double bande, idéal pour la maison et le bureau.',
  },
  {
    id: 'prod-ecouteurs-bt',
    imageId: 'product-earbuds-1a',
    title: 'Écouteurs Bluetooth sans fil Pro',
    slug: 'ecouteurs-bluetooth-sans-fil-pro',
    price: 18500,
    salePrice: null,
    brand: 'SoundCore',
    category: 'cat-audio',
    stock: 40,
    isBestseller: true,
    isNew: false,
    description: 'Écouteurs intra-auriculaires avec réduction de bruit active.',
  },
  {
    id: 'prod-smartphone-x',
    imageId: 'product-phone-1a',
    title: 'Smartphone X 128Go 6.7"',
    slug: 'smartphone-x-128go',
    price: 165000,
    salePrice: 149000,
    brand: 'Generic',
    category: 'cat-telephones',
    stock: 8,
    isBestseller: true,
    isNew: true,
    description: 'Smartphone 4G/5G, 128 Go de stockage, écran AMOLED 6.7".',
  },
  {
    id: 'prod-pc-portable',
    imageId: 'product-laptop-1b',
    title: 'PC Portable 15.6" Core i5 8Go/512Go',
    slug: 'pc-portable-156-core-i5',
    price: 425000,
    salePrice: null,
    brand: 'HP',
    category: 'cat-informatique',
    stock: 5,
    isBestseller: false,
    isNew: true,
    description: 'Ordinateur portable fiable pour le travail et les études.',
  },
  {
    id: 'prod-casque-audio',
    imageId: 'product-headphones-1a',
    title: 'Casque Audio Haute-Fidélité',
    slug: 'casque-audio-haute-fidelite',
    price: 32000,
    salePrice: 27900,
    brand: 'Sony',
    category: 'cat-audio',
    stock: 20,
    isBestseller: false,
    isNew: false,
    description: 'Casque circum-auriculaire avec un son immersif.',
  },
  {
    id: 'prod-chargeur-rapide',
    imageId: 'product-charger-1a',
    title: 'Chargeur rapide USB-C 65W',
    slug: 'chargeur-rapide-usb-c-65w',
    price: 12500,
    salePrice: null,
    brand: 'Anker',
    category: 'cat-accessoires',
    stock: 60,
    isBestseller: false,
    isNew: true,
    description: 'Chargeur universel GaN 65W, compatible téléphones et ordinateurs.',
  },
];

const banners = [
  {
    id: 'banner1',
    imageId: 'banner1',
    title: 'Sénégal CHAMPION 2025',
    subtitle: 'Les dernières nouveautés smartphones, ordinateurs et accessoires au meilleur prix.',
    images: [],
    linkUrl: '/products',
    position: 'hero',
    isActive: true,
    order: 1,
  },
  {
    id: 'ad-banner-1',
    imageId: 'banner-laptops',
    title: 'PC Portables Puissants',
    subtitle: '',
    images: [],
    linkUrl: '/products?category=informatique',
    position: 'ad',
    isActive: true,
    order: 1,
  },
];

const faq = [
  { id: 'faq-1', question: 'Comment puis-je trouver un produit ?', answer: 'Vous pouvez utiliser la barre de recherche en haut de la page ou parcourir nos catégories.', order: 1 },
  { id: 'faq-2', question: 'Quels sont les modes de paiement acceptés ?', answer: 'Nous acceptons le paiement à la livraison, Orange Money, Wave et carte bancaire.', order: 2 },
  { id: 'faq-3', question: 'Livrez-vous partout au Sénégal ?', answer: 'Oui, nous livrons à Dakar et dans toutes les régions du Sénégal.', order: 3 },
  { id: 'faq-4', question: 'Quel est le délai de livraison ?', answer: 'La livraison prend généralement 24 à 72 heures selon votre localisation.', order: 4 },
  { id: 'faq-5', question: 'Puis-je retourner un article ?', answer: 'Oui, vous disposez de 7 jours pour retourner un article non utilisé.', order: 5 },
  { id: 'faq-6', question: 'Comment suivre ma commande ?', answer: 'Utilisez la page de suivi avec le numéro de commande reçu par email.', order: 6 },
  { id: 'faq-7', question: 'Comment vous contacter ?', answer: 'Via le formulaire de contact ou par téléphone/WhatsApp aux horaires de bureau.', order: 7 },
];

const settings = {
  siteName: 'DakarBoutik',
  siteDescription: 'Votre boutique en ligne au Sénégal',
  phone: '+221 00 000 00 00',
  email: 'contact@dakarboutik.com',
  address: 'Dakar, Sénégal',
};

for (const c of categories) {
  await sql.query(
    'insert into categories (id,name,slug,parent_id,"order",banner_image_url) values ($1,$2,$3,$4,$5,$6) on conflict (id) do nothing',
    [c.id, c.name, c.slug, c.parentId ?? null, c.order, c.bannerImageUrl ?? null]
  );
}
console.log(`categories: ${categories.length}`);

for (const p of products) {
  await sql.query(
    `insert into products (id,title,slug,images,price,sale_price,currency,brand,category,specs,stock,variants,status,created_at,is_bestseller,is_new,description,meta_title,meta_description)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
     on conflict (id) do nothing`,
    [p.id, p.title, p.slug, JSON.stringify(imgById(p.imageId)), p.price, p.salePrice, 'FCA', p.brand, p.category, '{}', p.stock, '[]', 'active',
     new Date().toISOString(), p.isBestseller, p.isNew, p.description, null, null]
  );
}
console.log(`products: ${products.length}`);

for (const b of banners) {
  await sql.query(
    'insert into banners (id,title,subtitle,images,link_url,position,is_active,"order") values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict (id) do nothing',
    [b.id, b.title, b.subtitle, JSON.stringify(imgById(b.imageId)), b.linkUrl, b.position, b.isActive, b.order]
  );
}
console.log(`banners: ${banners.length}`);

for (const f of faq) {
  await sql.query(
    'insert into faq (id,question,answer,"order") values ($1,$2,$3,$4) on conflict (id) do nothing',
    [f.id, f.question, f.answer, f.order]
  );
}
console.log(`faq: ${faq.length}`);

await sql.query(
  `insert into settings (id,data) values ('siteConfig', $1) on conflict (id) do update set data = settings.data || $1`,
  [JSON.stringify(settings)]
);
console.log('settings: 1');

const adminEmail = 'owner@dakarboutik.com';
const adminPassword = 'owner123';
const hash = await bcrypt.hash(adminPassword, 10);
await sql.query(
  `insert into users (email,password_hash,is_admin) values ($1,$2,true)
   on conflict (email) do update set password_hash = excluded.password_hash, is_admin = true`,
  [adminEmail, hash]
);
console.log(`admin: ${adminEmail}`);

console.log('\nSeed complete.');
