
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/types';

const MAX_RECENT_PRODUCTS = 5;
const LOCAL_STORAGE_KEY = 'dakarboutik_recent_products';

export const useRecentProducts = () => {
    const [recentProducts, setRecentProducts] = useState<Product[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedItems) {
                setRecentProducts(JSON.parse(storedItems));
            }
        } catch (error) {
            console.error('Failed to load recent products from localStorage', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const addRecentProduct = useCallback((product: Product) => {
        setRecentProducts(prevProducts => {
            // Remove the product if it already exists to move it to the front
            const filteredProducts = prevProducts.filter(p => p.id !== product.id);
            const newProducts = [product, ...filteredProducts].slice(0, MAX_RECENT_PRODUCTS);
            
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProducts));
            } catch (error) {
                console.error('Failed to save recent products to localStorage', error);
            }
            
            return newProducts;
        });
    }, []);

    return { recentProducts, addRecentProduct, isLoaded };
};
