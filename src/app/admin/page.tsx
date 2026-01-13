
'use client';

import { ProductList } from '@/components/admin/product-list';
import { useAdminProducts } from '@/hooks/use-site-data';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function AdminDashboardPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/admin/products');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
}
