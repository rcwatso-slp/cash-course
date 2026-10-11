// Online stores: cart math, search, shipping, and shopping-list tasks.
import type { DeliveryOption, Product, Store } from '../data/types';
import type { Cents } from './money';
import { levelPrice, type PriceLevel } from './problems';
import { chance, randInt, shuffle } from './random';

export interface CartLine {
  productId: string;
  qty: number;
}

export const findProduct = (store: Store, id: string): Product => store.products.find((p) => p.id === id)!;

/** The price he sees, simplified for lower difficulty levels. */
export const shopPrice = (p: Product, level: PriceLevel): Cents => levelPrice(p.price, level);

export function cartCount(cart: CartLine[]): number {
  return cart.reduce((t, l) => t + l.qty, 0);
}

export function cartUnits(store: Store, cart: CartLine[], level: PriceLevel): { name: string; cents: Cents }[] {
  return cart.flatMap((l) => {
    const p = findProduct(store, l.productId);
    return Array.from({ length: l.qty }, () => ({ name: p.name, cents: shopPrice(p, level) }));
  });
}

export function setQty(cart: CartLine[], productId: string, qty: number): CartLine[] {
  if (qty <= 0) return cart.filter((l) => l.productId !== productId);
  return cart.some((l) => l.productId === productId)
    ? cart.map((l) => (l.productId === productId ? { ...l, qty } : l))
    : [...cart, { productId, qty }];
}

export function addToCart(cart: CartLine[], productId: string, qty: number): CartLine[] {
  const current = cart.find((l) => l.productId === productId)?.qty ?? 0;
  return setQty(cart, productId, Math.min(10, current + qty));
}

export function search(store: Store, query: string): Product[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return store.products;
  return store.products.filter((p) => {
    const haystack = [p.name, p.brand, ...p.tags, store.categories.find((c) => c.id === p.category)?.label ?? ''].join(' ').toLowerCase();
    // Forgiving: "charger" finds "chargers", "headphone" finds "headphones".
    return words.every((w) => haystack.includes(w.replace(/s$/, '')));
  });
}

export const shippingCost = (opt: DeliveryOption, subtotal: Cents): Cents =>
  opt.freeOver !== undefined && subtotal >= opt.freeOver ? 0 : opt.price;

export interface Need {
  tag: string;
  label: string;
  qty: number;
  cheapest: boolean;
}

const LIST_SIZES: Record<PriceLevel, [number, number]> = { 1: [2, 2], 2: [2, 3], 3: [3, 4], 4: [3, 5] };

/** A shopping list. Higher levels add "the cheapest ..." items and quantities of 2. */
export function makeShoppingList(store: Store, level: PriceLevel): Need[] {
  const [min, max] = LIST_SIZES[level];
  // Skip items one product could satisfy together (R2-D-Tooth is a toothbrush AND Star Warz).
  const overlaps = (a: string, b: string) => store.products.some((p) => p.tags.includes(a) && p.tags.includes(b));
  const size = randInt(min, max);
  const picked: typeof store.listItems = [];
  for (const item of shuffle(store.listItems)) {
    if (picked.length >= size) break;
    if (!picked.some((q) => overlaps(q.tag, item.tag))) picked.push(item);
  }
  return picked.map((item) => {
    const cheapest = level >= 2 && !!item.cheapest && chance(0.4);
    const qty = level >= 3 && !cheapest && !item.tag.startsWith('leggo') && chance(0.3) ? 2 : 1;
    return { tag: item.tag, label: cheapest ? item.cheapest! : item.label, qty, cheapest };
  });
}

export const needText = (n: Need) => (n.qty > 1 ? `${n.qty} × ${n.label}` : n.label);

/** How many of a need are in the cart (for ✓ marks). Doesn't reveal whether "cheapest" is right. */
export function haveCount(store: Store, cart: CartLine[], need: Need): number {
  return cart.filter((l) => findProduct(store, l.productId).tags.includes(need.tag)).reduce((t, l) => t + l.qty, 0);
}

export type ListCheck = { ok: true } | { ok: false; message: string };

export function checkList(store: Store, cart: CartLine[], needs: Need[], level: PriceLevel): ListCheck {
  for (const need of needs) {
    const have = haveCount(store, cart, need);
    if (have < need.qty) return { ok: false, message: `You still need ${needText(need)}.` };
    if (have > need.qty) return { ok: false, message: `Your list says ${needText(need)}, but your cart has ${have}.` };
    if (need.cheapest) {
      const matching = store.products.filter((p) => p.tags.includes(need.tag));
      const lowest = Math.min(...matching.map((p) => shopPrice(p, level)));
      const chosen = cart.map((l) => findProduct(store, l.productId)).find((p) => p.tags.includes(need.tag))!;
      if (shopPrice(chosen, level) !== lowest) {
        return { ok: false, message: `Is ${chosen.name} really ${need.label}? Compare the prices again.` };
      }
    }
  }
  const extra = cart.find((l) => !needs.some((n) => findProduct(store, l.productId).tags.includes(n.tag)));
  if (extra) return { ok: false, message: `${findProduct(store, extra.productId).name} isn't on your list.` };
  return { ok: true };
}

/** Gift card big enough for the order: the clinician's amount, or the next $25 up. */
export function giftCardFor(total: Cents, setting: Cents): Cents {
  return total <= setting ? setting : Math.ceil((total + 1) / 2500) * 2500;
}

export function arrivalDate(days: number, from = new Date()): string {
  if (days === 0) return 'today';
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
