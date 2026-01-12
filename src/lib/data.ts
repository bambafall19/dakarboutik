
import type { ImagePlaceholder } from './placeholder-images';
import { findImage } from './placeholder-images';
import type { Banner, Category, SimpleCategory, SiteSettings } from './types';

const categories: Category[] = [
  { id: 'cat-telephones-tablettes', name: 'Téléphones & Tablettes', slug: 'telephones-tablettes' },
  { id: 'cat-ordinateurs', name: 'Ordinateurs', slug: 'ordinateurs' },
  { id: 'cat-stockage', name: 'Stockage', slug: 'stockage' },
  { id: 'cat-accessoires', name: 'Accessoires', slug: 'accessoires' },
  { id: 'cat-audio', name: 'Audio', slug: 'audio' },
];

const banners: Banner[] = [
  {
    id: 'banner1',
    title: 'La tech à votre portée',
    subtitle: 'Les dernières nouveautés smartphones, ordinateurs et accessoires au meilleur prix.',
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
    linkUrl: '/products?category=accessoires',
  },
];


export const getCategories = (): Category[] => categories;

export const getSimpleCategories = (): SimpleCategory[] => {
  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
  }));
}

export const getCategoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);
  
export const getBanners = () => banners;


