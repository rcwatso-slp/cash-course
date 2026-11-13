// Checking logic for the Thinking & Planning tasks. Pure functions, so they can be tested.
import { pick, randInt, shuffle } from './random';

// ---------- Put It in Order ----------

/** Index of the first step out of place, or -1 if all are right. */
export function firstWrongStep(answer: readonly string[], correct: readonly string[]): number {
  for (let i = 0; i < correct.length; i++) if (answer[i] !== correct[i]) return i;
  return answer.length === correct.length ? -1 : correct.length;
}

// ---------- Pill Organizer ----------

export type Slot = 'morning' | 'noon' | 'evening' | 'bedtime';
export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const SLOT_NAMES: Record<Slot, string> = { morning: 'Morning', noon: 'Noon', evening: 'Evening', bedtime: 'Bedtime' };

export interface Med {
  id: string;
  name: string;
  color: string;
  label: string;
  /** Pills per slot. */
  dose: Partial<Record<Slot, number>>;
  /** Day indexes (0 = Sun). Missing = every day. */
  days?: number[];
}

/** Box contents: "day-slot" → med id → count */
export type Box = Record<string, Record<string, number>>;
export const cell = (day: number, slot: Slot) => `${day}-${slot}`;

export function expectedBox(meds: Med[], slots: Slot[]): Box {
  const box: Box = {};
  for (let d = 0; d < 7; d++)
    for (const s of slots) {
      const here: Record<string, number> = {};
      for (const m of meds) {
        const n = m.dose[s] ?? 0;
        if (n && (!m.days || m.days.includes(d))) here[m.id] = n;
      }
      box[cell(d, s)] = here;
    }
  return box;
}

/** Cells whose contents don't match what the labels say. */
export function wrongCells(box: Box, expected: Box): string[] {
  return Object.keys(expected).filter((k) => {
    const a = box[k] ?? {};
    const b = expected[k];
    const ids = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...ids].some((id) => (a[id] ?? 0) !== (b[id] ?? 0));
  });
}

const MED_POOL: Omit<Med, 'label' | 'dose' | 'days'>[] = [
  { id: 'bp', name: 'Blood pressure pill', color: '#f2f2f2' },
  { id: 'vitd', name: 'Vitamin D', color: '#f5d142' },
  { id: 'water', name: 'Water pill', color: '#7fb3e6' },
  { id: 'chol', name: 'Cholesterol pill', color: '#f2a6c0' },
  { id: 'thy', name: 'Thyroid pill', color: '#f2a65a' },
  { id: 'iron', name: 'Iron pill', color: '#b0603a' },
];

interface Schedule {
  label: string;
  dose: Partial<Record<Slot, number>>;
  days?: number[];
  needs: Slot[];
}

const SCHEDULES: Record<1 | 2 | 3, Schedule[]> = {
  1: [
    { label: 'Take 1 tablet every morning.', dose: { morning: 1 }, needs: ['morning'] },
    { label: 'Take 1 tablet every evening.', dose: { evening: 1 }, needs: ['evening'] },
  ],
  2: [
    { label: 'Take 1 tablet twice a day, morning and evening.', dose: { morning: 1, evening: 1 }, needs: ['morning', 'evening'] },
    { label: 'Take 2 tablets every morning.', dose: { morning: 2 }, needs: ['morning'] },
    { label: 'Take 1 tablet every evening.', dose: { evening: 1 }, needs: ['evening'] },
    { label: 'Take 1 tablet every morning.', dose: { morning: 1 }, needs: ['morning'] },
  ],
  3: [
    { label: 'Take 1 tablet three times a day: morning, noon and evening.', dose: { morning: 1, noon: 1, evening: 1 }, needs: ['morning', 'noon', 'evening'] },
    { label: 'Take 1 tablet on Monday, Wednesday and Friday mornings.', dose: { morning: 1 }, days: [1, 3, 5], needs: ['morning'] },
    { label: 'Take 1 tablet at bedtime.', dose: { bedtime: 1 }, needs: ['bedtime'] },
    { label: 'Take 2 tablets in the morning and 1 in the evening.', dose: { morning: 2, evening: 1 }, needs: ['morning', 'evening'] },
    { label: 'Take 1 tablet every morning, except Sunday.', dose: { morning: 1 }, days: [1, 2, 3, 4, 5, 6], needs: ['morning'] },
  ],
};

const SLOT_ORDER: Slot[] = ['morning', 'noon', 'evening', 'bedtime'];

/** Level 1: one med. Level 2: two meds. Level 3: three meds with harder schedules. */
export function makePillTask(level: 1 | 2 | 3): { meds: Med[]; slots: Slot[] } {
  const count = level;
  const meds = shuffle(MED_POOL).slice(0, count);
  const pool = level === 3 ? [...SCHEDULES[3], ...SCHEDULES[2]] : SCHEDULES[level];
  const first = pick(SCHEDULES[3]);
  const schedules = level === 3 ? [first, ...shuffle(pool.filter((s) => s !== first)).slice(0, 2)] : shuffle(pool).slice(0, count);
  const out = meds.map((m, i) => ({ ...m, label: schedules[i].label, dose: schedules[i].dose, days: schedules[i].days }));
  const needed = new Set(schedules.flatMap((s) => s.needs));
  // Always show morning and evening so the box looks like a real AM/PM organizer.
  needed.add('morning');
  needed.add('evening');
  return { meds: out, slots: SLOT_ORDER.filter((s) => needed.has(s)) };
}

// ---------- Find Them All (cancellation) ----------

export interface ScanCell {
  id: number;
  symbol: string;
  target: boolean;
  col: number;
  row: number;
}

export function makeScanGrid(cols: number, rows: number, target: string, distractors: string[], targetsPerHalf: number): ScanCell[] {
  const total = cols * rows;
  const left: number[] = [];
  const right: number[] = [];
  for (let i = 0; i < total; i++) ((i % cols) < cols / 2 ? left : right).push(i);
  const targets = new Set([...shuffle(left).slice(0, targetsPerHalf), ...shuffle(right).slice(0, targetsPerHalf)]);
  return Array.from({ length: total }, (_, i) => ({
    id: i,
    col: i % cols,
    row: Math.floor(i / cols),
    target: targets.has(i),
    symbol: targets.has(i) ? target : pick(distractors),
  }));
}

export interface ScanResult {
  found: number;
  total: number;
  missedLeft: number;
  missedRight: number;
  extra: number;
}

/** Misses are split by side: many more on one side can be a sign of neglect. */
export function scanResult(grid: ScanCell[], tapped: readonly number[], cols: number): ScanResult {
  const hit = new Set(tapped);
  const targets = grid.filter((c) => c.target);
  const missed = targets.filter((c) => !hit.has(c.id));
  return {
    found: targets.length - missed.length,
    total: targets.length,
    missedLeft: missed.filter((c) => c.col < cols / 2).length,
    missedRight: missed.filter((c) => c.col >= cols / 2).length,
    extra: grid.filter((c) => !c.target && hit.has(c.id)).length,
  };
}

// ---------- Switch It Up (trails) ----------

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Numbers only (1, 2, 3 …) or switching (1, A, 2, B …). */
export function trailSequence(switching: boolean, count: number): string[] {
  if (!switching) return Array.from({ length: count }, (_, i) => String(i + 1));
  return Array.from({ length: count }, (_, i) => (i % 2 === 0 ? String(i / 2 + 1) : LETTERS[(i - 1) / 2]));
}

/** Random positions (0–100 %) that don't overlap. */
export function scatter(count: number, minGap = 13): { x: number; y: number }[] {
  for (let attempt = 0; attempt < 50; attempt++) {
    const pts: { x: number; y: number }[] = [];
    let tries = 0;
    while (pts.length < count && tries < 2000) {
      tries++;
      const p = { x: randInt(6, 94), y: randInt(6, 94) };
      if (pts.every((q) => Math.hypot(q.x - p.x, q.y - p.y) >= minGap)) pts.push(p);
    }
    if (pts.length === count) return pts;
    minGap -= 1;
  }
  return Array.from({ length: count }, (_, i) => ({ x: 10 + (i % 5) * 20, y: 10 + Math.floor(i / 5) * 20 }));
}
