
'use server';

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { initializeFirebase } from '@/firebase/server'; // Using server instance
import type { Banner, Product, SiteSettings } from './types';

// Slugify function
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
  const { firestore } = initializeFirebase();
  if (!firestore) {
    throw new Error('Firestore is not initialized.');
  }

  try {
    const settingsRef = doc(firestore, 'settings', 'siteConfig');
    // Ensure all possible fields from the form are included
    const settingsToUpdate: Partial<SiteSettings> = {
        logoUrl: settings.logoUrl,
        announcementMessage: settings.announcementMessage,
        whatsappNumber: settings.whatsappNumber,
    };
    await setDoc(settingsRef, settingsToUpdate, { merge: true });

    // Revalidate all paths to reflect the new logo
    revalidatePath('/', 'layout');
  } catch (e) {
    console.error('Error updating settings: ', e);
    throw new Error('Failed to update site settings.');
  }
}
