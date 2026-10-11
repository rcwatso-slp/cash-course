// All money is stored as whole cents (549 = $5.49) to avoid floating-point errors.
export type Cents = number;

export const BILLS: Cents[] = [10000, 5000, 2000, 1000, 500, 100];
export const COINS: Cents[] = [25, 10, 5, 1];
export const DENOMS: Cents[] = [...BILLS, ...COINS];

export function formatMoney(cents: Cents): string {
  const sign = cents < 0 ? '−' : '';
  const abs = Math.abs(Math.round(cents));
  const dollars = Math.floor(abs / 100).toLocaleString('en-US');
  return `${sign}$${dollars}.${String(abs % 100).padStart(2, '0')}`;
}

/** Short form for jumps and coins: 1¢, 60¢, $2, $2.50 */
export function formatShort(cents: Cents): string {
  if (cents < 100) return `${cents}¢`;
  if (cents % 100 === 0) return `$${cents / 100}`;
  return formatMoney(cents);
}

/** Digits with no $ sign or commas, for column math: 2000 -> "20.00" */
export function plainDigits(cents: Cents): string {
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}

export const sum = (xs: Cents[]): Cents => xs.reduce((a, b) => a + b, 0);

export const nextDollar = (cents: Cents): Cents => Math.ceil(cents / 100) * 100;

export type ParseResult =
  | { ok: true; cents: Cents }
  | { ok: false; reason: 'empty' | 'format' | 'tooManyDecimals' }
  | { ok: false; reason: 'oneDecimal'; suggestion: Cents };

/**
 * Lenient money parsing: "10.17", "$10.17", "10.170", "10" and "1,000.00" are accepted.
 * "10.2" is flagged (not graded) so the client can be reminded that money uses 2 decimal places.
 */
export function parseMoney(input: string): ParseResult {
  const s = input.trim().replace(/[\s$,]/g, '');
  if (s === '') return { ok: false, reason: 'empty' };
  if (!/^\d*\.?\d*$/.test(s) || s === '.') return { ok: false, reason: 'format' };
  const [whole, fracRaw = ''] = s.split('.');
  const dollars = whole === '' ? 0 : Number(whole);
  if (fracRaw.length === 1) {
    return { ok: false, reason: 'oneDecimal', suggestion: dollars * 100 + Number(fracRaw) * 10 };
  }
  let frac = fracRaw;
  if (frac.length > 2) {
    if (!/^0+$/.test(frac.slice(2))) return { ok: false, reason: 'tooManyDecimals' };
    frac = frac.slice(0, 2);
  }
  return { ok: true, cents: dollars * 100 + (frac === '' ? 0 : Number(frac)) };
}

/** Sales tax rounded half-up to the cent, like most registers. Integer math only. */
export function calcTax(subtotal: Cents, ratePercent: number): Cents {
  const basisPoints = Math.round(ratePercent * 100);
  return Math.floor((subtotal * basisPoints + 5000) / 10000);
}

/** Fewest bills and coins that make an amount, largest first. */
export function breakdown(cents: Cents, denoms: Cents[] = DENOMS): Cents[] {
  const out: Cents[] = [];
  let rest = cents;
  for (const d of denoms) {
    while (rest >= d) {
      out.push(d);
      rest -= d;
    }
  }
  return out;
}

const DENOM_NAMES: Record<number, [string, string]> = {
  10000: ['$100 bill', '$100 bills'],
  5000: ['$50 bill', '$50 bills'],
  2000: ['$20 bill', '$20 bills'],
  1000: ['$10 bill', '$10 bills'],
  500: ['$5 bill', '$5 bills'],
  100: ['$1 bill', '$1 bills'],
  25: ['quarter', 'quarters'],
  10: ['dime', 'dimes'],
  5: ['nickel', 'nickels'],
  1: ['penny', 'pennies'],
};

/** "1 $10 bill, 2 $1 bills, 2 quarters and 1 penny" */
export function describeDenoms(denoms: Cents[]): string {
  const counts = new Map<number, number>();
  for (const d of denoms) counts.set(d, (counts.get(d) ?? 0) + 1);
  const parts = DENOMS.filter((d) => counts.has(d)).map((d) => {
    const n = counts.get(d)!;
    return `${n} ${DENOM_NAMES[d][n === 1 ? 0 : 1]}`;
  });
  if (parts.length === 0) return 'nothing';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

export interface CountUpStep {
  from: Cents;
  to: Cents;
  jump: Cents;
}

/**
 * Cashier-style counting up: next 10¢, next dollar, next $10, then the amount paid.
 * $7.39 -> $20: 7.40 (+1¢), 8.00 (+60¢), 10.00 (+$2), 20.00 (+$10).
 */
export function countUpSteps(from: Cents, to: Cents): CountUpStep[] {
  const steps: CountUpStep[] = [];
  let cur = from;
  for (const unit of [10, 100, 1000]) {
    const mark = Math.ceil(cur / unit) * unit;
    if (mark > cur && mark < to) {
      steps.push({ from: cur, to: mark, jump: mark - cur });
      cur = mark;
    }
  }
  if (cur < to) steps.push({ from: cur, to, jump: to - cur });
  return steps;
}

/**
 * Column subtraction regrouping (borrowing). Returns the top digits after all borrows,
 * so the UI can cross out the original digit and write the new one above it.
 * [2,0,0,0] - [0,7,3,9] -> [1,9,9,10]
 */
export function regroup(top: number[], bottom: number[]): number[] {
  const cur = [...top];
  for (let i = cur.length - 1; i >= 0; i--) {
    if (cur[i] < bottom[i]) {
      let j = i - 1;
      while (j >= 0 && cur[j] === 0) j--;
      if (j < 0) throw new Error('Top number must be at least the bottom number');
      cur[j] -= 1;
      for (let k = j + 1; k < i; k++) cur[k] = 9;
      cur[i] += 10;
    }
  }
  return cur;
}
