
import type { ImagePlaceholder } from './placeholder-images';
import { findImage } from './placeholder-images';
import type { Banner } from './types';


const banners: Banner[] = [
  {
    id: 'banner1',
    title: 'La technologie qui vous ressemble',
    subtitle: 'Smartphones, ordinateurs, accessoires... Tout ce qu\'il vous faut est ici.',
    images: [findImage('banner1')],
    linkUrl: '/products',
  },
  {
    id: 'banner-laptops',
    title: 'PC Portables Puissants',
    subtitle: 'Pour le travail ou le jeu',
    images: [findImage('banner-laptops')],
    linkUrl: '/products?category=informatique',
  },
  {
    id: 'banner-accessories',
    title: 'Accessoires Indispensables',
    subtitle: 'Chargeurs, câbles, coques et plus',
    images: [findImage('banner-accessories')],
    linkUrl: '/products?category=accessoires',
  },
  {
    id: 'promo-banner-1',
    title: 'Le Son Immersif',
    subtitle: 'Casques et écouteurs haute-fidélité',
    images: [findImage('banner-headphones')],
    linkUrl: '/products?category=audio',
  },
  {
    id: 'promo-banner-2',
    title: 'Restez Connecté',
    subtitle: 'Toute notre gamme de smartphones',
    images: [findImage('product-phone-1a')],
    linkUrl: '/products?category=telephonie',
  },
  {
    id: 'announcement-1',
    title: 'Annonce 1',
    images: [findImage('announcement-1')],
    linkUrl: '/products?sortBy=newest',
  },
  {
    id: 'announcement-2',
    title: 'Annonce 2',
    images: [findImage('announcement-2')],
    linkUrl: '/products',
  },
  {
    id: 'announcement-3',
    title: 'Annonce 3',
    images: [findImage('announcement-3')],
    linkUrl: '/sav',
  },
];
  
export const getBanners = () => banners;

    