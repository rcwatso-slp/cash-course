// Which questions each patient has already had, per task, so practice doesn't repeat.
// Stored on this device with the rest of the patient's data: patient → task → item → last used (ms).
import { readJSON, writeJSON } from './storage';

export const SEEN_KEY = 'hub.seen.v1';

type SeenStore = Record<string, Record<string, Record<string, number>>>;

/** A stable name for an item, used to remember it. */
export function itemKey(item: unknown): string {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    const o = item as Record<string, unknown>;
    // Odd One Out prompts are all the same, so add the choices.
    if (typeof o.prompt === 'string' && Array.isArray(o.options)) return `${o.prompt}|${o.options.join('|')}`;
    for (const k of ['q', 'prompt', 'word', 'stem', 'title', 'name', 'id']) if (typeof o[k] === 'string') return o[k] as string;
  }
  return JSON.stringify(item);
}

export const getSeen = (profileId: string, task: string): Record<string, number> => readJSON<SeenStore>(SEEN_KEY, {})[profileId]?.[task] ?? {};

export function markSeen(profileId: string, task: string, key: string, now = Date.now()): void {
  const all = readJSON<SeenStore>(SEEN_KEY, {});
  const mine = (all[profileId] ??= {});
  (mine[task] ??= {})[key] = now;
  writeJSON(SEEN_KEY, all);
}

/** Forget what a patient has used, for one task or all of them. */
export function resetSeen(profileId: string, task?: string): void {
  const all = readJSON<SeenStore>(SEEN_KEY, {});
  if (!all[profileId]) return;
  if (task) delete all[profileId][task];
  else delete all[profileId];
  writeJSON(SEEN_KEY, all);
}

export const allSeen = (): SeenStore => readJSON<SeenStore>(SEEN_KEY, {});

/** Combine two records (backup import), keeping the latest time for each item. */
export function mergeSeen(a: SeenStore, b: SeenStore): SeenStore {
  const out: SeenStore = JSON.parse(JSON.stringify(a));
  for (const [pid, tasks] of Object.entries(b ?? {}))
    for (const [task, items] of Object.entries(tasks ?? {}))
      for (const [key, at] of Object.entries(items ?? {})) {
        const t = ((out[pid] ??= {})[task] ??= {});
        if (typeof at === 'number' && !(t[key] >= at)) t[key] = at;
      }
  return out;
}
export const replaceSeen = (store: SeenStore): void => writeJSON(SEEN_KEY, store);

/**
 * Pick the next item: one this patient has never had, if any are left.
 * Once every item has been used, pick from the ones used longest ago.
 * Items in `recent` (asked a moment ago) are skipped while there is anything else.
 */
export function pickNext<T>(items: readonly T[], seen: Record<string, number>, recent: ReadonlySet<string>, random = Math.random): T {
  if (items.length === 0) throw new Error('No items to pick from');
  const pool = items.filter((i) => !recent.has(itemKey(i)));
  const from = pool.length ? pool : items;
  const fresh = from.filter((i) => !(itemKey(i) in seen));
  if (fresh.length) return fresh[Math.floor(random() * fresh.length)];
  const oldestFirst = [...from].sort((a, b) => seen[itemKey(a)] - seen[itemKey(b)]);
  const oldest = oldestFirst.slice(0, Math.max(1, Math.ceil(oldestFirst.length / 3)));
  return oldest[Math.floor(random() * oldest.length)];
}

/** How many of these items the patient hasn't had yet. */
export const countNew = (items: readonly unknown[], seen: Record<string, number>): number => items.filter((i) => !(itemKey(i) in seen)).length;
