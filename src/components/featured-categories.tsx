import Link from 'next/link';
import { getCategories } from '@/lib/data';
import { CategoryIcons } from './icons';
import { Card, CardContent } from './ui/card';

export function FeaturedCategories() {
  const categories = getCategories();

  // We only want to feature top-level categories here
  const featured = categories.filter(c => !c.subCategories || c.subCategories.length === 0 || c.slug === 'informatique');
  const otherCats = categories.filter(c => c.slug !== 'informatique' && (!c.subCategories || c.subCategories.length === 0));

  const mainCategories = [
    categories.find(c => c.slug === 'informatique'),
    categories.find(c => c.slug === 'telephones-tablettes'),
    categories.find(c => c.slug === 'accessoires'),
  ].filter(Boolean) as (typeof categories);


  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {mainCategories.map((category) => {
            const Icon = CategoryIcons[category.slug];
            return (
              <Link key={category.id} href={`/products?category=${category.slug}`} className="group">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    {Icon && (
                      <div className="bg-secondary text-foreground rounded-full p-3 group-hover:bg-accent transition-colors duration-300">
                        <Icon className="h-6 w-6" />
                      </div>
                    )}
                    <h3 className="font-medium text-sm text-muted-foreground group-hover:text-primary">{category.name}</h3>
                  </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
