// Chaise Bank: a debit account where each purchase comes out of the balance.
import type { Cents } from './money';
import type { PriceLevel } from './problems';
import { chance, pick, randInt } from './random';

export type TxKind = 'purchase' | 'deposit' | 'declined';

export interface Transaction {
  kind: TxKind;
  name: string;
  emoji: string;
  amount: Cents;
  /** Balance before this transaction */
  before: Cents;
  /** Balance after (unchanged when declined) */
  after: Cents;
}

const MERCHANTS: { name: string; emoji: string; min: number; max: number }[] = [
  { name: 'McDoogles', emoji: '🍔', min: 500, max: 1400 },
  { name: 'Taco Smell', emoji: '🌮', min: 400, max: 1200 },
  { name: 'Chipoodle', emoji: '🐩', min: 1000, max: 1800 },
  { name: 'Domin-Oops Pizza', emoji: '🍕', min: 1200, max: 2600 },
  { name: 'Starducks', emoji: '🦆', min: 400, max: 900 },
  { name: 'Fal-Mart', emoji: '✳️', min: 800, max: 4500 },
  { name: 'Amazoom', emoji: '📦', min: 900, max: 4000 },
  { name: 'Bass Bro Shops', emoji: '🦌', min: 1200, max: 6000 },
  { name: 'QuikGas', emoji: '⛽', min: 2000, max: 4500 },
  { name: 'Cinema 12 movie ticket', emoji: '🎬', min: 1100, max: 1500 },
];

const DEPOSITS: { name: string; emoji: string; amounts: Cents[] }[] = [
  { name: 'Paycheck', emoji: '💼', amounts: [8500, 9200, 12000, 14550] },
  { name: 'Allowance', emoji: '🏠', amounts: [2000, 2500, 3000] },
  { name: 'Birthday money', emoji: '🎂', amounts: [2500, 5000] },
  { name: 'Sold old video game', emoji: '🎮', amounts: [1500, 2250] },
];

// Things that cost more than he has, so the card would be declined.
const BIG_BUYS: { name: string; emoji: string; amount: Cents }[] = [
  { name: 'Nintendough Swish 2', emoji: '🕹️', amount: 44999 },
  { name: 'LEGGO Millennium Fallcon', emoji: '🚀', amount: 16999 },
  { name: 'Insulated hunting boots', emoji: '🥾', amount: 12999 },
  { name: 'AirPads earbuds', emoji: '🎧', amount: 12900 },
];

const roundFor = (c: Cents, level: PriceLevel) => (level <= 2 ? Math.max(100, Math.round(c / 100) * 100) : c);

export function startingBalance(level: PriceLevel): Cents {
  return level <= 2 ? randInt(6, 15) * 1000 : randInt(4000, 15000);
}

/** The next thing that happens to the account. */
export function nextTransaction(balance: Cents, level: PriceLevel): Transaction {
  // Running low: money comes in.
  if (balance < 1500 || chance(0.15)) {
    const d = pick(DEPOSITS);
    const amount = roundFor(pick(d.amounts), level);
    return { kind: 'deposit', name: d.name, emoji: d.emoji, amount, before: balance, after: balance + amount };
  }
  // Sometimes he tries to buy something he can't afford.
  if (level >= 2 && chance(0.12)) {
    const big = pick(BIG_BUYS.filter((b) => b.amount > balance));
    if (big) return { kind: 'declined', name: big.name, emoji: big.emoji, amount: roundFor(big.amount, level), before: balance, after: balance };
  }
  const m = pick(MERCHANTS.filter((x) => x.min < balance)) ?? MERCHANTS[0];
  const amount = roundFor(randInt(m.min, Math.min(m.max, balance)), level);
  if (amount > balance) {
    return { kind: 'declined', name: m.name, emoji: m.emoji, amount, before: balance, after: balance };
  }
  return { kind: 'purchase', name: m.name, emoji: m.emoji, amount, before: balance, after: balance - amount };
}
