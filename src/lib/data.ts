
import type { ImagePlaceholder } from './placeholder-images';
import { findImage } from './placeholder-images';
import type { Banner } from './types';


const banners: Banner[] = [
  {
    id: 'banner1',
    title: 'La technologie qui vous ressemble',
    subtitle: 'Smartphones, ordinateurs, accessoires... Tout ce qu\'il vous faut est ici.',
    image: findImage('banner1'),
    linkUrl: '/products',
  },
  {
    id: 'banner-laptops',
    title: 'PC Portables Puissants',
    subtitle: 'Pour le travail ou le jeu',
    image: findImage('banner-laptops'),
    linkUrl: '/products?category=informatique',
  },
  {
    id: 'banner-accessories',
    title: 'Accessoires Indispensables',
    subtitle: 'Chargeurs, câbles, coques et plus',
    image: findImage('banner-accessories'),
    linkUrl: '/products?category=accessoires',
  },
  {
    id: 'promo-banner-1',
    title: 'Le Son Immersif',
    subtitle: 'Casques et écouteurs haute-fidélité',
    image: findImage('banner-headphones'),
    linkUrl: '/products?category=audio',
  },
  {
    id: 'promo-banner-2',
    title: 'Restez Connecté',
    subtitle: 'Toute notre gamme de smartphones',
    image: findImage('product-phone-1a'),
    linkUrl: '/products?category=telephonie',
  },
];
  
export const getBanners = () => banners;
