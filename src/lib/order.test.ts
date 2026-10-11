import { describe, expect, it } from 'vitest';
import { CHIPOODLE } from '../data/restaurants/chipoodle';
import { DOMIN_OOPS } from '../data/restaurants/dominoops';
import { RESTAURANTS } from '../data/restaurants';
import { STARDUCKS } from '../data/restaurants/starducks';
import { addLine, buildLine, defaultChosen, lineEach, makeTask, matchesTask, orderUnits, removeOne } from './order';
import { sum } from './money';

const item = (r: typeof CHIPOODLE, id: string) => r.menu.find((m) => m.id === id)!;

describe('buildLine', () => {
  it('names a burrito by protein and prices add-ons separately', () => {
    const burrito = item(CHIPOODLE, 'burrito');
    const chosen = { ...defaultChosen(burrito), 'Toppings (free)': ['Cheese'], Extras: ['Guac'] };
    const line = buildLine(burrito, burrito.sizes![5], chosen, 3);
    expect(line.name).toBe('Steak Burrito');
    expect(line.price).toBe(1195);
    expect(line.extras).toEqual([{ label: 'Guac', price: 295 }]);
    expect(line.details).toEqual(['White rice', 'Black beans', 'Cheese']);
    expect(lineEach(line)).toBe(1490);
  });

  it('ignores free choices in the key so they never break an order card', () => {
    const bowl = item(CHIPOODLE, 'bowl');
    const a = buildLine(bowl, bowl.sizes![0], { ...defaultChosen(bowl), Rice: ['Brown rice'] }, 3);
    const b = buildLine(bowl, bowl.sizes![0], defaultChosen(bowl), 3);
    expect(a.key).toBe(b.key);
  });

  it('shortens pizza sizes in the name and charges for toppings', () => {
    const byo = item(DOMIN_OOPS, 'byo');
    const line = buildLine(byo, byo.sizes![2], { Crust: ['Hand tossed'], Toppings: ['Pepperoni', 'Bacon'] }, 3);
    expect(line.name).toBe('Large Build Your Own Pizza');
    expect(lineEach(line)).toBe(1599 + 175 + 175);
  });

  it('charges for oat milk (a paid pick-one choice)', () => {
    const latte = item(STARDUCKS, 'latte');
    const line = buildLine(latte, latte.sizes![2], { Milk: ['Oat milk'], 'Add-ins': [] }, 3);
    expect(line.name).toBe('Quacki Caffè Latte');
    expect(line.extras).toEqual([{ label: 'Oat milk', price: 70 }]);
  });

  it('simplifies add-on prices at level 1', () => {
    const burrito = item(CHIPOODLE, 'burrito');
    const line = buildLine(burrito, burrito.sizes![0], { ...defaultChosen(burrito), Extras: ['Guac'] }, 1);
    expect(line.price % 100).toBe(0);
    expect(line.extras[0].price % 100).toBe(0);
  });
});

describe('cart lines', () => {
  it('adds, combines and removes', () => {
    const latte = item(STARDUCKS, 'latte');
    const l = buildLine(latte, latte.sizes![0], defaultChosen(latte), 3);
    let lines = addLine([], l);
    lines = addLine(lines, l);
    expect(lines).toHaveLength(1);
    expect(lines[0].qty).toBe(2);
    expect(orderUnits(lines)).toHaveLength(2);
    lines = removeOne(lines, l.key);
    expect(lines[0].qty).toBe(1);
    expect(removeOne(lines, l.key)).toEqual([]);
  });

  it('lists each add-on as its own price to add', () => {
    const byo = item(DOMIN_OOPS, 'byo');
    const line = { ...buildLine(byo, byo.sizes![0], { Crust: ['Hand tossed'], Toppings: ['Ham'] }, 3), qty: 2 };
    const units = orderUnits([line]);
    expect(units.map((u) => u.cents)).toEqual([999, 175, 999, 175]);
    expect(sum(units.map((u) => u.cents))).toBe(lineEach(line) * 2);
  });
});

describe('order cards', () => {
  it('every restaurant can make tasks that its own lines can match', () => {
    for (const r of RESTAURANTS) {
      for (let i = 0; i < 50; i++) {
        const level = ((i % 4) + 1) as 1 | 2 | 3 | 4;
        const task = makeTask(r.menu, level);
        expect(task.length).toBeGreaterThanOrEqual(2);
        expect(new Set(task.map((t) => t.key)).size).toBe(task.length);
        // Rebuild each line from its key to prove the task is orderable.
        const lines = task.map((t) => {
          const [id, sizeLabel, ...paid] = t.key.split('|');
          const m = r.menu.find((x) => x.id === id)!;
          const chosen = defaultChosen(m);
          for (const g of m.options ?? []) {
            const hit = g.choices.find((c) => paid.includes(c.label));
            if (hit) chosen[g.label] = [hit.label];
          }
          return buildLine(m, m.sizes?.find((s) => s.label === sizeLabel), chosen, level);
        });
        expect(matchesTask(lines, task)).toBe(true);
      }
    }
  });
});
