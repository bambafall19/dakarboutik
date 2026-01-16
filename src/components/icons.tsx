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
      d="M12.06 10.84c-.2.2-.48.3-1.03.03-.54-.28-.9-.63-1.25-.97-.36-.35-.68-.78-.68-1.4 0-.48.25-.9.48-1.13.23-.24.52-.37.82-.37.29 0 .56.12.76.31.21.2.33.47.36.75h.02c.03.28.01.56-.04.82-.05.27-.15.52-.3.74 0 .01 0 .01 0 0zm-2.11 5.99c.31.18.64.27 1 .27.21 0 .42-.03.63-.09.2-.06.4-.15.58-.27l.01-.01c.21-.13.4-.3.55-.5.15-.2.28-.43.38-.68.1-.25.15-.52.15-.8h-.01c-.02-.32-.1-.63-.24-.92-.14-.28-.35-.54-.6-.75-.25-.2-.55-.35-.87-.42-.32-.07-.65-.06-.97.02-.32.08-.63.24-.89.47-.26.23-.46.53-.59.86-.12.33-.17.68-.14 1.03.03.35.14.69.32.99.18.3.43.56.73.76zM12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm7.3 18.44c-.28.43-.63.8-1.04 1.1-.4.3-1.83 1.02-3.34 1.02h-.03c-.27 0-1.42-.1-3.1-.73-1.68-.63-3.1-1.5-4.24-2.65-1.14-1.14-2.02-2.56-2.64-4.23-.64-1.68-.74-2.83-.74-3.1 0-1.23.4-2.93 1.4-3.6.4-.28.87-.43 1.35-.43.43 0 .8.14 1.12.4.28.24.4.5.45.78.05.28.05.52.05.74v.02c-.02.43-.16.85-.4 1.23-.24.38-.56.68-.96.9-.22.12-.3.23-.3.4s.1.3.24.42c.15.12.3.23.42.33.18.15.38.3.6.48.22.17.43.34.65.5.34.25.65.48.95.7.25.17.48.33.7.46.12.07.24.13.36.18.2.08.32.12.44.12.2 0 .34-.05.47-.15.13-.1.25-.24.35-.4.1-.17.2-.35.28-.53.08-.18.15-.38.2-.58.05-.2.1-.4.18-.6.08-.2.2-.38.38-.52.18-.14.4-.23.64-.23h.02c.2 0 .4.04.57.12.18.08.33.2.46.35.12.15.23.32.3.5.1.18.15.38.18.58.03.2.03.4 0 .6-.04.2-.08.38-.15.55-.07.17-.16.33-.27.48z"
      fill="currentColor"
    />
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
