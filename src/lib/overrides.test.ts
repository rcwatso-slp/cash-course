import { beforeEach, describe, expect, it } from 'vitest';
import { MCDOOGLES } from '../data/restaurants/mcdoogles';
import { FALMART } from '../data/stores/falmart';

// A tiny in-memory localStorage for the node test environment.
const store = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};

const { applyOverrides, editables, getOverrides, resetOverrides, setOverride } = await import('./overrides');

const item = (id: string) => MCDOOGLES.menu.find((m) => m.id === id)!;

describe('price overrides', () => {
  beforeEach(() => resetOverrides());

  it('changes a price and a name, and remembers it', () => {
    setOverride('mcdoogles/big-snack', { price: 649, name: 'Big Snack Deluxe' });
    expect(item('big-snack').price).toBe(649);
    expect(item('big-snack').name).toBe('Big Snack Deluxe');
    expect(getOverrides()['mcdoogles/big-snack']).toEqual({ price: 649, name: 'Big Snack Deluxe' });
  });

  it('edits one size of a sized item', () => {
    setOverride('mcdoogles/fries/Medium', { price: 399 });
    expect(item('fries').sizes!.find((s) => s.label === 'Medium')!.price).toBe(399);
    expect(item('fries').sizes!.find((s) => s.label === 'Small')!.price).toBe(229);
  });

  it('keeps a sized item\'s new name when another size is edited', () => {
    setOverride('mcdoogles/fries/Small', { name: 'Curly Fries' });
    setOverride('mcdoogles/fries/Large', { price: 449 });
    item('fries').name = 'World Famous-ish Fries'; // fresh page load
    applyOverrides();
    expect(item('fries').name).toBe('Curly Fries');
    expect(editables('mcdoogles').filter((r) => r.key.startsWith('mcdoogles/fries/')).map((r) => r.nameEditable)).toEqual([true, false, false]);
  });

  it('resets back to the original', () => {
    setOverride('falmart/milk', { price: 999 });
    resetOverrides('falmart');
    expect(FALMART.products.find((p) => p.id === 'milk')!.price).toBe(312);
    expect(getOverrides()).toEqual({});
  });

  it('drops an edit that matches the original', () => {
    setOverride('mcdoogles/cheesy', { price: 300 });
    setOverride('mcdoogles/cheesy', { price: 249 });
    expect(getOverrides()).toEqual({});
  });

  it('re-applies saved edits at startup', () => {
    setOverride('mcdoogles/cone', { price: 199 });
    item('cone').price = 179; // pretend a fresh page load
    applyOverrides();
    expect(item('cone').price).toBe(199);
  });

  it('lists every row for a place, with originals', () => {
    const rows = editables('mcdoogles');
    expect(rows.find((r) => r.key === 'mcdoogles/fries/Large')?.original.price).toBe(419);
    expect(rows.length).toBeGreaterThan(20);
  });
});
