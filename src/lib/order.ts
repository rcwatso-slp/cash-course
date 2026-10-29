// Restaurant orders: what's in the cart, how build-your-own items are named and priced,
// and order-card tasks.
import type { MenuItem, Size } from '../data/types';
import type { Cents } from './money';
import { levelPrice, type PriceLevel } from './problems';
import { chance, pick, randInt, shuffle } from './random';

export interface Extra {
  label: string;
  price: Cents;
}

export interface Line {
  key: string;
  name: string;
  emoji: string;
  /** Base price for one, after the size choice */
  price: Cents;
  qty: number;
  /** Paid add-ons for one (guac, toppings, oat milk) */
  extras: Extra[];
  /** Free choices, for display (white rice, mild salsa) */
  details: string[];
  /** Price for one at the restaurant itself, when the line was priced by a delivery app */
  regularEach?: Cents;
}

/** Group label -> chosen choice labels */
export type Chosen = Record<string, string[]>;

const shortSize = (label: string) => label.replace(/\s*\(.*\)$/, '');

/** Default picks: first choice of each pick-one group, nothing for pick-many. */
export function defaultChosen(item: MenuItem): Chosen {
  const chosen: Chosen = {};
  for (const g of item.options ?? []) chosen[g.label] = g.pick === 'one' ? [g.choices[0].label] : [];
  return chosen;
}

/**
 * Turn a menu item plus choices into a cart line (qty 1).
 * The key only includes things that change the price, so free choices (rice, salsa) never
 * stop an order from matching its order card.
 */
export function buildLine(
  item: MenuItem,
  size: Size | undefined,
  chosen: Chosen,
  level: PriceLevel,
  /** Delivery apps mark prices up */
  adjust?: (c: Cents) => Cents,
): Line {
  const priced = (c: Cents) => levelPrice(adjust ? adjust(c) : c, level);
  const extras: Extra[] = [];
  const details: string[] = [];
  let regularExtras = 0;
  for (const g of item.options ?? []) {
    for (const label of chosen[g.label] ?? []) {
      const choice = g.choices.find((c) => c.label === label);
      if (!choice) continue;
      if (choice.price > 0) {
        extras.push({ label: choice.label, price: priced(choice.price) });
        regularExtras += levelPrice(choice.price, level);
      } else details.push(choice.label);
    }
  }
  const base = size ? size.price : (item.price ?? 0);
  return {
    ...(adjust ? { regularEach: levelPrice(base, level) + regularExtras } : {}),
    key: [item.id, size?.label ?? '', ...extras.map((e) => e.label).sort()].join('|'),
    name: size ? `${shortSize(size.label)} ${item.name}` : item.name,
    emoji: item.emoji,
    price: priced(base),
    qty: 1,
    extras,
    details,
  };
}

export const lineEach = (l: Line): Cents => l.price + l.extras.reduce((t, e) => t + e.price, 0);

/** Every price that gets added up, one entry per thing (qty 2 = listed twice). */
export function orderUnits(lines: Line[]): { name: string; cents: Cents }[] {
  return lines.flatMap((l) =>
    Array.from({ length: l.qty }, () => [
      { name: l.name, cents: l.price },
      ...l.extras.map((e) => ({ name: e.label, cents: e.price })),
    ]).flat(),
  );
}

export function addLine(lines: Line[], line: Line): Line[] {
  return lines.some((l) => l.key === line.key)
    ? lines.map((l) => (l.key === line.key ? { ...l, qty: l.qty + 1 } : l))
    : [...lines, line];
}

export function removeOne(lines: Line[], key: string): Line[] {
  return lines.flatMap((l) => (l.key !== key ? [l] : l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : []));
}

export interface TaskLine {
  key: string;
  label: string;
  emoji: string;
}

const TASK_SIZES: Record<PriceLevel, [number, number]> = { 1: [2, 2], 2: [2, 3], 3: [3, 4], 4: [4, 6] };

/** An order card: a few different items, sometimes with one paid add-on at higher levels. */
export function makeTask(menu: MenuItem[], level: PriceLevel): TaskLine[] {
  const [min, max] = TASK_SIZES[level];
  return shuffle(menu)
    .slice(0, randInt(min, max))
    .map((item) => {
      const size = item.sizes ? pick(item.sizes) : undefined;
      const chosen = defaultChosen(item);
      const paid = (item.options ?? []).flatMap((g) => g.choices.filter((c) => c.price > 0).map((c) => ({ group: g, choice: c })));
      if (level >= 2 && paid.length > 0 && chance(0.6)) {
        const { group, choice } = pick(paid);
        chosen[group.label] = [choice.label];
      }
      const line = buildLine(item, size, chosen, level);
      const label = line.extras.length ? `${line.name} with ${line.extras.map((e) => e.label).join(' and ')}` : line.name;
      return { key: line.key, label, emoji: item.emoji };
    });
}

export function matchesTask(lines: Line[], task: TaskLine[]): boolean {
  return lines.length === task.length && task.every((t) => lines.some((l) => l.key === t.key && l.qty === 1));
}
