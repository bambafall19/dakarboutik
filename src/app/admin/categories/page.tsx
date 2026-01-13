
'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCategories } from '@/hooks/use-site-data';
import type { Category } from '@/lib/types';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';

function CategoryRow({ category, level = 0 }: { category: Category, level?: number }) {
    const hasSubCategories = category.subCategories && category.subCategories.length > 0;
    
    return (
      <>
        <TableRow>
          <TableCell style={{ paddingLeft: `${1 + level * 2}rem` }}>
            <span className="font-medium">{category.name}</span>
          </TableCell>
          <TableCell className="hidden md:table-cell">{category.slug}</TableCell>
          <TableCell className="hidden md:table-cell">{hasSubCategories ? category.subCategories.length : 0}</TableCell>
          <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>Modifier</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 focus:text-red-600">Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {hasSubCategories && category.subCategories.map(subCat => (
          <CategoryRow key={subCat.id} category={subCat} level={level + 1} />
        ))}
      </>
    );
  }

export default function CategoriesPage() {
    const { categories } = useCategories();

  return (
    <div className="py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Catégories</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle>Catégories de produits</CardTitle>
                <CardDescription>
                    Gérez la structure de votre catalogue de produits.
                </CardDescription>
            </div>
            <Button size="sm">
                  <PlusCircle className="h-3.5 w-3.5 mr-2" />
                  Ajouter une catégorie
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead className="hidden md:table-cell">Slug</TableHead>
                        <TableHead className="hidden md:table-cell">Sous-catégories</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map(cat => (
                        <CategoryRow key={cat.id} category={cat} />
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
