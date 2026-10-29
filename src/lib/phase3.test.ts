import { describe, expect, it } from 'vitest';
import { BUYABLE, calcTip, deliveryFees, deliveryPrice, makeAffordProblem, pickBudget } from './budget';
import { nextTransaction, startingBalance } from './bank';
import { byDay, skillProgress } from './progress';
import type { Trial } from './log';

describe('budget and tips', () => {
  it('picks budgets', () => {
    expect(pickBudget(0)).toBe(0);
    expect(pickBudget(1500)).toBe(1500);
    for (let i = 0; i < 50; i++) expect(pickBudget(-1)).toBeGreaterThanOrEqual(1000);
  });
  it('tips on the food total, rounded to the cent', () => {
    expect(calcTip(3241, 20)).toBe(648); // 6.482
    expect(calcTip(3241, 15)).toBe(486); // 4.8615
    expect(calcTip(2000, 18)).toBe(360);
  });
});

describe('Can I afford it?', () => {
  it('has a big pool of real items', () => {
    expect(BUYABLE.length).toBeGreaterThan(100);
  });
  it.each([1, 2, 3, 4] as const)('level %i answers are right', (level) => {
    for (let i = 0; i < 300; i++) {
      const p = makeAffordProblem(level);
      const cost = p.items.reduce((t, x) => t + x.price, 0);
      expect(p.cost).toBe(cost);
      expect(p.canBuy).toBe(cost <= p.have);
      expect(p.have).toBeGreaterThan(0);
      if (level === 1) expect(p.have % 100 + p.cost % 100).toBe(0);
      if (level === 4) expect(p.items).toHaveLength(2);
    }
  });
});

describe('delivery', () => {
  it('marks prices up about 20% and ends in 9', () => {
    expect(deliveryPrice(599)).toBe(719);
    expect(deliveryPrice(1099)).toBe(1319);
    for (let c = 100; c < 3000; c += 37) {
      const d = deliveryPrice(c);
      expect(d % 10).toBe(9);
      expect(d).toBeGreaterThan(c);
    }
  });
  it('adds a small order fee under $12', () => {
    expect(deliveryFees(1000)).toEqual({ deliveryFee: 299, serviceFee: 150, smallOrderFee: 299 });
    expect(deliveryFees(2000).smallOrderFee).toBe(0);
    expect(deliveryFees(2000).serviceFee).toBe(300);
  });
});

describe('bank', () => {
  it.each([1, 2, 3, 4] as const)('level %i keeps the ledger consistent', (level) => {
    let balance = startingBalance(level);
    for (let i = 0; i < 500; i++) {
      const tx = nextTransaction(balance, level);
      expect(tx.before).toBe(balance);
      if (tx.kind === 'purchase') {
        expect(tx.amount).toBeLessThanOrEqual(balance);
        expect(tx.after).toBe(balance - tx.amount);
      }
      if (tx.kind === 'deposit') expect(tx.after).toBe(balance + tx.amount);
      if (tx.kind === 'declined') {
        expect(tx.amount).toBeGreaterThan(balance);
        expect(tx.after).toBe(balance);
      }
      if (level <= 2) expect(tx.amount % 100).toBe(0);
      expect(tx.after).toBeGreaterThanOrEqual(0);
      balance = tx.after;
    }
  });
});

describe('progress and mastery', () => {
  const t = (day: number, independent: boolean, skill: Trial['skill'] = 'change'): Trial => ({
    id: `${day}-${Math.random()}`, at: new Date(2026, 9, day, 10).toISOString(), nickname: 'JT', module: 'quickChange', skill,
    level: 'C1', question: '', answer: '', attempts: 1, helpLevel: independent ? 0 : 1, seconds: 5, calculator: false, independent,
  });
  const day = (d: number, right: number, of: number) => Array.from({ length: of }, (_, i) => t(d, i < right));

  it('groups by day', () => {
    expect(byDay([...day(1, 2, 3), ...day(2, 1, 1)])).toEqual([
      { date: '2026-10-01', total: 3, independent: 2 },
      { date: '2026-10-02', total: 1, independent: 1 },
    ]);
  });

  const rule = { pct: 80, sessions: 3, min: 5 };
  it('is mastered after 3 sessions at 80%+', () => {
    expect(skillProgress([...day(1, 4, 5), ...day(2, 5, 5), ...day(3, 8, 10)], 'change', rule).mastered).toBe(true);
  });
  it('is not mastered with a low session or too few sessions', () => {
    expect(skillProgress([...day(1, 4, 5), ...day(2, 3, 5), ...day(3, 8, 10)], 'change', rule).mastered).toBe(false);
    expect(skillProgress([...day(2, 5, 5), ...day(3, 8, 10)], 'change', rule).mastered).toBe(false);
  });
  it('ignores sessions with too few problems', () => {
    expect(skillProgress([...day(1, 4, 5), ...day(2, 0, 2), ...day(3, 5, 5), ...day(4, 5, 5)], 'change', rule).mastered).toBe(true);
  });
  it('only looks at the requested skill', () => {
    expect(skillProgress([...day(1, 5, 5), ...day(2, 5, 5), ...day(3, 5, 5)], 'tip', rule).mastered).toBe(false);
  });
});
