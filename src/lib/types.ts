

import type { ImagePlaceholder } from './placeholder-images';

export type ProductVariantOption = {
  value: string;
  stock: number;
};

export type ProductVariant = {
  name: string;
  options: ProductVariantOption[];
};

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
  variants: ProductVariant[];
  status: 'active' | 'draft';
  createdAt: string; // ISO date string
  isBestseller?: boolean;
  isNew?: boolean;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
};

export type ProductFormData = Omit<Product, 'id' | 'slug' | 'createdAt' | 'images'> & {
    id?: string;
    imageUrl1?: string;
    imageUrl2?: string;
};


export type SubCategory = {
  id: string;
  name: string;
  slug: string;
};

// Allow for nested categories/sub-categories
export type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: React.ComponentType<{ className?: string }>;
  subCategories?: Category[];
};

export type SimpleCategory = Omit<Category, 'icon' | 'subCategories'>;

export type Banner = {
  id: string;
  title: string;
  subtitle?: string;
  image: ImagePlaceholder;
  linkUrl: string;
};

export type SelectedVariant = {
  name: string;
  value: string;
};

export type CartItem = {
  id: string; // A unique ID for the cart item (e.g., product.id + variant info)
  product: Product;
  quantity: number;
  selectedVariants?: SelectedVariant[];
};


export type SiteSettings = {
  logoUrl?: string;
  announcementMessage?: string;
};
