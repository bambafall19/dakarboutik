
import type { ImagePlaceholder } from './placeholder-images';
import { findImage } from './placeholder-images';
import type { Banner, Category, Product, SimpleCategory, SiteSettings } from './types';

const categories: Category[] = [
  { id: 'cat-t-shirt', name: 'T-Shirt', slug: 't-shirt' },
  { id: 'cat-jacket', name: 'Jacket', slug: 'jacket' },
  { id: 'cat-shirt', name: 'Shirt', slug: 'shirt' },
  { id: 'cat-jeans', name: 'Jeans', slug: 'jeans' },
  { id: 'cat-bag', name: 'Bag', slug: 'bag' },
  { id: 'cat-shoes', name: 'Shoes', slug: 'shoes' },
  { id: 'cat-watches', name: 'Watches', slug: 'watches' },
  { id: 'cat-cap', name: 'Cap', slug: 'cap' },
  {
    id: 'cat-accessoires',
    name: 'Accessoires',
    slug: 'accessoires-informatiques',
  },
  {
    id: 'cat-informatique',
    name: 'Informatique',
    slug: 'informatique',
  },
  {
    id: 'cat-telephones-tablettes',
    name: 'Téléphones',
    slug: 'telephones-tablettes',
  },
];

const banners: Banner[] = [
  {
    id: 'banner1',
    title: 'Up to 50% OFF!',
    subtitle: 'Redefine Your Everyday Style.',
    image: findImage('banner-1'),
    linkUrl: '/products?category=telephones-tablettes',
  },
  {
    id: 'banner-sale',
    title: 'SOLDES',
    subtitle: 'Jusqu\'à -50%',
    image: findImage('banner-sale'),
    linkUrl: '/products',
  },
  {
    id: 'banner3',
    title: 'Le son immersif à votre portée',
    subtitle: 'Explorez notre sélection de casques et écouteurs.',
    image: findImage('banner-2'),
    linkUrl: '/products?category=accessoires-informatiques',
  },
];


export const getCategories = (): Category[] => categories;

export const getSimpleCategories = (): SimpleCategory[] => {
  return categories.map(({ ...rest }) => rest);
}

export const getCategoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);
  
export const getBanners = () => banners;
