
import type { ImagePlaceholder } from './placeholder-images';
import { findImage } from './placeholder-images';
import type { Banner, Category, Product, SimpleCategory, SiteSettings } from './types';

const categories: Category[] = [
  {
    id: 'cat-accessoires',
    name: 'Accessoires',
    slug: 'accessoires-informatiques',
    subCategories: [
      { id: 'sub-lecteur-multimedia', name: 'Lecteur multimédia', slug: 'lecteur-multimedia' },
      { id: 'sub-routeur', name: 'Routeur', slug: 'routeur' },
      { id: 'sub-casque-info', name: 'Casque', slug: 'casque-info' },
      { id: 'sub-carte-mere', name: 'Carte Mère', slug: 'carte-mere' },
      { id: 'sub-carte-memoire', name: 'Carte mémoire', slug: 'carte-memoire' },
      { id: 'sub-cle-usb', name: 'Clé USB', slug: 'cle-usb' },
      { id: 'sub-disque-dur-externe', name: 'Disque dur externe', slug: 'disque-dur-externe' },
      { id: 'sub-disque-dur-interne', name: 'Disque dur interne', slug: 'disque-dur-interne' },
      { id: 'sub-alimentation-pc', name: 'Alimentation PC', slug: 'alimentation-pc' },
      { id: 'sub-ventilateur-pc', name: 'Ventilateur PC', slug: 'ventilateur-pc' },
      { id: 'sub-carte-graphique', name: 'Carte graphique', slug: 'carte-graphique' },
      { id: 'sub-souris', name: 'Souris', slug: 'souris' },
      { id: 'sub-clavier', name: 'Clavier', slug: 'clavier' },
      { id: 'sub-boitier-pc', name: 'Boîtier PC', slug: 'boitier-pc' },
      { id: 'sub-processeur', name: 'Processeur', slug: 'processeur' },
      { id: 'sub-convertisseur', name: 'Convertisseur, Câble & Adaptateur', slug: 'convertisseur-cable-adaptateur' },
    ],
  },
  {
    id: 'cat-informatique',
    name: 'Informatique',
    slug: 'informatique',
    subCategories: [
      { id: 'sub-ordinateur-portable-pc', name: 'Ordinateur Portable et PC', slug: 'ordinateur-portable-pc' },
    ],
  },
  {
    id: 'cat-telephones-tablettes',
    name: 'Téléphones & Tablettes',
    slug: 'telephones-tablettes',
    subCategories: [
      { id: 'sub-iphone', name: 'iPhone', slug: 'iphone' },
      { id: 'sub-samsung-phone', name: 'Samsung', slug: 'samsung-phone' },
      { id: 'sub-tecno', name: 'Tecno', slug: 'tecno' },
      { id: 'sub-telephones-fixes', name: 'Téléphones fixes', slug: 'telephones-fixes' },
      { id: 'sub-accessoires-telephones', name: 'Accessoires téléphones', slug: 'accessoires-telephones' },
      { id: 'sub-apple-tablet', name: 'Apple', slug: 'apple-tablet' },
      { id: 'sub-microsoft-tablet', name: 'Microsoft', slug: 'microsoft-tablet' },
      { id: 'sub-samsung-tablet', name: 'Samsung (Tablettes)', slug: 'samsung-tablet' },
      { id: 'sub-tablettes-educatives', name: 'Tablettes éducatives', slug: 'tablettes-educatives' },
      { id: 'sub-accessoires-tablettes', name: 'Accessoires tablettes', slug: 'accessoires-tablettes' },
    ],
  },
];

const banners: Banner[] = [
  {
    id: 'banner1',
    title: 'Les nouveaux iPhone 16 Pro Max',
    subtitle: 'Découvrez la puissance et l\'élégance à partir de 750.000 F CFA.',
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
