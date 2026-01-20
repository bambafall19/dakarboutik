

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
  currency: 'FCA';
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
};


// Allow for nested categories/sub-categories
export type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: React.ComponentType<{ className?: string }>;
  parentId?: string | null;
  subCategories?: Category[];
  productCount?: number;
  order?: number;
};

export type SimpleCategory = Omit<Category, 'icon' | 'subCategories' | 'productCount'>;

export type Banner = {
  id: string;
  title: string;
  subtitle?: string;
  images: ImagePlaceholder[];
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
  id: string;
  logoUrl?: string | null;
  announcementMessage1?: string;
  announcementMessage2?: string;
  announcementMessage3?: string;
  whatsappNumber?: string;
  supportPhone?: string;
  supportEmail?: string;
  deliveryInfo?: string;
  returnPolicy?: string;
  afterSalesService?: string;
};

export type CustomerInfo = {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
};

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export type OrderStatusHistoryItem = {
  status: OrderStatus;
  date: string; // ISO date string
};

export type PublicNote = {
    date: string; // ISO date string
    note: string;
}

export type Order = {
    id: string;
    orderId: string; // User-friendly ID like DKB-12345
    customerInfo: CustomerInfo;
    items: CartItem[];
    totalPrice: number;
    shippingCost: number;
    grandTotal: number;
    status: OrderStatus;
    createdAt: string; // ISO date string
    deliveryMethod: 'dakar' | 'hors-dakar';
    adminNotes?: string;
    publicNotes?: PublicNote[];
};

export type PublicOrder = {
  id: string;
  orderId: string;
  status: OrderStatus;
  createdAt: string;
  statusHistory: OrderStatusHistoryItem[];
  publicNotes?: PublicNote[];
};

export type Review = {
  id: string;
  rating: number; // 1 to 5
  title: string;
  text: string;
  author: string;
  createdAt: string; // ISO date string
};
    
export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  order: number;
};
