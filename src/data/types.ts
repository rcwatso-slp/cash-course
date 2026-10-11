import type { Cents } from '../lib/money';

// ---------- Restaurants ----------

export interface Size {
  label: string;
  price: Cents;
}

export interface Choice {
  label: string;
  /** Extra cost. 0 = included. */
  price: Cents;
}

export interface OptionGroup {
  label: string;
  pick: 'one' | 'many';
  choices: Choice[];
}

export interface MenuItem {
  id: string;
  name: string;
  emoji: string;
  category: string;
  /** Single-price items */
  price?: Cents;
  /** Items that come in sizes (or proteins, or crusts): the choice sets the base price. */
  sizes?: Size[];
  /** What the size picker asks, e.g. "Pick a size" or "Pick a protein". */
  sizePrompt?: string;
  /** Build-your-own choices (toppings, add-ins). */
  options?: OptionGroup[];
  note?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  colors: {
    brand: string; // header background
    logo: string; // logo text color
    accent: string; // selected category, prices
    accentText: string;
  };
  footer: string;
  /** Short description for the home screen */
  blurb: string;
  categories: { id: string; label: string }[];
  menu: MenuItem[];
}

// ---------- Online stores ----------

export interface Product {
  id: string;
  name: string;
  brand: string;
  emoji: string;
  price: Cents;
  /** Shown crossed out when the item is on sale */
  wasPrice?: Cents;
  category: string;
  /** Used for shopping-list tasks, e.g. "toothpaste" */
  tags: string[];
  rating: number; // 1–5, halves allowed
  reviews: number;
  about: string[];
  pieces?: number;
  ages?: string;
}

export interface DeliveryOption {
  id: string;
  label: string;
  detail: string;
  price: Cents;
  /** Free when the subtotal is at least this much */
  freeOver?: Cents;
  days: number;
}

/** Something that can go on a shopping list */
export interface ListItem {
  tag: string;
  /** "toothpaste", "a phone charger" */
  label: string;
  /** Allow "the cheapest ..." version of this task */
  cheapest?: string;
}

export interface Store {
  id: string;
  name: string;
  tagline: string;
  skin: 'falmart' | 'amazoom' | 'leggo';
  logo: string;
  blurb: string;
  searchPlaceholder: string;
  addButton: string;
  cartName: string;
  categories: { id: string; label: string }[];
  products: Product[];
  delivery: DeliveryOption[];
  listItems: ListItem[];
  footer: string;
}
