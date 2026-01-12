
import type { ImagePlaceholder } from './placeholder-images';
import { findImage } from './placeholder-images';
import type { Banner, Category, SimpleCategory } from './types';

const categories: Category[] = [
  {
    id: 'cat-telephones-tablettes',
    name: 'Téléphones & Tablettes',
    slug: 'telephones-tablettes',
  },
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
          { id: 'sub-imac', name: 'iMac', slug: 'imac' },
          { id: 'sub-macbook', name: 'MacBook', slug: 'macbook' },
        ],
      },
      {
        id: 'sub-peripheriques',
        name: 'Périphériques',
        slug: 'peripheriques',
        subCategories: [
            { id: 'sub-ecrans', name: 'Ecrans', slug: 'ecrans' },
            { id: 'sub-claviers-souris', name: 'Claviers & Souris', slug: 'claviers-souris'},
            { id: 'sub-webcams', name: 'Webcams', slug: 'webcams' },
            { id: 'sub-onduleurs', name: 'Onduleurs', slug: 'onduleurs' },
        ],
      },
      {
        id: 'sub-composants-stockage',
        name: 'Composants & Stockage',
        slug: 'composants-stockage',
        subCategories: [
          { id: 'sub-disque-dur', name: 'Disque Dur', slug: 'disque-dur' },
          { id: 'sub-cle-usb', name: 'Clé USB', slug: 'cle-usb' },
          { id: 'sub-ram', name: 'RAM', slug: 'ram' },
          { id: 'sub-cables-adaptateurs', name: 'Câbles / Adaptateurs', slug: 'cables-adaptateurs' },
          { id: 'sub-boitier', name: 'Boitier', slug: 'boitier' },
          { id: 'sub-serveurs', name: 'Serveurs', slug: 'serveurs' },
        ],
      },
    ],
  },
  { id: 'cat-audio', name: 'Audio', slug: 'audio' },
  { id: 'cat-accessoires', name: 'Accessoires', slug: 'accessoires' },
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

// Returns a flat list of all categories and sub-categories for filtering
export const getSimpleCategories = (): SimpleCategory[] => {
  const simpleCategories: SimpleCategory[] = [];
  const recurse = (cats: Category[]) => {
    for (const cat of cats) {
      const { subCategories, ...rest } = cat;
      simpleCategories.push(rest);
      if (subCategories) {
        recurse(subCategories);
      }
    }
  };
  recurse(categories);
  return simpleCategories;
};

export const getLeafCategories = (): SimpleCategory[] => {
    const leafCategories: SimpleCategory[] = [];
    const recurse = (cats: Category[]) => {
        for (const cat of cats) {
            if (!cat.subCategories || cat.subCategories.length === 0) {
                leafCategories.push({id: cat.id, name: cat.name, slug: cat.slug});
            } else {
                recurse(cat.subCategories);
            }
        }
    };
    recurse(categories);
    // Manually add top-level cats that don't have subs
    categories.forEach(c => {
        if (!c.subCategories) {
            leafCategories.push({id: c.id, name: c.name, slug: c.slug});
        }
    })
    return [...new Map(leafCategories.map(c => [c.id, c])).values()];
}


export const getCategoryBySlug = (slug: string) => {
    const all = getSimpleCategories();
    return all.find((c) => c.slug === slug);
}
  
export const getBanners = () => banners;

export function getAllChildCategorySlugs(parentSlug: string): string[] {
  const allCategories = getCategories();
  
  // Find the category (at any level)
  let parentCategory: Category | undefined;
  const findInCategory = (cats: Category[]): Category | undefined => {
      for (const cat of cats) {
          if (cat.slug === parentSlug) return cat;
          if (cat.subCategories) {
              const found = findInCategory(cat.subCategories);
              if (found) return found;
          }
      }
      return undefined;
  }
  parentCategory = findInCategory(allCategories);

  if (!parentCategory) return [parentSlug];

  const slugs: string[] = [];
  const recurse = (category: Category) => {
    slugs.push(category.slug);
    if (category.subCategories) {
      category.subCategories.forEach(recurse);
    }
  };

  recurse(parentCategory);
  return slugs;
}
