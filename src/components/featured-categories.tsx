import Link from 'next/link';
import { getCategories } from '@/lib/data';
import { CategoryIcons } from './icons';
import { Card, CardContent } from './ui/card';

export function FeaturedCategories() {
  const categories = getCategories();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-4">
          {categories.map((category) => {
            const Icon = CategoryIcons[category.slug];
            return (
              <Link key={category.id} href={`/products?category=${category.slug}`} className="group">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    {Icon && (
                      <div className="bg-secondary text-foreground rounded-full p-3 group-hover:bg-accent transition-colors duration-300">
                        <Icon className="h-6 w-6" />
                      </div>
                    )}
                    <h3 className="font-medium text-xs text-muted-foreground group-hover:text-primary">{category.name}</h3>
                  </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
