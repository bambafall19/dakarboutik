
import type { Category } from './types';
import slugify from 'slugify';

const slug = (name: string) => slugify(name, { lower: true, strict: true });

// Note: These are Omit<Category, 'subCategories' | 'productCount'>
// Firestore will just have the flat list. The hierarchy is built on the client.
export const initialCategories: Omit<Category, 'subCategories' | 'productCount'>[] = [
  { id: 'telephonie', name: 'Téléphonie', slug: slug('Téléphonie'), parentId: null, order: 1 },
  { id: 'informatique', name: 'Informatique', slug: slug('Informatique'), parentId: null, order: 2 },
  { id: 'audio', name: 'Audio', slug: slug('Audio'), parentId: null, order: 3 },
  { id: 'accessoires', name: 'Accessoires', slug: slug('Accessoires'), parentId: null, order: 4 },

  { id: 'smartphones', name: 'Smartphones', slug: slug('Smartphones'), parentId: 'telephonie', order: 1 },
  
  { id: 'pc-portables', name: 'PC Portables', slug: slug('PC Portables'), parentId: 'informatique', order: 1 },
  { id: 'tablettes', name: 'Tablettes', slug: slug('Tablettes'), parentId: 'informatique', order: 2 },
  
  { id: 'ecouteurs', name: 'Écouteurs', slug: slug('Écouteurs'), parentId: 'audio', order: 1 },
  { id: 'casques', name: 'Casques', slug: slug('Casques'), parentId: 'audio', order: 2 },
  
  { id: 'chargeurs', name: 'Chargeurs', slug: slug('Chargeurs'), parentId: 'accessoires', order: 1 },
  { id: 'cables', name: 'Câbles', slug: slug('Câbles'), parentId: 'accessoires', order: 2 },
  { id: 'power-banks', name: 'Power Banks', slug: slug('Power Banks'), parentId: 'accessoires', order: 3 },
];
