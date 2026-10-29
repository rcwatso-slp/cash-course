import { describe, expect, it } from 'vitest';
import { sum } from './money';
import {
  cashierGives, checkPayment, composeFromWallet, ensureWallet, levelPrice, makeChangeProblem,
  nextBillUp, suggestPayment, twentyOrMore, walletTotal, type ChangeLevel,
} from './problems';

describe('levelPrice', () => {
  it('simplifies prices for lower levels', () => {
    expect(levelPrice(599, 1)).toBe(600);
    expect(levelPrice(129, 1)).toBe(100);
    expect(levelPrice(49, 1)).toBe(100);
    expect(levelPrice(229, 2)).toBe(225);
    expect(levelPrice(349, 2)).toBe(350);
    expect(levelPrice(189, 2)).toBe(200);
    expect(levelPrice(189, 3)).toBe(189);
    expect(levelPrice(0, 1)).toBe(0);
  });
});

describe('bills', () => {
  it('picks the next bill up', () => {
    expect(nextBillUp(739)).toBe(1000);
    expect(nextBillUp(500)).toBe(500);
    expect(nextBillUp(500, true)).toBe(1000);
    expect(nextBillUp(2001)).toBe(5000);
    expect(twentyOrMore(1091)).toBe(2000);
    expect(twentyOrMore(2391)).toBe(5000);
  });
});

describe('makeChangeProblem', () => {
  const levels: ChangeLevel[] = [1, 2, 3, 4];
  it.each(levels)('level %i always needs change and fits the level', (level) => {
    for (let i = 0; i < 300; i++) {
      const { price, paid } = makeChangeProblem(level);
      expect(paid).toBeGreaterThan(price);
      if (level <= 2) expect(price % 100).toBe(0);
      if (level >= 3) expect(price % 100).not.toBe(0);
      if (level === 2) expect(paid).toBe(2000);
      if (level === 3) expect(paid - price).toBeLessThan(100);
    }
  });
});

describe('wallet', () => {
  it('adds twenties until the wallet can pay', () => {
    const w = ensureWallet({ 100: 1 }, 4500, false);
    expect(walletTotal(w)).toBeGreaterThanOrEqual(4500);
  });
  it('can always make the next dollar up exactly', () => {
    for (let total = 1; total < 6000; total += 37) {
      const w = ensureWallet({ 100: 0, 500: 0, 1000: 0, 2000: 0 }, total, true);
      const paid = composeFromWallet(w, Math.ceil(total / 100) * 100);
      expect(paid).not.toBeNull();
    }
  });
  it('suggests a single bill when one covers it', () => {
    expect(suggestPayment({ 100: 5, 500: 1, 1000: 1, 2000: 1 }, 739)).toEqual([1000]);
  });
});

describe('checkPayment', () => {
  it('rejects too little', () => {
    expect(checkPayment([500], 739, 'choose').ok).toBe(false);
  });
  it('next dollar up must be exact', () => {
    expect(checkPayment([500, 100, 100, 100], 739, 'nextDollar').ok).toBe(true);
    expect(checkPayment([1000], 739, 'nextDollar').ok).toBe(false);
  });
  it('choose mode rejects bills that are not needed', () => {
    expect(checkPayment([1000], 739, 'choose').ok).toBe(true);
    expect(checkPayment([1000, 100], 739, 'choose').ok).toBe(false);
    expect(checkPayment([500, 100, 100, 100], 739, 'choose').ok).toBe(true);
  });
});

describe('cashierGives', () => {
  it('gives correct change when the error rate is 0', () => {
    expect(cashierGives(1261, 0)).toEqual({ given: [1000, 100, 100, 25, 25, 10, 1], result: 'correct' });
  });
  it('labels mistakes correctly', () => {
    for (let i = 0; i < 500; i++) {
      const change = 1 + Math.floor(Math.random() * 1999);
      const { given, result } = cashierGives(change, 1);
      expect(result).not.toBe('correct');
      expect(result === 'extra' ? sum(given) > change : sum(given) < change).toBe(true);
    }
  });
});
