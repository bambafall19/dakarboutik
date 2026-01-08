
import { Smartphone, Headphones, Laptop, Plug, Speaker } from 'lucide-react';
import { PlaceHolderImages, type ImagePlaceholder } from './placeholder-images';
import type { Banner, Category, Product } from './types';

const findImage = (id: string): ImagePlaceholder => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  if (!image) {
    // Return a default placeholder if not found, to avoid crashes
    return {
      id: 'not-found',
      description: 'Image not found',
      imageUrl: 'https://placehold.co/800x800',
      imageHint: 'placeholder',
    };
  }
  return image;
};


const categories: Category[] = [
  { id: 'cat1', name: 'Smartphones', slug: 'smartphones', icon: Smartphone },
  { id: 'cat2', name: 'Accessoires', slug: 'accessoires', icon: Plug },
  { id: 'cat3', name: 'Audio', slug: 'audio', icon: Headphones },
  { id: 'cat4', name: 'PC & Portables', slug: 'pc-portables', icon: Laptop },
];

const products: Product[] = [
  {
    id: 'prod1',
    title: 'Smartphone X200 Pro',
    slug: 'smartphone-x200-pro',
    images: [findImage('product-phone-1a'), findImage('product-phone-1b')],
    price: 350000,
    currency: 'XOF',
    brand: 'TechNova',
    category: 'smartphones',
    specs: {
      'Écran': '6.7" OLED 120Hz',
      'Processeur': 'Snapdragon 8 Gen 2',
      'RAM': '8Go',
      'Stockage': '256Go',
      'Caméra': '50MP Triple',
    },
    stock: 15,
    variants: [],
    status: 'active',
    createdAt: '2023-10-26T10:00:00Z',
    isBestseller: true,
    isNew: true,
    description: "Le Smartphone X200 Pro repousse les limites de la performance avec son processeur ultra-rapide et son écran OLED époustouflant. Capturez des photos incroyables et profitez d'une autonomie record."
  },
  {
    id: 'prod2',
    title: 'Écouteurs sans fil Buds+',
    slug: 'ecouteurs-sans-fil-buds-plus',
    images: [findImage('product-earbuds-1a'), findImage('product-earbuds-1b')],
    price: 75000,
    salePrice: 65000,
    currency: 'XOF',
    brand: 'AudioPhonic',
    category: 'audio',
    specs: {
      'Connectivité': 'Bluetooth 5.2',
      'Autonomie': '8 heures (24h avec boîtier)',
      'Réduction de bruit': 'Active (ANC)',
      'Poids': '5g par écouteur',
    },
    stock: 30,
    variants: [],
    status: 'active',
    createdAt: '2023-10-15T10:00:00Z',
    isBestseller: true,
    description: "Plongez dans votre musique avec les Buds+. Un son immersif, une réduction de bruit active efficace et un confort exceptionnel pour une utilisation toute la journée."
  },
  {
    id: 'prod3',
    title: 'PowerBank 20000mAh FastCharge',
    slug: 'powerbank-20000mah-fastcharge',
    images: [findImage('product-powerbank-1a')],
    price: 25000,
    currency: 'XOF',
    brand: 'ChargeUp',
    category: 'accessoires',
    specs: {
      'Capacité': '20000mAh',
      'Sortie': 'USB-C PD 45W, USB-A QC 3.0',
      'Poids': '380g',
    },
    stock: 50,
    variants: [],
    status: 'active',
    createdAt: '2023-09-20T10:00:00Z',
    description: "Ne tombez plus jamais en panne de batterie. Cette PowerBank haute capacité recharge vos appareils à vitesse grand V, du smartphone à l'ordinateur portable."
  },
  {
    id: 'prod4',
    title: 'Câble USB-C Tressé 2m',
    slug: 'cable-usb-c-tresse-2m',
    images: [findImage('product-cable-1a')],
    price: 8000,
    currency: 'XOF',
    brand: 'DuraCable',
    category: 'accessoires',
    specs: {
      'Longueur': '2m',
      'Type': 'USB-C vers USB-C',
      'Puissance': '100W',
      'Matériau': 'Nylon tressé',
    },
    stock: 100,
    variants: [],
    status: 'active',
    createdAt: '2023-08-01T10:00:00Z',
    description: "Robuste et fiable, ce câble tressé est conçu pour durer. Compatible avec la charge rapide jusqu'à 100W, c'est l'accessoire indispensable pour tous vos appareils USB-C."
  },
  {
    id: 'prod5',
    title: 'Enceinte Bluetooth GO',
    slug: 'enceinte-bluetooth-go',
    images: [findImage('product-speaker-1a')],
    price: 45000,
    currency: 'XOF',
    brand: 'AudioPhonic',
    category: 'audio',
    specs: {
      'Puissance': '20W RMS',
      'Autonomie': '12 heures',
      'Étanchéité': 'IPX7',
      'Connectivité': 'Bluetooth 5.0, Jack 3.5mm',
    },
    stock: 25,
    variants: [],
    status: 'active',
    createdAt: '2023-10-22T10:00:00Z',
    isNew: true,
    description: "L'enceinte GO vous suit partout, de la plage au salon. Un son puissant et clair dans un format compact et étanche. L'ambiance est assurée !"
  },
  {
    id: 'prod6',
    title: 'Laptop ProBook 14"',
    slug: 'laptop-probook-14',
    images: [findImage('product-laptop-1a')],
    price: 850000,
    currency: 'XOF',
    brand: 'Compify',
    category: 'pc-portables',
    specs: {
      'Processeur': 'Intel Core i5 13th Gen',
      'RAM': '16Go DDR5',
      'Stockage': '512Go SSD NVMe',
      'Écran': '14" IPS QHD',
    },
    stock: 8,
    variants: [],
    status: 'active',
    createdAt: '2023-10-18T10:00:00Z',
    isBestseller: true,
    isNew: true,
    description: "Le ProBook 14 est le parfait équilibre entre mobilité et puissance. Idéal pour les professionnels nomades et les créatifs exigeants, il allie design élégant et performances de pointe."
  },
   {
    id: 'prod7',
    title: 'Smartphone Lite A55',
    slug: 'smartphone-lite-a55',
    images: [findImage('product-phone-2a')],
    price: 180000,
    currency: 'XOF',
    brand: 'Connect+',
    category: 'smartphones',
    specs: {
      'Écran': '6.5" LCD 90Hz',
      'Processeur': 'MediaTek G95',
      'RAM': '6Go',
      'Stockage': '128Go',
      'Caméra': '48MP',
    },
    stock: 22,
    variants: [],
    status: 'active',
    createdAt: '2023-10-05T10:00:00Z',
    description: "Le Lite A55 offre une expérience fluide et fiable pour le quotidien. Un grand écran, une bonne autonomie et un appareil photo polyvalent à un prix accessible."
  },
  {
    id: 'prod8',
    title: 'Casque Pro Studio',
    slug: 'casque-pro-studio',
    images: [findImage('product-headphones-1a')],
    price: 120000,
    currency: 'XOF',
    brand: 'AudioPhonic',
    category: 'audio',
    specs: {
      'Connectivité': 'Bluetooth 5.1, Jack 3.5mm',
      'Autonomie': '40 heures',
      'Réduction de bruit': 'Hybride Adaptative',
      'Pliable': 'Oui',
    },
    stock: 18,
    variants: [],
    status: 'active',
    createdAt: '2023-09-10T10:00:00Z',
    isBestseller: true,
    description: "Le casque Pro Studio est conçu pour les audiophiles. Profitez d'un son haute-fidélité et d'une isolation phonique immersive pour une concentration totale."
  },
  {
    id: 'prod9',
    title: 'Chargeur Mural 65W GaN',
    slug: 'chargeur-mural-65w-gan',
    images: [findImage('product-charger-1a')],
    price: 18000,
    currency: 'XOF',
    brand: 'ChargeUp',
    category: 'accessoires',
    specs: {
      'Puissance': '65W',
      'Ports': '2x USB-C, 1x USB-A',
      'Technologie': 'GaN (Nitrate de Gallium)',
      'Compact': 'Oui',
    },
    stock: 40,
    variants: [],
    status: 'active',
    createdAt: '2023-07-15T10:00:00Z',
    description: "Un seul chargeur pour tous vos appareils. La technologie GaN permet une puissance de 65W dans un format ultra compact. Le compagnon de voyage idéal."
  },
  {
    id: 'prod10',
    title: 'PowerBank Slim 10000mAh',
    slug: 'powerbank-slim-10000mah',
    images: [findImage('product-powerbank-2a')],
    price: 15000,
    currency: 'XOF',
    brand: 'ChargeUp',
    category: 'accessoires',
    specs: {
      'Capacité': '10000mAh',
      'Sortie': 'USB-C 20W, USB-A 18W',
      'Poids': '220g',
    },
    stock: 60,
    variants: [],
    status: 'active',
    createdAt: '2023-09-30T10:00:00Z',
    description: "Fine, légère et élégante, cette PowerBank de 10000mAh se glisse dans n'importe quelle poche pour vous assurer une journée complète d'autonomie."
  },
  {
    id: 'prod11',
    title: 'Enceinte SoundWave Mini',
    slug: 'enceinte-soundwave-mini',
    images: [findImage('product-speaker-2a')],
    price: 28000,
    currency: 'XOF',
    brand: 'AudioPhonic',
    category: 'audio',
    specs: {
      'Puissance': '10W RMS',
      'Autonomie': '15 heures',
      'Étanchéité': 'IP67',
      'Connectivité': 'Bluetooth 5.2',
    },
    stock: 35,
    variants: [],
    status: 'active',
    createdAt: '2023-10-28T10:00:00Z',
    isNew: true,
    description: "Ne vous fiez pas à sa taille. La SoundWave Mini délivre un son étonnamment riche et puissant. Entièrement étanche, elle est prête pour l'aventure."
  },
  {
    id: 'prod12',
    title: 'Multipack Câbles (3-en-1)',
    slug: 'multipack-cables-3-en-1',
    images: [findImage('product-cable-2a')],
    price: 12000,
    currency: 'XOF',
    brand: 'DuraCable',
    category: 'accessoires',
    specs: {
      'Contenu': '1x USB-C (1m), 1x Lightning (1m), 1x Micro-USB (1m)',
      'Matériau': 'Nylon',
    },
    stock: 70,
    variants: [],
    status: 'active',
    createdAt: '2023-06-10T10:00:00Z',
    description: "La solution de charge ultime. Ce pack contient les trois câbles les plus courants pour assurer la compatibilité avec tous vos anciens et nouveaux appareils."
  }
];

const banners: Banner[] = [
  {
    id: 'banner1',
    title: 'Les nouveaux smartphones sont arrivés !',
    image: findImage('banner-1'),
    linkUrl: '/products?category=smartphones',
  },
  {
    id: 'banner2',
    title: 'Le son immersif à votre portée',
    image: findImage('banner-2'),
    linkUrl: '/products?category=audio',
  },
  {
    id: 'banner3',
    title: 'Boostez votre productivité',
    image: findImage('banner-3'),
    linkUrl: '/products?category=accessoires',
  },
];

export const getProducts = () => products.filter(p => p.status === 'active');
export const getProductBySlug = (slug: string) => getProducts().find(p => p.slug === slug);
export const getCategories = () => categories;
export const getCategoryBySlug = (slug: string) => categories.find(c => c.slug === slug);
export const getBanners = () => banners;

export const getNewArrivals = (limit: number = 4) => 
  getProducts()
    .filter(p => p.isNew)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

export const getBestsellers = (limit: number = 4) =>
  getProducts()
    .filter(p => p.isBestseller)
    .slice(0, limit);

    

    