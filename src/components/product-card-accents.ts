export type ProductCardAccent = 'primary' | 'gold' | 'sale';

export interface ProductCardAccentTheme {
  topBar: string;
  hover: string;
  chip: string;
  action: string;
  solid: string;
}

export const productCardAccents: Record<ProductCardAccent, ProductCardAccentTheme> = {
  primary: {
    topBar: 'from-primary via-primary/40 to-transparent',
    hover: 'hover:border-primary/30 hover:shadow-[0_30px_60px_-30px_rgba(11,110,79,0.45)]',
    chip: 'bg-primary/10 text-primary ring-primary/15',
    action: 'bg-primary text-primary-foreground hover:bg-primary/90',
    solid: 'bg-primary text-primary-foreground',
  },
  gold: {
    topBar: 'from-accent via-accent/45 to-transparent',
    hover: 'hover:border-accent/50 hover:shadow-[0_30px_60px_-30px_rgba(212,162,76,0.5)]',
    chip: 'bg-accent/15 text-accent-foreground ring-accent/30',
    action: 'bg-accent text-accent-foreground hover:bg-accent/90',
    solid: 'bg-accent text-accent-foreground',
  },
  sale: {
    topBar: 'from-destructive via-destructive/40 to-transparent',
    hover: 'hover:border-destructive/30 hover:shadow-[0_30px_60px_-30px_rgba(190,40,40,0.4)]',
    chip: 'bg-destructive/10 text-destructive ring-destructive/15',
    action: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    solid: 'bg-destructive text-destructive-foreground',
  },
};
