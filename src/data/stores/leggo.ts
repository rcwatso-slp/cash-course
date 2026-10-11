import type { Store } from '../types';
import { stock } from './build';
import { LEGGO_SETS, STARWARZ_MERCH } from './toys';

const isStarWarz = (tags: string[]) => tags.includes('leggo-starwarz');

export const LEGGO_STORE: Store = {
  id: 'leggo',
  name: 'LEGGO Store',
  tagline: 'Build it. Step on it. Build it again.',
  skin: 'leggo',
  logo: '🧱',
  blurb: 'Every LEGGO set, including Star Warz. Free shipping on orders over $35.',
  searchPlaceholder: 'Search sets',
  addButton: 'Add to Bag',
  cartName: 'Bag',
  footer: 'Thanks for shopping at the LEGGO Store. Watch your feet.',
  categories: [
    { id: 'starwarz', label: 'Star Warz' },
    { id: 'more', label: 'City, Techno & Creater' },
    { id: 'extras', label: 'Star Warz Extras' },
  ],
  products: [
    ...LEGGO_SETS.map((t) => stock(t, isStarWarz(t.tags) ? 'starwarz' : 'more')),
    ...STARWARZ_MERCH.filter((t) => ['yodel-plush', 'sw-tee', 'sw-book'].includes(t.id)).map((t) => stock(t, 'extras')),
  ],
  delivery: [
    { id: 'standard', label: 'Standard Shipping (3–5 days)', detail: '$5.99, FREE on orders $35 and up', price: 599, freeOver: 3500, days: 4 },
    { id: 'pickup', label: 'Pick up at a LEGGO Store', detail: 'FREE', price: 0, days: 1 },
  ],
  listItems: [
    { tag: 'leggo-starwarz', label: 'a LEGGO Star Warz set', cheapest: 'the cheapest LEGGO Star Warz set' },
    { tag: 'leggo', label: 'a LEGGO set', cheapest: 'the cheapest LEGGO set' },
    { tag: 'starwarz', label: 'a Star Warz extra' },
  ],
};
