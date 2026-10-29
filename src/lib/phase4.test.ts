import { describe, expect, it } from 'vitest';
import { SCAM_CASES } from '../data/scams';
import { makeDealProblem } from './deals';
import { sum } from './money';
import { makeReceiptProblem } from './receipts';

describe('better deal', () => {
  it.each([1, 2, 3, 4] as const)('level %i: the better deal really costs less', (level) => {
    for (let i = 0; i < 400; i++) {
      const p = makeDealProblem(level);
      const [a, b] = p.options;
      expect(a.cost).toBeGreaterThan(0);
      expect(b.cost).toBeGreaterThan(0);
      expect(p.options[p.better].cost).toBeLessThan(p.options[1 - p.better].cost);
      expect(p.save).toBe(Math.abs(a.cost - b.cost));
      expect(p.save).toBeGreaterThanOrEqual(10);
      if (level === 1) expect(a.cost % 100 + b.cost % 100).toBe(0);
      if (p.kind === 'trap') {
        const bundle = p.options.find((o) => o.saleBadge === 'SALE!')!;
        expect(p.options[p.better]).not.toBe(bundle);
      }
    }
  });
});

describe('receipts', () => {
  it.each([1, 2, 3, 4] as const)('level %i: receipt math and answers line up', (level) => {
    for (let i = 0; i < 400; i++) {
      const { receipt: r, ask } = makeReceiptProblem(level, 7.25);
      expect(r.total).toBe(r.subtotal + r.tax);
      if (ask.kind === 'tax') expect(ask.answer).toBe(r.tax);
      if (ask.kind === 'total') expect(ask.answer).toBe(r.total);
      if (ask.kind === 'change') expect(ask.answer).toBe(r.change);
      if (ask.kind === 'count') expect(ask.answer).toBe(sum(r.bought.map((b) => b.qty)));
      if (ask.kind === 'itemPrice') expect(r.lines.some((l) => l.name === ask.item.name && l.price === ask.answer)).toBe(true);
      if (ask.kind === 'check') {
        const linesMatchBag = r.lines.length === r.bought.length;
        const subtotalOk = r.subtotal === sum(r.lines.map((l) => l.price * l.qty));
        const changeOk = r.change === r.cash - r.total;
        expect(ask.correct).toBe(linesMatchBag && subtotalOk && changeOk);
      } else {
        // Reading questions always use a correct receipt.
        expect(r.change).toBe(r.cash - r.total);
        expect(r.subtotal).toBe(sum(r.lines.map((l) => l.price * l.qty)));
      }
      expect(r.cash).toBeGreaterThan(r.total);
    }
  });
});

describe('scam cases', () => {
  it('have unique ids, a mix of real and scam, and reasons', () => {
    expect(new Set(SCAM_CASES.map((c) => c.id)).size).toBe(SCAM_CASES.length);
    expect(SCAM_CASES.filter((c) => c.scam).length).toBeGreaterThan(4);
    expect(SCAM_CASES.filter((c) => !c.scam).length).toBeGreaterThan(3);
    for (const c of SCAM_CASES) expect(c.reasons.length).toBeGreaterThan(0);
  });
});

describe('worksheets', () => {
  it.each(['menu', 'change', 'afford', 'deals'] as const)('%s makes the right number of problems with answers', async (type) => {
    const { makeWorksheet } = await import('./worksheets');
    const sheet = makeWorksheet({ type, count: 8, restaurantId: 'tacosmell', answerKey: true }, 3, 4);
    expect(sheet.problems).toHaveLength(8);
    for (const p of sheet.problems) {
      expect(p.text.length).toBeGreaterThan(5);
      expect(p.blank.length).toBeGreaterThan(3);
      expect(p.answer.length).toBeGreaterThan(0);
    }
    if (type === 'menu') expect(sheet.menu?.items.length).toBeGreaterThan(10);
  });
});
