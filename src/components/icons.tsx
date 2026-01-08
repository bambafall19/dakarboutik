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
} from 'lucide-react';

export const Icons = {
  smartphone: Smartphone,
  headphones: Headphones,
  laptop: Laptop,
  plug: Plug,
  speaker: Speaker,
  logo: ShoppingBag,
  search: Search,
  menu: Menu,
  close: X,
  trash: Trash2,
  plus: Plus,
  minus: Minus,
  chevronRight: ChevronRight,
  arrowRight: ArrowRight
};

export const CategoryIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  smartphones: Smartphone,
  accessoires: Plug,
  audio: Headphones,
  'pc-portables': Laptop,
};
