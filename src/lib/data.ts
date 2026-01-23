
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
    position: 'hero',
    isActive: true,
    order: 1,
  },
  {
    id: 'ad-banner-1',
    title: 'PC Portables Puissants',
    subtitle: '',
    images: [findImage('banner-laptops')],
    linkUrl: '/products?category=informatique',
    position: 'ad',
    isActive: true,
    order: 1,
  },
  {
    id: 'ad-banner-2',
    title: 'Accessoires Indispensables',
    subtitle: '',
    images: [findImage('banner-accessories')],
    linkUrl: '/products?category=accessoires',
    position: 'ad',
    isActive: true,
    order: 2,
  },
   {
    id: 'ad-banner-3',
    title: 'Le Son Immersif',
    subtitle: '',
    images: [findImage('banner-headphones')],
    linkUrl: '/products?category=audio',
    position: 'ad',
    isActive: true,
    order: 3,
  },
  {
    id: 'promo-banner-1',
    title: 'Le Son Immersif',
    subtitle: 'Casques et écouteurs haute-fidélité',
    images: [findImage('banner-headphones')],
    linkUrl: '/products?category=audio',
    position: 'promo',
    isActive: true,
    order: 1,
  },
  {
    id: 'promo-banner-2',
    title: 'Restez Connecté',
    subtitle: 'Toute notre gamme de smartphones',
    images: [findImage('product-phone-1a')],
    linkUrl: '/products?category=telephonie',
    position: 'promo',
    isActive: true,
    order: 2,
  },
  {
    id: 'announcement-1',
    title: 'Annonce 1',
    subtitle: '',
    images: [findImage('announcement-1')],
    linkUrl: '/products?sortBy=newest',
    position: 'announcement',
    isActive: true,
    order: 1,
  },
  {
    id: 'announcement-2',
    title: 'Annonce 2',
    subtitle: '',
    images: [findImage('announcement-2')],
    linkUrl: '/products',
    position: 'announcement',
    isActive: true,
    order: 2,
  },
  {
    id: 'announcement-3',
    title: 'Annonce 3',
    subtitle: '',
    images: [findImage('announcement-3')],
    linkUrl: '/sav',
    position: 'announcement',
    isActive: true,
    order: 3,
  },
];
  
export const getBanners = () => banners;

    
