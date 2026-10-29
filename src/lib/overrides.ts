// Clinician price and name edits, saved on this device and applied to the menus and catalogs.
import { RESTAURANTS } from '../data/restaurants';
import { STORES } from '../data/stores';
import type { Cents } from './money';
import { readJSON, writeJSON } from './storage';

export interface Override {
  name?: string;
  price?: Cents;
}

/** Keys: "mcdoogles/fries" (item), "mcdoogles/fries/Medium" (one size), "falmart/milk" (product). */
export type Overrides = Record<string, Override>;

const KEY = 'cashcourse.prices.v1';

export interface Editable {
  key: string;
  emoji: string;
  name: string;
  /** Only sized items: which size this row is */
  size?: string;
  /** Sizes share one name; only the first size's row edits it */
  nameEditable: boolean;
  price: Cents;
  original: { name: string; price: Cents };
}

interface Target {
  get: () => { name: string; price: Cents };
  set: (o: { name: string; price: Cents }) => void;
  emoji: string;
  size?: string;
  ownsName: boolean;
}

// Every editable price, with a way to read and write it. Originals are captured once, before any edits.
const targets = new Map<string, Target>();
const originals = new Map<string, { name: string; price: Cents }>();

for (const r of RESTAURANTS) {
  for (const item of r.menu) {
    if (item.sizes) {
      item.sizes.forEach((size, i) => {
        const ownsName = i === 0;
        targets.set(`${r.id}/${item.id}/${size.label}`, {
          emoji: item.emoji,
          size: size.label,
          ownsName,
          get: () => ({ name: item.name, price: size.price }),
          set: (o) => {
            if (ownsName) item.name = o.name;
            size.price = o.price;
          },
        });
      });
    } else if (item.price !== undefined) {
      targets.set(`${r.id}/${item.id}`, {
        emoji: item.emoji,
        ownsName: true,
        get: () => ({ name: item.name, price: item.price! }),
        set: (o) => {
          item.name = o.name;
          item.price = o.price;
        },
      });
    }
  }
}
for (const st of STORES) {
  for (const p of st.products) {
    const saleWas = p.wasPrice;
    targets.set(`${st.id}/${p.id}`, {
      emoji: p.emoji,
      ownsName: true,
      get: () => ({ name: p.name, price: p.price }),
      set: (o) => {
        p.name = o.name;
        p.price = o.price;
        // A sale only shows while the price is still below the old price.
        if (saleWas !== undefined && o.price < saleWas) p.wasPrice = saleWas;
        else delete p.wasPrice;
      },
    });
  }
}
for (const [key, t] of targets) originals.set(key, { ...t.get() });

export const getOverrides = (): Overrides => readJSON<Overrides>(KEY, {});

function apply(key: string, o: Override | undefined) {
  const t = targets.get(key);
  const orig = originals.get(key);
  if (!t || !orig) return;
  t.set({ name: o?.name ?? orig.name, price: o?.price ?? orig.price });
}

/** Call once at startup, before anything renders. */
export function applyOverrides(): void {
  for (const [key, o] of Object.entries(getOverrides())) apply(key, o);
}

export function setOverride(key: string, patch: Override): void {
  const all = getOverrides();
  const orig = originals.get(key);
  const next = { ...all[key], ...patch };
  // Drop anything that's back to the original.
  if (orig && next.name === orig.name) delete next.name;
  if (orig && next.price === orig.price) delete next.price;
  if (next.name === undefined && next.price === undefined) delete all[key];
  else all[key] = next;
  writeJSON(KEY, all);
  apply(key, all[key]);
}

export function resetOverrides(prefix?: string): void {
  const all = getOverrides();
  for (const key of Object.keys(all)) {
    if (prefix && !key.startsWith(`${prefix}/`)) continue;
    delete all[key];
    apply(key, undefined);
  }
  writeJSON(KEY, all);
}

export function replaceOverrides(next: Overrides): void {
  resetOverrides();
  writeJSON(KEY, next);
  applyOverrides();
}

/** Rows for the editor, for one restaurant or store. */
export function editables(placeId: string): Editable[] {
  return [...targets.entries()]
    .filter(([key]) => key.startsWith(`${placeId}/`))
    .map(([key, t]) => ({ key, emoji: t.emoji, size: t.size, nameEditable: t.ownsName, ...t.get(), original: originals.get(key)! }));
}
