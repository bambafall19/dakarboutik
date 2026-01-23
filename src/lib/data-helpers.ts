

import type { Category, Product } from "./types";

/**
 * Builds a nested category tree from a flat array of categories.
 */
export const buildCategoryHierarchy = (rawCategories: Category[]): Category[] => {
    const categoryMap: { [key: string]: Category & { children: Category[] } } = {};
    const topLevelCategories: (Category & { children: Category[] })[] = [];

    // First pass: create a map of all categories and initialize children array.
    for (const category of rawCategories) {
        categoryMap[category.id] = { 
            ...category, 
            children: [],
        };
    }

    // Second pass: build the hierarchy.
    for (const categoryId in categoryMap) {
        const category = categoryMap[categoryId];
        if (category.parentId && categoryMap[category.parentId]) {
            categoryMap[category.parentId].children.push(category);
        } else {
            topLevelCategories.push(category);
        }
    }
    
    // Recursive function to build the final nested structure.
    const buildHierarchy = (cats: (Category & { children: Category[] })[]): Category[] => {
        return cats.map(cat => {
            const { children, ...rest } = cat;
            const subCategories = children.length > 0 ? buildHierarchy(children) : undefined;
            return { ...rest, subCategories };
        }).sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.name.localeCompare(b.name));
    }
    
    return buildHierarchy(topLevelCategories);
}


/**
 * Finds a category by its slug from a flat list of categories.
 */
export function getCategoryBySlug(slug: string, allCategories: Category[]): Category | undefined {
    return allCategories.find(c => c.slug === slug);
}


/**
 * Finds the entire parental path for a given category slug.
 */
export function getCategoryPath(slug: string, allCategories: Category[]): Category[] {
    const path: Category[] = [];
    let current = allCategories.find(c => c.slug === slug);

    if (!current) {
        return [];
    }

    // Traverse up the parent chain, but don't include the category itself in the path
    while (current && current.parentId) {
        const parent = allCategories.find(c => c.id === current?.parentId);
        if (parent) {
            path.unshift(parent);
            current = parent;
        } else {
            break;
        }
    }
    return path;
}


/**
 * Gets a category and all its descendants' slugs.
 */
export function getAllChildCategorySlugs(parentSlug: string, allCategories: Category[]): string[] {
    const parentCategory = getCategoryBySlug(parentSlug, allCategories);
    if (!parentCategory) {
        return [parentSlug]; // Return slug itself if not found
    }

    let slugs = [parentCategory.slug];
    const children = allCategories.filter(c => c.parentId === parentCategory.id);

    for (const child of children) {
        slugs = slugs.concat(getAllChildCategorySlugs(child.slug, allCategories));
    }
    return slugs;
}

export function getCategoriesWithCounts(rawCategories: Category[], allProducts: Product[]): Category[] {
    if (!rawCategories || !allProducts) return [];
  
    const productCounts: { [categorySlug: string]: number } = {};
    allProducts.forEach(product => {
      productCounts[product.category] = (productCounts[product.category] || 0) + 1;
    });
  
    const categoryMap: { [id: string]: Category & { children: Category[] } } = {};
    rawCategories.forEach(cat => {
      categoryMap[cat.id] = { ...cat, productCount: 0, children: [] };
    });
  
    const getChildrenCount = (catId: string): number => {
      const cat = categoryMap[catId];
      if (!cat) return 0;
  
      let total = productCounts[cat.slug] || 0;
      
      const children = rawCategories.filter(c => c.parentId === catId);
      for (const child of children) {
          total += getChildrenCount(child.id);
      }
      return total;
    };
  
    const categoriesWithCounts = rawCategories.map(cat => ({
      ...cat,
      productCount: getChildrenCount(cat.id),
    }));
  
    return buildCategoryHierarchy(categoriesWithCounts);
  }