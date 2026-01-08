import Link from 'next/link';
import { getCategories } from '@/lib/data';
import { CategoryIcons } from './icons';

export function FeaturedCategories() {
  const categories = getCategories();

  return (
    <section>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6">
        {categories.map((category) => {
          const Icon = CategoryIcons[category.slug];
          return (
            <Link key={category.id} href={`/products?category=${category.slug}`} className="group">
                <div className="flex flex-col items-center justify-center p-2 gap-2 text-center">
                  {Icon && (
                    <div className="bg-muted text-foreground rounded-full p-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Icon className="h-7 w-7" />
                    </div>
                  )}
                  <h3 className="font-medium text-sm">{category.name}</h3>
                </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
