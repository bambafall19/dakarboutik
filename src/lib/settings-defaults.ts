import type { SiteSettings } from './types';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'siteConfig',
  siteName: 'DakarBoutik',
  siteDescription: 'Votre boutique en ligne au Sénégal',
  email: 'contact@dakarboutik.com',
  phone: '221 77 638 46 76',
  address: 'Dakar, Sénégal',
  logoUrl: null,
  announcementMessage1:
    "Nouveaux Arrivages : Découvrez notre dernière collection d'ordinateurs portables.",
  announcementMessage2: '',
  announcementMessage3: '',
  whatsappNumber: '221776384676',
  supportPhone: '77 638 46 76',
  supportEmail: 'contact@exemple.com',
  deliveryInfo:
    'Livraison gratuite partout à Dakar, sauf les accessoires. Les frais de livraison varient selon le lieu. Détails à la commande.',
  returnPolicy:
    'Retours gratuits sous 7 jours si le produit présente un défaut matériel.',
  afterSalesService: '',
  allProductsBannerUrl: '',
  shippingCostDakar: 2000,
  shippingCostOutsideDakar: 5000,
  freeShippingThreshold: 0,
  facebookUrl: '',
  instagramUrl: '',
  tiktokUrl: '',
  maintenanceMode: false,
};

export function withDefaultSettings(data: Partial<SiteSettings> | null | undefined): SiteSettings {
  return { ...DEFAULT_SITE_SETTINGS, ...(data ?? {}) };
}
