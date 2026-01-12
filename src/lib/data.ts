
import type { ImagePlaceholder } from './placeholder-images';
import { findImage } from './placeholder-images';
import type { Banner, Category, SimpleCategory, SiteSettings } from './types';

const categories: Category[] = [
  {
    id: 'cat-informatique',
    name: 'Informatique',
    slug: 'informatique',
    subCategories: [
      {
        id: 'sub-ordinateurs',
        name: 'Ordinateurs',
        slug: 'ordinateurs',
        subCategories: [
          { id: 'sub-pc-bureau', name: 'PC Bureau', slug: 'pc-bureau' },
          { id: 'sub-all-in-one', name: 'All In One', slug: 'all-in-one' },
          { id: 'sub-pc-portable', name: 'PC Portable', slug: 'pc-portable' },
          { id: 'sub-clavier-souris', name: 'Claviers & Souris', slug: 'clavier-souris' },
          { id: 'sub-imac', name: 'iMac', slug: 'imac' },
          { id: 'sub-macbook', name: 'MacBook', slug: 'macbook' },
          { id: 'sub-ecrans', name: 'Ecrans', slug: 'ecrans' },
        ],
      },
      {
        id: 'sub-supports-stockage',
        name: 'Supports de stockage',
        slug: 'supports-stockage',
        subCategories: [
          { id: 'sub-disque-dur', name: 'Disque Dur', slug: 'disque-dur' },
          { id: 'sub-cle-usb', name: 'Clé USB', slug: 'cle-usb' },
          { id: 'sub-ram', name: 'RAM', slug: 'ram' },
          { id: 'sub-cables-adaptateurs', name: 'Câbles / Adaptateurs', slug: 'cables-adaptateurs' },
          { id: 'sub-boitier', name: 'Boitier', slug: 'boitier' },
          { id: 'sub-accessoires-stockage', name: 'Accessoires de stockage', slug: 'accessoires-stockage' },
          { id: 'sub-serveurs', name: 'Serveurs', slug: 'serveurs' },
          { id: 'sub-webcams', name: 'Webcams', slug: 'webcams' },
          { id: 'sub-onduleurs', name: 'Onduleurs', slug: 'onduleurs' },
          { id: 'sub-objets-connectes', name: 'Objets connectés', slug: 'objets-connectes' },
        ],
      },
    ],
  },
  { id: 'cat-telephones-tablettes', name: 'Téléphones & Tablettes', slug: 'telephones-tablettes' },
  { id: 'cat-accessoires', name: 'Accessoires Informatiques', slug: 'accessoires' },
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
    linkUrl: '/products?category=accessoires',
  },
];


export const getCategories = (): Category[] => categories;

export const getSimpleCategories = (): SimpleCategory[] => {
  const simpleCategories: SimpleCategory[] = [];
  
  function flattenCategories(cats: Category[]) {
    cats.forEach(cat => {
      simpleCategories.push({ id: cat.id, name: cat.name, slug: cat.slug });
      if (cat.subCategories) {
        // @ts-ignore
        flattenCategories(cat.subCategories);
      }
    });
  }

  flattenCategories(categories);
  return simpleCategories;
}

export const getCategoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);
  
export const getBanners = () => banners;
