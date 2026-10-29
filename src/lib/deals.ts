// "Which is the better deal?" problems: brands, $ off, buy-one-get-one, "3 for $10", % off.
import { calcTax, formatMoney, type Cents } from './money';
import type { PriceLevel } from './problems';
import { chance, pick, randInt, shuffle } from './random';

export interface DealOption {
  store: string;
  /** What the sign says: "$6.98 each", "2 for $5.00", "$40.00 · 25% off" */
  sign: string;
  /** A loud SALE badge (sometimes on the worse deal, on purpose) */
  saleBadge?: string;
  cost: Cents;
  /** The math with the answer hidden, for the "More help" level */
  workQ: string;
  /** The math worked out */
  workA: string;
}

export type DealKind = 'brands' | 'dollarsOff' | 'bogo' | 'multi' | 'trap' | 'percentOff';

export interface DealProblem {
  kind: DealKind;
  item: { name: string; emoji: string };
  need: number;
  options: [DealOption, DealOption];
  better: 0 | 1;
  save: Cents;
}

const ITEMS = [
  { name: 'Gatorpaid 8 pack', emoji: '🧃', base: 698 },
  { name: 'Koala-Cola 12 pack', emoji: '🥤', base: 749 },
  { name: 'Dorkitos Party Size', emoji: '🧀', base: 598 },
  { name: 'AA batteries, 8 pack', emoji: '🔋', base: 897 },
  { name: 'HotHandz hand warmers', emoji: '🔥', base: 1299 },
  { name: 'Crew socks, 6 pairs', emoji: '🧦', base: 1196 },
  { name: 'LEGGO Trooper Battle Pack', emoji: '🪖', base: 1999 },
  { name: 'Star Warz T-shirt', emoji: '👕', base: 1999 },
  { name: 'Deer corn, 40 lb', emoji: '🌽', base: 1199 },
  { name: 'DiGiorgio frozen pizza', emoji: '🍕', base: 698 },
  { name: 'Jack Lynx beef jerky', emoji: '🥩', base: 599 },
  { name: 'Nature Valet granola bars', emoji: '🥜', base: 448 },
  { name: 'Blaze orange hunting cap', emoji: '🧢', base: 999 },
  { name: 'Plumber Kart Deluxe', emoji: '🏁', base: 5999 },
];

const STORES = ['Fal-Mart', 'Amazoom', 'Tar-Jay'];

const KINDS: Record<PriceLevel, DealKind[]> = {
  1: ['brands'],
  2: ['brands', 'dollarsOff', 'bogo'],
  3: ['dollarsOff', 'bogo', 'multi', 'trap'],
  4: ['percentOff', 'multi', 'trap', 'bogo'],
};

const m = formatMoney;
const nines = (c: Cents) => Math.max(99, Math.round(c / 100) * 100 - 1); // $6.98 -> $6.99
const adds = (each: Cents, n: number) => Array(n).fill(m(each)).join(' + ');

export function makeDealProblem(level: PriceLevel): DealProblem {
  for (;;) {
    const p = tryMake(pick(KINDS[level]), level);
    // No ties, and a difference big enough to matter.
    if (Math.abs(p.options[0].cost - p.options[1].cost) >= 10) return p;
  }
}

function finish(kind: DealKind, item: (typeof ITEMS)[number], need: number, a: DealOption, b: DealOption, keepOrder = false): DealProblem {
  const opts: [DealOption, DealOption] = keepOrder || chance(0.5) ? [a, b] : [b, a];
  const better = opts[0].cost < opts[1].cost ? 0 : 1;
  return { kind, item: { name: item.name, emoji: item.emoji }, need, options: opts, better, save: Math.abs(opts[0].cost - opts[1].cost) };
}

function tryMake(kind: DealKind, level: PriceLevel): DealProblem {
  const item = pick(ITEMS);
  const [s1, s2] = shuffle(STORES);

  switch (kind) {
    case 'brands': {
      const whole = level === 1;
      const pa = whole ? Math.round(item.base / 100) * 100 : item.base;
      const diff = whole ? randInt(1, 4) * 100 : randInt(20, 250);
      const pb = Math.max(100, chance(0.5) ? pa + diff : pa - diff);
      const opt = (store: string, c: Cents): DealOption => ({ store, sign: `${m(c)}`, cost: c, workQ: `${store}: ${m(c)}`, workA: `${store}: ${m(c)}` });
      return finish(kind, item, 1, opt(s1, pa), opt(s2, pb));
    }
    case 'dollarsOff': {
      const price = nines(item.base + randInt(100, 400));
      const off = pick([100, 200, 300, 500].filter((d) => d < price / 2));
      const cost = price - off;
      const other = Math.max(100, cost + pick([-1, 1]) * randInt(25, 150));
      return finish(
        kind, item, 1,
        { store: s1, sign: `${m(price)}`, saleBadge: `${m(off)} OFF`, cost, workQ: `${m(price)} − ${m(off)} = ?`, workA: `${m(price)} − ${m(off)} = ${m(cost)}` },
        { store: s2, sign: `${m(other)}`, cost: other, workQ: `${m(other)}`, workA: `${m(other)}` },
      );
    }
    case 'bogo': {
      const price = nines(item.base);
      // Each at the other store: a bit more or less than half.
      const each = Math.max(99, Math.round(price / 2) + pick([-1, 1]) * randInt(20, 120));
      return finish(
        kind, item, 2,
        { store: s1, sign: `${m(price)} each`, saleBadge: 'BUY 1, GET 1 FREE', cost: price, workQ: `You pay for 1, get 1 free: ${m(price)}`, workA: `You pay for 1, get 1 free: ${m(price)}` },
        { store: s2, sign: `${m(each)} each`, cost: each * 2, workQ: `${adds(each, 2)} = ?`, workA: `${adds(each, 2)} = ${m(each * 2)}` },
      );
    }
    case 'multi':
    case 'trap': {
      const n = pick([2, 3]);
      const bundle = Math.round((item.base * n) / 100) * 100; // whole dollars, like "3 for $10"
      // Trap: the "sale" bundle costs more than buying them one at a time.
      const each =
        kind === 'trap'
          ? Math.floor(bundle / n) - randInt(5, 40)
          : Math.max(99, Math.round(bundle / n) + pick([-1, 1]) * randInt(15, 80));
      return finish(
        kind, item, n,
        { store: s1, sign: `${n} for ${m(bundle)}`, saleBadge: kind === 'trap' ? 'SALE!' : undefined, cost: bundle, workQ: `${n} for ${m(bundle)}`, workA: `${n} for ${m(bundle)}` },
        { store: s2, sign: `${m(each)} each`, cost: each * n, workQ: `${adds(each, n)} = ?`, workA: `${adds(each, n)} = ${m(each * n)}` },
      );
    }
    case 'percentOff': {
      const price = pick([2000, 3000, 4000, 5000, 6000, 8000]);
      const pct = pick([10, 20, 25, 50]);
      const off = calcTax(price, pct);
      const cost = price - off;
      const other = cost + pick([-1, 1]) * randInt(2, 8) * 50;
      return finish(
        kind, item, 1,
        {
          store: s1, sign: `${m(price)}`, saleBadge: `${pct}% OFF`, cost,
          workQ: `${pct}% of ${m(price)} = ?   Then ${m(price)} − that = ?`,
          workA: `${pct}% of ${m(price)} = ${m(off)}. ${m(price)} − ${m(off)} = ${m(cost)}`,
        },
        { store: s2, sign: `${m(other)}`, cost: other, workQ: `${m(other)}`, workA: `${m(other)}` },
      );
    }
  }
}
