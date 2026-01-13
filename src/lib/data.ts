

import type { ImagePlaceholder } from './placeholder-images';
import { findImage } from './placeholder-images';
import type { Banner, Category, SimpleCategory } from './types';


const banners: Banner[] = [
  {
    id: 'banner1',
    title: 'Baobab High Tech',
    subtitle: 'Bienvenue !',
    image: findImage('banner-1'),
    linkUrl: '/products',
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
  
export const getBanners = () => banners;
