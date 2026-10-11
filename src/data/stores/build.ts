import type { Product } from '../types';
import type { Toy } from './toys';

export const product = (
  id: string, name: string, brand: string, emoji: string, price: number, category: string, tags: string[],
  rating: number, reviews: number, about: string[], wasPrice?: number,
): Product => ({ id, name, brand, emoji, price, category, tags, rating, reviews, about, ...(wasPrice ? { wasPrice } : {}) });

/** Give a toy a price in a store. sale = new price (wasPrice shows the old one). */
export function stock(toy: Toy, category: string, sale?: number): Product {
  const { msrp, ...rest } = toy;
  return sale && sale < msrp ? { ...rest, category, price: sale, wasPrice: msrp } : { ...rest, category, price: msrp };
}
