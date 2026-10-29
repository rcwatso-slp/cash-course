// "Read the receipt" problems: find things on a receipt, and check a receipt for mistakes.
import { RESTAURANTS } from '../data/restaurants';
import { STORES } from '../data/stores';
import { calcTax, formatMoney, sum, type Cents } from './money';
import { levelPrice, twentyOrMore, type PriceLevel } from './problems';
import { chance, pick, randInt, shuffle } from './random';

export interface Bought {
  name: string;
  emoji: string;
  qty: number;
  price: Cents;
}

export interface ReceiptData {
  place: string;
  /** What he actually bought (shown as his bag) */
  bought: Bought[];
  /** What the receipt prints (may include a mistake) */
  lines: { name: string; qty: number; price: Cents }[];
  subtotal: Cents;
  tax: Cents;
  total: Cents;
  cash: Cents;
  change: Cents;
}

export type ReceiptAsk =
  | { kind: 'itemPrice'; item: Bought; answer: Cents }
  | { kind: 'tax'; answer: Cents }
  | { kind: 'total'; answer: Cents }
  | { kind: 'change'; answer: Cents }
  | { kind: 'count'; answer: number }
  | { kind: 'check'; correct: boolean; problem: string };

export interface ReceiptProblem {
  receipt: ReceiptData;
  ask: ReceiptAsk;
}

const PLACES = [
  ...RESTAURANTS.filter((r) => !r.tableService).map((r) => ({
    name: r.name,
    items: r.menu.filter((x) => x.price).map((x) => ({ name: x.name, emoji: x.emoji, price: x.price! })),
  })),
  ...STORES.map((st) => ({ name: st.name, items: st.products.map((p) => ({ name: p.name, emoji: p.emoji, price: p.price })) })),
];

const KINDS: Record<PriceLevel, ReceiptAsk['kind'][]> = {
  1: ['itemPrice', 'total', 'count'],
  2: ['itemPrice', 'total', 'count', 'tax', 'change'],
  3: ['tax', 'change', 'count', 'check', 'check'],
  4: ['change', 'check', 'check', 'check'],
};

export function makeReceiptProblem(level: PriceLevel, taxRate: number): ReceiptProblem {
  const place = pick(PLACES.filter((pl) => pl.items.length >= 5));
  const bought: Bought[] = shuffle(place.items)
    .slice(0, randInt(3, 5))
    .map((it) => ({ ...it, price: levelPrice(it.price, level <= 1 ? 1 : 3), qty: level >= 3 && chance(0.25) ? 2 : 1 }));
  const kind = pick(KINDS[level]);

  let lines = bought.map((b) => ({ name: b.name, qty: b.qty, price: b.price }));
  let problem = '';
  let mistake: 'none' | 'double' | 'subtotal' | 'change' = 'none';
  if (kind === 'check' && chance(0.5)) mistake = pick(['double', 'subtotal', 'change'] as const);

  if (mistake === 'double') {
    const singles = lines.filter((l) => l.qty === 1);
    const dup = pick(singles.length ? singles : lines);
    lines = [...lines, { ...dup }];
    problem =
      dup.qty === 1
        ? `${dup.name} is on the receipt twice, but you only bought one. You were charged ${formatMoney(dup.price)} too much.`
        : `${dup.name} is on the receipt twice. You bought ${dup.qty}, but you were charged for ${dup.qty * 2}. That's ${formatMoney(dup.price * dup.qty)} too much.`;
  }
  const realSubtotal = sum(lines.map((l) => l.price * l.qty));
  let subtotal = realSubtotal;
  if (mistake === 'subtotal') {
    const off = pick([100, 10, 1000]);
    subtotal = realSubtotal + off;
    problem = `The items add up to ${formatMoney(realSubtotal)}, but the receipt says the subtotal is ${formatMoney(subtotal)}. That's ${formatMoney(off)} too much.`;
  }
  const tax = calcTax(subtotal, taxRate);
  const total = subtotal + tax;
  const cash = twentyOrMore(total + 1);
  let change = cash - total;
  if (mistake === 'change') {
    const off = pick([100, 10, 25]);
    change = change - off;
    problem = `You paid ${formatMoney(cash)} for ${formatMoney(total)}, so your change should be ${formatMoney(cash - total)}. The receipt says ${formatMoney(change)}. You got ${formatMoney(off)} too little.`;
  }

  const receipt: ReceiptData = { place: place.name, bought, lines, subtotal, tax, total, cash, change };
  const ask: ReceiptAsk =
    kind === 'itemPrice'
      ? (() => {
          const item = pick(bought);
          return { kind, item, answer: item.price };
        })()
      : kind === 'tax'
        ? { kind, answer: tax }
        : kind === 'total'
          ? { kind, answer: total }
          : kind === 'change'
            ? { kind, answer: change }
            : kind === 'count'
              ? { kind, answer: sum(bought.map((b) => b.qty)) }
              : { kind: 'check', correct: mistake === 'none', problem: problem || 'Everything matches. Every item is something you bought, the items add up to the subtotal, and the change is right.' };
  return { receipt, ask };
}
