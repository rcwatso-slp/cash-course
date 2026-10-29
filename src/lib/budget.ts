// Budgets, tips and "Can I afford it?" problems.
import { RESTAURANTS } from '../data/restaurants';
import { STORES } from '../data/stores';
import { calcTax, type Cents } from './money';
import { levelPrice, type PriceLevel } from './problems';
import { chance, pick, randInt } from './random';

/** The clinician's budget setting: a fixed amount, or -1 for a random $10–$30 each order. */
export function pickBudget(setting: Cents): Cents {
  if (setting > 0) return setting;
  if (setting < 0) return pick([1000, 1200, 1500, 2000, 2500, 3000]);
  return 0;
}

/** Tip on the food total (before tax), rounded to the cent. Same rounding as tax. */
export const calcTip = (subtotal: Cents, pct: number): Cents => calcTax(subtotal, pct);

export const TIP_CHOICES = [15, 18, 20];

export interface ThingToBuy {
  name: string;
  emoji: string;
  price: Cents;
}

/** Everything with a single price, from every restaurant and store. */
export const BUYABLE: ThingToBuy[] = [
  ...RESTAURANTS.flatMap((r) => r.menu.filter((m) => m.price).map((m) => ({ name: `${m.name} at ${r.name}`, emoji: m.emoji, price: m.price! }))),
  ...STORES.flatMap((st) => st.products.map((p) => ({ name: `${p.name} from ${st.name}`, emoji: p.emoji, price: p.price }))),
];

export interface AffordProblem {
  have: Cents;
  items: ThingToBuy[];
  cost: Cents;
  canBuy: boolean;
}

/**
 * L1: whole dollars, clearly more or less.  L2: whole-dollar budget, prices with cents, closer.
 * L3: budgets with cents ($12.50), within a dollar.  L4: two things at once.
 */
export function makeAffordProblem(level: PriceLevel, pool: ThingToBuy[] = BUYABLE): AffordProblem {
  if (level === 4) {
    const a = pick(pool.filter((t) => t.price >= 300 && t.price <= 3000));
    const b = pick(pool.filter((t) => t.price >= 200 && t.price <= 2000 && t !== a));
    const cost = a.price + b.price;
    const have = Math.max(500, Math.round((cost + randInt(-200, 200)) / 100) * 100);
    return { have, items: [a, b], cost, canBuy: cost <= have };
  }

  const wholeDollars = level === 1;
  const candidates = pool.filter((t) => t.price >= 150 && t.price <= 6000);
  const item = pick(candidates);
  const price = wholeDollars ? levelPrice(item.price, 1) : item.price;
  let have: Cents;
  if (level === 1) {
    const gap = randInt(2, 6) * 100;
    have = Math.max(100, chance(0.5) ? price + gap : price - gap);
  } else if (level === 2) {
    have = Math.max(100, Math.round((price + randInt(-250, 250)) / 100) * 100);
  } else {
    have = Math.max(100, Math.round((price + randInt(-100, 100)) / 25) * 25);
  }
  // Now and then, exactly enough.
  if (chance(0.08)) have = price;
  return { have, items: [{ ...item, price }], cost: price, canBuy: price <= have };
}

// ---------- Delivery (DoorDosh) ----------

/** Delivery apps charge about 20% more than the restaurant. $5.99 -> $7.19. */
export const deliveryPrice = (c: Cents): Cents => Math.max(99, Math.round((c * 1.2) / 10) * 10 - 1);

export const DELIVERY_FEE: Cents = 299;
export const SERVICE_FEE_PCT = 15;
export const SMALL_ORDER_FEE: Cents = 299;
export const SMALL_ORDER_UNDER: Cents = 1200;
export const DASHER_TIPS: Cents[] = [200, 300, 500];

export interface DeliveryCosts {
  deliveryFee: Cents;
  serviceFee: Cents;
  smallOrderFee: Cents;
}

export function deliveryFees(subtotal: Cents): DeliveryCosts {
  return {
    deliveryFee: DELIVERY_FEE,
    serviceFee: calcTax(subtotal, SERVICE_FEE_PCT),
    smallOrderFee: subtotal < SMALL_ORDER_UNDER ? SMALL_ORDER_FEE : 0,
  };
}
