
import type { ImagePlaceholder } from './placeholder-images';

export type Product = {
  id: string;
  title: string;
  slug: string;
  images: ImagePlaceholder[];
  price: number;
  salePrice?: number;
  currency: 'XOF';
  brand?: string;
  category: string; // slug of category
  specs: Record<string, string>;
  stock: number;
  variants: { name: string; options: { value: string; stock: number }[] }[];
  status: 'active' | 'draft';
  createdAt: string; // ISO date string
  isBestseller?: boolean;
  isNew?: boolean;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
};

export type SubCategory = {
  id: string;
  name: string;
  slug: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: React.ComponentType<{ className?: string }>;
  subCategories?: SubCategory[];
};

export type SimpleCategory = Omit<Category, 'icon'>;

export type Banner = {
  id: string;
  title: string;
  image: ImagePlaceholder;
  linkUrl: string;
};

export type CartItem = {
  id: string; // A unique ID for the cart item (e.g., product.id + variant.value)
  product: Product;
  quantity: number;
  variant?: { name: string; value: string; };
};

export type SiteSettings = {
  logoUrl?: string;
  announcementMessage?: string;
};
