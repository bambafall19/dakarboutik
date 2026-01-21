import {
  Smartphone,
  Headphones,
  Laptop,
  Plug,
  Speaker,
  ShoppingBag,
  Search,
  Menu,
  X,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  ArrowRight,
  Heart,
  ChevronDown,
  HardDrive,
  MemoryStick,
  Tablet,
  Filter,
  PlusCircle,
  User,
  Zap,
  Cable,
  Power,
  BatteryCharging,
  Component,
  Monitor,
  Printer,
  Home,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';

// Custom WhatsApp icon
const WhatsApp = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M19.11 4.93A9.87 9.87 0 0 0 12.01 2a9.87 9.87 0 0 0-7.1 2.93A9.87 9.87 0 0 0 2 12a9.87 9.87 0 0 0 2.93 7.1A9.87 9.87 0 0 0 12.01 22h.02c1.76 0 3.48-.46 5-1.3l3.65.96-1-3.56a9.87 9.87 0 0 0 1.44-5A9.87 9.87 0 0 0 19.11 4.93zM12.01 20.15c-1.63 0-3.2-.4-4.59-1.15l-.33-.2-3.4 1 1-3.3-.23-.36A8.13 8.13 0 0 1 3.73 12a8.13 8.13 0 0 1 8.28-8.13A8.13 8.13 0 0 1 20.27 12a8.13 8.13 0 0 1-8.26 8.15zM9.47 7.76c-.19-.34-.38-.34-.56-.35s-.37-.02-.56-.02a.85.85 0 0 0-.6.28c-.23.23-.87.84-.87 2.05s.89 2.37 1 2.53c.12.16 1.17.65 2.12 1.95.95 1.3 1.83.5 2.15.48.32-.02.94-.38 1.07-.75.14-.37.14-.69.1-.75s-.2-.11-.42-.2c-.22-.1-1.28-.63-1.48-.7-.2-.08-.34-.11-.48.11s-.56.7-.68.84c-.13.14-.25.16-.47.05-.22-.1-.94-.34-1.8-1.1s-1.4-1.28-1.56-1.5c-.17-.22-.05-.34.1-.45.13-.11.28-.28.43-.42.15-.14.2-.23.3-.38.1-.15.05-.28-.02-.4z"
      fill="currentColor"
    />
  </svg>
);

const TikTok = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props} fill="currentColor">
        <title>TikTok</title>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.84-.95-6.6-2.8-1.75-1.85-2.64-4.2-2.58-6.6.04-1.49.36-2.95 1.02-4.28.91-1.87 2.45-3.35 4.29-4.32 1.84-.97 3.9-1.33 5.9-1.02.02 1.48.01 2.96.01 4.44-.69-.02-1.37-.02-2.06-.01-1.3 0-2.59.38-3.69 1.15-1.14.79-1.99 1.93-2.43 3.25-.18.52-.29 1.07-.31 1.64-.03 1.04.14 2.11.53 3.09.39.98 1.01 1.85 1.81 2.53.8.68 1.77 1.15 2.8 1.37.97.2 1.97.22 2.96.04 1.45-.27 2.82-.89 3.9-1.73.99-.76 1.78-1.76 2.34-2.88.24-.47.42-.97.54-1.49.03-.18.03-.36.03-.54-.01-2.91-.01-5.83-.01-8.74a.13.13 0 0 0-.01-.06c-.23.11-.47.21-.7.31-.2.08-.4.17-.59.25-.56.24-1.13.44-1.71.6-.28.08-.56.14-.84.21-1.4.34-2.82.59-4.27.7-.01-1.48-.01-2.96 0-4.44z" />
    </svg>
);


const SofaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/>
    <path d="M4 11v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v-1a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1a2 2 0 0 0-4 0Z"/>
    <path d="M2 11h20"/>
  </svg>
);

const BedIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 4v16"/>
    <path d="M2 10h20"/>
    <path d="M2 16h20"/>
    <path d="M12 4v16"/>
    <path d="M22 4v16"/>
    <path d="M7 7h10v6H7z"/>
  </svg>
);

const LampIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8 2h8l4 10H4L8 2Z"/>
    <path d="M12 12v8"/>
    <path d="M8 22h8"/>
  </svg>
);

const DeskIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 6h20" />
      <path d="M4 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6" />
      <path d="M12 12v8" />
  </svg>
);


export const Icons = {
  smartphone: Smartphone,
  headphones: Headphones,
  laptop: Laptop,
  plug: Plug,
  speaker: Speaker,
  shoppingBag: ShoppingBag,
  search: Search,
  menu: Menu,
  close: X,
  trash: Trash2,
  plus: Plus,
  plusCircle: PlusCircle,
  minus: Minus,
  chevronRight: ChevronRight,
  arrowRight: ArrowRight,
  heart: Heart,
  chevronDown: ChevronDown,
  filter: Filter,
  user: User,
  flash: Zap,
  whatsapp: WhatsApp,
  tiktok: TikTok,
  home: Home,
  layoutGrid: LayoutGrid,
  sparkles: Sparkles,
};

export const CategoryIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  // Main categories for DakarBoutik
  'informatique': Laptop,
  'telephonie': Smartphone,
  'accessoires': Cable,
  'audio': Headphones,
  
  // Aliases and sub-categories
  'pc-portables': Laptop,
  'smartphones': Smartphone,
  'chargeurs': BatteryCharging,
  'power-banks': Power,
  'ecouteurs': Headphones,
  'disques-durs': HardDrive,
  'cle-usb': MemoryStick,
  'imprimantes': Printer,
  'tablettes': Tablet,
  'composants-electroniques': Component,
  'electronique-grand-public': Monitor,
};
