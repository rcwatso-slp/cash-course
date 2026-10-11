import { describe, expect, it } from 'vitest';
import { STORES } from '../data/stores';
import { FALMART } from '../data/stores/falmart';
import { AMAZOOM } from '../data/stores/amazoom';
import {
  addToCart, cartCount, cartUnits, checkList, giftCardFor, haveCount, makeShoppingList, search, setQty, shippingCost,
  shopPrice, type CartLine,
} from './shop';

describe('catalogs', () => {
  it('have unique ids, real categories and list items that exist', () => {
    for (const store of STORES) {
      const ids = store.products.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const p of store.products) {
        expect(store.categories.map((c) => c.id)).toContain(p.category);
        expect(p.price).toBeGreaterThan(0);
        if (p.wasPrice) expect(p.wasPrice).toBeGreaterThan(p.price);
      }
      for (const item of store.listItems) {
        expect(store.products.some((p) => p.tags.includes(item.tag)), `${store.id}: ${item.tag}`).toBe(true);
      }
    }
  });
});

describe('cart', () => {
  it('adds, caps at 10, changes and removes', () => {
    let cart: CartLine[] = addToCart([], 'milk', 2);
    cart = addToCart(cart, 'milk', 1);
    expect(cart).toEqual([{ productId: 'milk', qty: 3 }]);
    expect(addToCart(cart, 'milk', 20)[0].qty).toBe(10);
    cart = setQty(cart, 'bread', 1);
    expect(cartCount(cart)).toBe(4);
    expect(setQty(cart, 'milk', 0)).toEqual([{ productId: 'bread', qty: 1 }]);
  });

  it('lists each unit for adding up', () => {
    const units = cartUnits(FALMART, [{ productId: 'milk', qty: 2 }, { productId: 'bread', qty: 1 }], 3);
    expect(units.map((u) => u.cents)).toEqual([312, 312, 148]);
  });
});

describe('search', () => {
  it('finds by name, brand, tag and plural', () => {
    expect(search(FALMART, 'toothpaste').length).toBeGreaterThanOrEqual(3);
    expect(search(FALMART, 'chargers').every((p) => p.tags.includes('phone charger'))).toBe(true);
    expect(search(AMAZOOM, 'star warz').length).toBeGreaterThan(5);
    expect(search(FALMART, 'zzzzz')).toEqual([]);
  });
});

describe('shipping', () => {
  const opt = FALMART.delivery[1];
  it('is free at the threshold', () => {
    expect(shippingCost(opt, 3499)).toBe(795);
    expect(shippingCost(opt, 3500)).toBe(0);
    expect(shippingCost(FALMART.delivery[0], 100)).toBe(0);
  });
});

describe('shopping lists', () => {
  it('can always be completed from the store', () => {
    for (const store of STORES) {
      for (let i = 0; i < 100; i++) {
        const level = ((i % 4) + 1) as 1 | 2 | 3 | 4;
        const needs = makeShoppingList(store, level);
        // No product may satisfy two needs at once.
        for (const p of store.products) expect(needs.filter((n) => p.tags.includes(n.tag)).length).toBeLessThanOrEqual(1);
        // Buying the cheapest match for each need always passes.
        let cart: CartLine[] = [];
        for (const n of needs) {
          const cheapest = store.products
            .filter((p) => p.tags.includes(n.tag))
            .sort((a, b) => shopPrice(a, level) - shopPrice(b, level))[0];
          cart = setQty(cart, cheapest.id, n.qty);
        }
        expect(needs.every((n) => haveCount(store, cart, n) === n.qty)).toBe(true);
        expect(checkList(store, cart, needs, level)).toEqual({ ok: true });
      }
    }
  });

  it('catches a missing item, extra item and not-cheapest', () => {
    const needs = [{ tag: 'toothpaste', label: 'the cheapest toothpaste', qty: 1, cheapest: true }];
    expect(checkList(FALMART, [], needs, 3).ok).toBe(false);
    expect(checkList(FALMART, [{ productId: 'krest', qty: 1 }], needs, 3)).toMatchObject({ ok: false });
    expect(checkList(FALMART, [{ productId: 'fv-toothpaste', qty: 1 }], needs, 3)).toEqual({ ok: true });
    expect(checkList(FALMART, [{ productId: 'fv-toothpaste', qty: 1 }, { productId: 'milk', qty: 1 }], needs, 3)).toMatchObject({ ok: false });
  });
});

describe('giftCardFor', () => {
  it('uses the setting, or the next $25 up when the order is bigger', () => {
    expect(giftCardFor(4210, 5000)).toBe(5000);
    expect(giftCardFor(5000, 5000)).toBe(5000);
    expect(giftCardFor(6210, 5000)).toBe(7500);
    expect(giftCardFor(7500, 5000)).toBe(10000);
  });
});
