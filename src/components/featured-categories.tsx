import Link from 'next/link';
import { getCategories } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryIcons } from './icons';

export function FeaturedCategories() {
  const categories = getCategories();

  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-8">
        Parcourir par catégorie
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {categories.map((category) => {
          const Icon = CategoryIcons[category.slug];
          return (
            <Link key={category.id} href={`/products?category=${category.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                <CardContent className="flex flex-col items-center justify-center p-6 gap-4 text-center">
                  {Icon && (
                    <div className="bg-primary/10 text-primary rounded-full p-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Icon className="h-8 w-8" />
                    </div>
                  )}
                  <h3 className="font-semibold text-md">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
