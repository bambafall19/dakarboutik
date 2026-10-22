import 'server-only';
import { query } from './db';
import type { Banner, Category, Product, Vendor } from './types';
import { getBanners as getStaticBanners } from './data';

function toProduct(r: any): Product {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    images: r.images ?? [],
    price: Number(r.price),
    salePrice: r.sale_price != null ? Number(r.sale_price) : undefined,
    currency: 'FCA',
    brand: r.brand ?? undefined,
    category: r.category ?? '',
    specs: r.specs ?? {},
    stock: Number(r.stock),
    variants: r.variants ?? [],
    status: r.status,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    isBestseller: !!r.is_bestseller,
    isNew: !!r.is_new,
    description: r.description ?? '',
    metaTitle: r.meta_title ?? undefined,
    metaDescription: r.meta_description ?? undefined,
  };
}

function toVendor(r: any): Vendor {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description ?? undefined,
    logoUrl: r.logo_url ?? undefined,
    bannerUrl: r.banner_url ?? undefined,
    city: r.city ?? undefined,
    rating: r.rating != null ? Number(r.rating) : undefined,
    reviewCount: Number(r.review_count ?? 0),
    isVerified: !!r.is_verified,
    isActive: r.is_active !== false,
    createdAt:
      r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at ?? ''),
    productCount: r.product_count != null ? Number(r.product_count) : undefined,
  };
}

export async function getProducts(): Promise<Product[]> {
  const rows = await query("select * from products where status = 'active' order by created_at desc");
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await query("select * from products where slug = $1 and status = 'active' limit 1", [slug]);
  return rows[0] ? toProduct(rows[0]) : null;
}

export async function getVendors(): Promise<Vendor[]> {
  try {
    const rows = await query(
      `select v.*,
         (select count(*) from products p where p.vendor_id = v.id and p.status = 'active')::int as product_count
       from vendors v
       where v.is_active = true
       order by v.created_at asc, v.name asc`
    );
    return rows.map(toVendor);
  } catch (error) {
    console.error('Failed to fetch vendors:', error);
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  const rows = await query('select * from categories order by "order" asc, name asc');
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    parentId: r.parent_id ?? null,
    order: r.order ?? 0,
    bannerImageUrl: r.banner_image_url ?? undefined,
  }));
}

export async function getBanners(): Promise<Banner[]> {
  try {
    const rows = await query('select * from banners order by "order" asc');
    if (!rows.length) return getStaticBanners();
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title ?? '',
      subtitle: r.subtitle ?? undefined,
      images: r.images ?? [],
      linkUrl: r.link_url ?? '',
      position: r.position ?? 'hero',
      isActive: !!r.is_active,
      order: r.order ?? 0,
    }));
  } catch (error) {
    console.error('Failed to fetch banners, falling back to static data:', error);
    return getStaticBanners();
  }
}
