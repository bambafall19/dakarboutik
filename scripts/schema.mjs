import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const url =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL ||
  (env.match(/^DATABASE_URL_UNPOOLED="?([^"\n]+)"?/m)?.[1]) ||
  (env.match(/^DATABASE_URL="?([^"\n]+)"?/m)?.[1]);

if (!url) {
  console.error('DATABASE_URL not found in env or .env.local');
  process.exit(1);
}

const sql = neon(url);

const statements = [
  `create extension if not exists pgcrypto`,

  `create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    password_hash text not null,
    is_admin boolean not null default false,
    created_at timestamptz not null default now()
  )`,

  `create table if not exists categories (
    id text primary key,
    name text not null,
    slug text not null,
    parent_id text,
    "order" integer not null default 0,
    banner_image_url text
  )`,

  `create table if not exists products (
    id text primary key,
    title text not null,
    slug text not null,
    images jsonb not null default '[]'::jsonb,
    price numeric not null default 0,
    sale_price numeric,
    currency text not null default 'FCA',
    brand text,
    category text,
    specs json not null default '{}'::json,
    stock integer not null default 0,
    variants jsonb not null default '[]'::jsonb,
    status text not null default 'active',
    created_at timestamptz not null default now(),
    is_bestseller boolean not null default false,
    is_new boolean not null default false,
    description text not null default '',
    meta_title text,
    meta_description text
  )`,
  `create index if not exists products_slug_idx on products (slug)`,
  `create index if not exists products_status_idx on products (status)`,

  `create table if not exists reviews (
    id text primary key,
    product_id text not null,
    rating integer not null default 5,
    title text not null default '',
    text text not null default '',
    author text not null default '',
    created_at timestamptz not null default now(),
    is_published boolean not null default true
  )`,
  `alter table reviews add column if not exists is_published boolean not null default true`,
  `create index if not exists reviews_product_idx on reviews (product_id)`,

  `create table if not exists banners (
    id text primary key,
    title text,
    subtitle text,
    images jsonb not null default '[]'::jsonb,
    link_url text,
    position text not null default 'hero',
    is_active boolean not null default true,
    "order" integer not null default 0
  )`,

  `create table if not exists faq (
    id text primary key,
    question text not null,
    answer text not null,
    "order" integer not null default 0
  )`,

  `create table if not exists settings (
    id text primary key,
    data jsonb not null default '{}'::jsonb
  )`,

  `create table if not exists orders (
    id text primary key,
    order_id text not null,
    customer_info jsonb not null default '{}'::jsonb,
    items jsonb not null default '[]'::jsonb,
    total_price numeric not null default 0,
    shipping_cost numeric not null default 0,
    grand_total numeric not null default 0,
    status text not null default 'pending',
    created_at timestamptz not null default now(),
    delivery_method text,
    payment_method text,
    admin_notes text,
    public_notes jsonb not null default '[]'::jsonb
  )`,

  `create table if not exists public_orders (
    id text primary key,
    order_id text not null,
    status text not null default 'pending',
    created_at timestamptz not null default now(),
    status_history jsonb not null default '[]'::jsonb,
    public_notes jsonb not null default '[]'::jsonb
  )`,

  `create table if not exists media (
    id text primary key,
    name text not null default '',
    url text not null,
    kind text not null default 'image',
    created_at timestamptz not null default now(),
    data bytea,
    content_type text,
    size integer,
    original_name text
  )`,
  `create unique index if not exists media_url_idx on media (url)`,
  `alter table media add column if not exists data bytea`,
  `alter table media add column if not exists content_type text`,
  `alter table media add column if not exists size integer`,
  `alter table media add column if not exists original_name text`,

  `create table if not exists contact_messages (
    id text primary key,
    name text not null default '',
    email text not null default '',
    subject text not null default '',
    message text not null default '',
    is_read boolean not null default false,
    created_at timestamptz not null default now()
  )`,

  // ── Marketplace: Boutiques Virtuelles (Vendors) ───────────────────────────
  `create table if not exists vendors (
    id          text primary key,
    slug        text not null unique,
    name        text not null,
    description text,
    logo_url    text,
    banner_url  text,
    owner_id    uuid,
    city        text not null default 'Dakar',
    rating      numeric(3,2) not null default 0,
    review_count integer not null default 0,
    is_verified boolean not null default false,
    is_active   boolean not null default true,
    created_at  timestamptz not null default now()
  )`,
  `create unique index if not exists vendors_slug_idx on vendors (slug)`,

  // Link products to vendors
  `alter table products add column if not exists vendor_id text references vendors(id)`,
  `alter table products add column if not exists wholesale_tiers jsonb not null default '[]'::jsonb`,

  // Verified purchase reviews
  `alter table reviews add column if not exists order_id text`,
  `alter table reviews add column if not exists is_verified_purchase boolean not null default false`,

  // ── Marketplace: Points Relais ────────────────────────────────────────────
  `create table if not exists relay_points (
    id        text primary key,
    name      text not null,
    address   text not null,
    zone      text not null,
    lat       numeric(10,7),
    lng       numeric(10,7),
    is_active boolean not null default true
  )`,

  // ── Marketplace: Programme de Fidélité ───────────────────────────────────
  `create table if not exists loyalty_points (
    id         text primary key,
    user_id    uuid,
    points     integer not null default 0,
    reason     text not null default '',
    order_id   text,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists loyalty_user_idx on loyalty_points (user_id)`,

  // Extend orders with zone_id for granular delivery
  `alter table orders add column if not exists zone_id text`,
  `alter table orders add column if not exists vendor_id text`,
  `alter table public_orders add column if not exists zone_id text`,
];

for (const stmt of statements) {
  await sql.query(stmt);
  console.log('ok:', stmt.split('\n')[0].trim().slice(0, 70));
}

console.log('\nSchema applied.');
