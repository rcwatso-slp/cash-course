import { breakdown, formatMoney, nextDollar, sum, type Cents } from './money';
import { chance, pick, randInt } from './random';

export type PriceLevel = 1 | 2 | 3 | 4;
export type ChangeLevel = 1 | 2 | 3 | 4;

export const PRICE_LEVELS: Record<PriceLevel, { label: string; maxItems: number }> = {
  1: { label: 'Level 1: whole dollars, up to 2 items', maxItems: 2 },
  2: { label: 'Level 2: quarters ($3.50, $2.25), up to 3 items', maxItems: 3 },
  3: { label: 'Level 3: any cents, up to 4 items', maxItems: 4 },
  4: { label: 'Level 4: any cents, up to 6 items', maxItems: 6 },
};

export const CHANGE_LEVELS: Record<ChangeLevel, string> = {
  1: 'C1: whole-dollar price, pay with the next bill up ($7 with $10)',
  2: 'C2: whole-dollar price, pay with $20 ($13 with $20)',
  3: 'C3: cents price, pay with the next dollar up ($7.39 with $8)',
  4: 'C4: cents price, pay with $10 or $20 ($7.39 with $20)',
};

/** Simplify a real menu price to match the difficulty level. */
export function levelPrice(cents: Cents, level: PriceLevel): Cents {
  if (level === 1) return Math.max(100, Math.round(cents / 100) * 100);
  if (level === 2) return Math.max(25, Math.round(cents / 25) * 25);
  return cents;
}

const BILL_SIZES: Cents[] = [500, 1000, 2000, 5000, 10000];

/** Smallest single bill that covers the total. strict = the bill must be bigger (so there is change). */
export function nextBillUp(total: Cents, strict = false): Cents {
  for (const b of BILL_SIZES) if (strict ? b > total : b >= total) return b;
  return Math.ceil((total + (strict ? 1 : 0)) / 10000) * 10000;
}

/** "Pay with a $20" — or a $50/$100 if the order is more than $20. */
export function twentyOrMore(total: Cents): Cents {
  for (const b of [2000, 5000, 10000]) if (b >= total) return b;
  return Math.ceil(total / 10000) * 10000;
}

export interface ChangeProblem {
  price: Cents;
  paid: Cents;
}

function centsPrice(minDollars: number, maxDollars: number): Cents {
  return randInt(minDollars, maxDollars) * 100 + randInt(1, 99);
}

export function makeChangeProblem(level: ChangeLevel): ChangeProblem {
  switch (level) {
    case 1: {
      const price = randInt(1, 19) * 100;
      return { price, paid: nextBillUp(price, true) };
    }
    case 2:
      return { price: randInt(1, 19) * 100, paid: 2000 };
    case 3: {
      const price = centsPrice(1, 19);
      return { price, paid: nextDollar(price) };
    }
    case 4: {
      const price = centsPrice(1, 19);
      return { price, paid: price < 1000 && chance(0.5) ? 1000 : 2000 };
    }
  }
}

export type Wallet = Record<number, number>; // bill value in cents -> how many

export const walletTotal = (w: Wallet): Cents =>
  Object.entries(w).reduce((t, [bill, n]) => t + Number(bill) * n, 0);

/**
 * Make sure the wallet can pay the total. For next-dollar-up it also needs enough small
 * bills to make any whole-dollar amount (4 ones, a five and a ten cover every remainder under $20).
 */
export function ensureWallet(base: Wallet, total: Cents, needExactDollars: boolean): Wallet {
  const w: Wallet = { 100: base[100] ?? 0, 500: base[500] ?? 0, 1000: base[1000] ?? 0, 2000: base[2000] ?? 0 };
  if (needExactDollars) {
    w[100] = Math.max(w[100], 4);
    w[500] = Math.max(w[500], 1);
    w[1000] = Math.max(w[1000], 1);
    w[2000] = Math.max(w[2000], Math.floor(nextDollar(total) / 2000));
  }
  while (walletTotal(w) < total) w[2000] += 1;
  return w;
}

/** Bills from the wallet that add up to exactly `amount`, or null. Largest first. */
export function composeFromWallet(wallet: Wallet, amount: Cents): Cents[] | null {
  const out: Cents[] = [];
  let rest = amount;
  for (const bill of [2000, 1000, 500, 100]) {
    let n = wallet[bill] ?? 0;
    while (n > 0 && rest >= bill) {
      out.push(bill);
      rest -= bill;
      n--;
    }
  }
  return rest === 0 ? out : null;
}

/** A sensible way to pay: one bill that covers it, else the next dollar up, else everything. */
export function suggestPayment(wallet: Wallet, total: Cents): Cents[] {
  for (const bill of [100, 500, 1000, 2000]) {
    if ((wallet[bill] ?? 0) > 0 && bill >= total) return [bill];
  }
  const exact = composeFromWallet(wallet, nextDollar(total));
  if (exact) return exact;
  return Object.entries(wallet).flatMap(([bill, n]) => Array<number>(n).fill(Number(bill)));
}

export type PayCheck = { ok: true } | { ok: false; message: string };

export function checkPayment(paid: Cents[], total: Cents, mode: 'nextDollar' | 'choose'): PayCheck {
  const amount = sum(paid);
  if (amount < total) {
    return { ok: false, message: `That's ${formatMoney(amount)}. You need at least ${formatMoney(total)}.` };
  }
  if (mode === 'nextDollar') {
    if (amount === nextDollar(total)) return { ok: true };
    return { ok: false, message: 'That covers it, but try the next dollar up: just enough whole dollars.' };
  }
  // Don't hand over a bill you don't need.
  if (paid.some((bill) => amount - bill >= total)) {
    return { ok: false, message: "That covers it, but there's a bill you don't need. Try handing over less." };
  }
  return { ok: true };
}

export type CashierResult = 'correct' | 'short' | 'extra';

export interface CashierChange {
  given: Cents[];
  result: CashierResult;
}

const SMALLER: Record<number, Cents> = { 2000: 1000, 1000: 500, 500: 100, 25: 10, 10: 5, 5: 1 };

/** The change a cashier hands back. Sometimes it's wrong, the way real mistakes happen. */
export function cashierGives(change: Cents, errorRate: number): CashierChange {
  const correct = breakdown(change);
  if (change === 0 || !chance(errorRate)) return { given: correct, result: 'correct' };

  const given = [...correct];
  const swappable = given.map((d, i) => [d, i] as const).filter(([d]) => SMALLER[d]);
  const kind = pick(['short', 'short', 'swap', 'extra'] as const);

  if (kind === 'extra' || given.length === 0) {
    given.push(pick([100, 25, 10]));
  } else if (kind === 'swap' && swappable.length > 0) {
    const [d, i] = pick(swappable);
    given[i] = SMALLER[d];
  } else {
    given.splice(randInt(0, given.length - 1), 1);
  }
  given.sort((a, b) => b - a);
  return { given, result: sum(given) > change ? 'extra' : 'short' };
}
