
import 'server-only';
import { initializeFirebase } from '@/firebase/server';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import type { Banner, Product, SiteSettings } from './types';
import { getBanners as getStaticBanners } from './data';

// This is a server-side only function
export async function getProducts() {
  const { firestore } = initializeFirebase();
  const productsRef = collection(firestore, 'products');
  const q = query(productsRef, where('status', '==', 'active'));
  const querySnapshot = await getDocs(q);

  const products = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  return products;
}

export async function getProductBySlug(slug: string) {
    const { firestore } = initializeFirebase();
    const productsRef = collection(firestore, 'products');
    const q = query(productsRef, where('slug', '==', slug), where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Product;
}

export async function getBanners() {
    const { firestore } = initializeFirebase();
    try {
        const bannersRef = collection(firestore, 'banners');
        const querySnapshot = await getDocs(bannersRef);
        
        if (querySnapshot.empty) {
            console.log("No banners found in Firestore, returning static banners.");
            return getStaticBanners();
        }

        const banners = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Banner[];
        
        return banners;

    } catch (error) {
        console.error("Error fetching banners from Firestore, falling back to static data:", error);
        return getStaticBanners();
    }
}

export async function getSiteSettings(): Promise<SiteSettings> {
    const { firestore } = initializeFirebase();
    const defaultSettings: SiteSettings = {
        logoUrl: "https://picsum.photos/seed/dakarboutik-logo/100/100",
        announcementMessage: 'Livraison gratuite à partir de 50 000 F CFA !',
        whatsappNumber: '221771234567', // Default placeholder
    };

    try {
        const settingsRef = doc(firestore, 'settings', 'siteConfig');
        const docSnap = await getDoc(settingsRef);

        if (docSnap.exists()) {
            return { ...defaultSettings, ...docSnap.data() } as SiteSettings;
        }
        return defaultSettings;
    } catch (error) {
        console.error("Error fetching site settings, falling back to defaults:", error);
        return defaultSettings;
    }
}
