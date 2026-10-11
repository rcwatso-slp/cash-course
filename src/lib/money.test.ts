import { describe, expect, it } from 'vitest';
import {
  breakdown, calcTax, countUpSteps, describeDenoms, formatMoney, formatShort, nextDollar,
  parseMoney, plainDigits, regroup, sum,
} from './money';

describe('formatMoney', () => {
  it('formats cents as dollars', () => {
    expect(formatMoney(1017)).toBe('$10.17');
    expect(formatMoney(5)).toBe('$0.05');
    expect(formatMoney(0)).toBe('$0.00');
    expect(formatMoney(123456)).toBe('$1,234.56');
  });
  it('formats short amounts for jumps', () => {
    expect(formatShort(1)).toBe('1¢');
    expect(formatShort(60)).toBe('60¢');
    expect(formatShort(200)).toBe('$2');
    expect(formatShort(250)).toBe('$2.50');
  });
  it('gives plain digits for column math', () => {
    expect(plainDigits(2000)).toBe('20.00');
    expect(plainDigits(739)).toBe('7.39');
    expect(plainDigits(5)).toBe('0.05');
  });
});

describe('parseMoney', () => {
  it.each([
    ['10.17', 1017], ['$10.17', 1017], [' 10.17 ', 1017], ['10.170', 1017], ['10', 1000],
    ['10.', 1000], ['.50', 50], ['0.05', 5], ['1,000.00', 100000], ['$ 7.39', 739],
  ])('accepts %s', (input, cents) => {
    expect(parseMoney(input)).toEqual({ ok: true, cents });
  });

  it('flags one decimal place with a suggestion', () => {
    expect(parseMoney('10.2')).toEqual({ ok: false, reason: 'oneDecimal', suggestion: 1020 });
  });
  it('rejects junk', () => {
    expect(parseMoney('')).toMatchObject({ ok: false, reason: 'empty' });
    expect(parseMoney('abc')).toMatchObject({ ok: false, reason: 'format' });
    expect(parseMoney('1.2.3')).toMatchObject({ ok: false, reason: 'format' });
    expect(parseMoney('-5')).toMatchObject({ ok: false, reason: 'format' });
    expect(parseMoney('10.175')).toMatchObject({ ok: false, reason: 'tooManyDecimals' });
  });
});

describe('calcTax', () => {
  it('rounds half up to the cent at 7.25%', () => {
    expect(calcTax(1017, 7.25)).toBe(74); // 0.737325
    expect(calcTax(1000, 7.25)).toBe(73); // 0.725 -> 0.73
    expect(calcTax(200, 7.25)).toBe(15); // 0.145 -> 0.15
    expect(calcTax(0, 7.25)).toBe(0);
  });
  it('handles other rates', () => {
    expect(calcTax(1000, 0)).toBe(0);
    expect(calcTax(1000, 8.25)).toBe(83); // 0.825 -> 0.83
    expect(calcTax(999, 6)).toBe(60); // 0.5994
  });
});

describe('breakdown', () => {
  it('uses the fewest bills and coins', () => {
    expect(breakdown(1261)).toEqual([1000, 100, 100, 25, 25, 10, 1]);
    expect(breakdown(0)).toEqual([]);
    expect(breakdown(41)).toEqual([25, 10, 5, 1]);
  });
  it('describes money in words', () => {
    expect(describeDenoms([1000, 100, 100, 25, 25, 10, 1])).toBe(
      '1 $10 bill, 2 $1 bills, 2 quarters, 1 dime and 1 penny',
    );
    expect(describeDenoms([1, 1])).toBe('2 pennies');
    expect(describeDenoms([])).toBe('nothing');
  });
});

describe('countUpSteps', () => {
  it('counts up like a cashier', () => {
    expect(countUpSteps(739, 2000).map((s) => s.to)).toEqual([800, 1000, 2000]);
    expect(countUpSteps(739, 2000).map((s) => s.jump)).toEqual([61, 200, 1000]);
  });
  it('handles next-dollar-up and whole dollars', () => {
    expect(countUpSteps(739, 800).map((s) => s.jump)).toEqual([61]);
    expect(countUpSteps(1300, 2000).map((s) => s.jump)).toEqual([700]);
    expect(countUpSteps(700, 1000).map((s) => s.jump)).toEqual([300]);
  });
  it('stops at the target dollars when the target has cents', () => {
    expect(countUpSteps(6250, 16999).map((s) => s.to)).toEqual([6300, 7000, 10000, 16000, 16900, 16999]);
  });
  it('always adds up to the change', () => {
    for (let i = 0; i < 2000; i++) {
      const paid = i % 2 ? [500, 1000, 2000, 5000][i % 4] : 1 + Math.floor(Math.random() * 50000);
      const price = 1 + Math.floor(Math.random() * (paid - 1));
      const steps = countUpSteps(price, paid);
      expect(sum(steps.map((s) => s.jump))).toBe(paid - price);
      expect(steps[steps.length - 1].to).toBe(paid);
    }
  });
});

describe('regroup', () => {
  const digits = (c: number, width: number) => plainDigits(c).replace('.', '').padStart(width, '0').split('').map(Number);
  it('borrows across zeros', () => {
    expect(regroup([2, 0, 0, 0], [0, 7, 3, 9])).toEqual([1, 9, 9, 10]);
  });
  it('leaves digits alone when no borrow is needed', () => {
    expect(regroup([9, 9, 9], [1, 2, 3])).toEqual([9, 9, 9]);
  });
  it('always produces column-by-column answers that are valid', () => {
    for (let i = 0; i < 500; i++) {
      const top = 100 + Math.floor(Math.random() * 9900);
      const bottom = Math.floor(Math.random() * top);
      const t = digits(top, 4);
      const b = digits(bottom, 4);
      const r = regroup(t, b);
      const cols = r.map((d, k) => d - b[k]);
      cols.forEach((c) => expect(c).toBeGreaterThanOrEqual(0));
      cols.forEach((c) => expect(c).toBeLessThanOrEqual(9));
      expect(Number(cols.join(''))).toBe(top - bottom);
    }
  });
});

describe('nextDollar', () => {
  it('rounds up to the next whole dollar', () => {
    expect(nextDollar(739)).toBe(800);
    expect(nextDollar(700)).toBe(700);
    expect(nextDollar(1)).toBe(100);
  });
});
