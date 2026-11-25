// Pure logic for Mental Workout, Chunk It and Deductions, so it can be tested.
import { SCRAMBLE_SENTENCES, SIZE_ITEMS, WORKOUT_WORDS } from '../data/hub/mental';
import { pick, shuffle } from './random';

// ---------- Mental Workout ----------

export type WorkoutMode = 'backward' | 'abc' | 'size' | 'unscramble';

export interface WorkoutItem {
  mode: WorkoutMode;
  /** In the order they are given. */
  shown: string[];
  /** The order the answer must be in. */
  answer: string[];
  emojis?: Record<string, string>;
}

export function makeWorkout(mode: WorkoutMode, level: 1 | 2 | 3): WorkoutItem {
  const n = level + 2; // 3, 4 or 5 words
  if (mode === 'unscramble') {
    const sentence = pick(SCRAMBLE_SENTENCES[level]);
    const words = sentence.split(' ');
    let shown = shuffle(words);
    while (shown.join(' ') === sentence) shown = shuffle(words);
    return { mode, shown, answer: words };
  }
  if (mode === 'size') {
    // Spread the picks so sizes are clearly different.
    const items = shuffle(SIZE_ITEMS).slice(0, 15);
    const chosen: typeof SIZE_ITEMS = [];
    for (const it of items) if (chosen.length < n && chosen.every((c) => Math.abs(c.rank - it.rank) >= 2)) chosen.push(it);
    const shown = shuffle(chosen);
    return {
      mode,
      shown: shown.map((c) => c.word),
      answer: [...chosen].sort((a, b) => a.rank - b.rank).map((c) => c.word),
      emojis: Object.fromEntries(chosen.map((c) => [c.word, c.emoji])),
    };
  }
  const words: string[] = [];
  for (const w of shuffle(WORKOUT_WORDS)) if (words.length < n && !words.some((x) => x[0] === w[0])) words.push(w);
  return { mode, shown: words, answer: mode === 'backward' ? [...words].reverse() : [...words].sort() };
}

// ---------- Chunk It ----------

/** Breaks are positions between digits: a break at i splits after digit i-1. */
export function chunksOf(digits: string, breaks: number[]): string[] {
  const cuts = [0, ...[...breaks].sort((a, b) => a - b), digits.length];
  return cuts.slice(1).map((end, i) => digits.slice(cuts[i], end)).filter(Boolean);
}

/** Good chunks are 2 to 4 digits long. */
export const goodChunks = (chunks: string[]): boolean => chunks.length > 1 && chunks.every((c) => c.length >= 2 && c.length <= 4);

/** A sensible default chunking: 3-3-4 for phone numbers, otherwise groups of 3 or 4. */
export function suggestedBreaks(len: number): number[] {
  if (len === 7) return [3];
  if (len === 10) return [3, 6];
  const out: number[] = [];
  let i = 0;
  while (len - i > 4) {
    i += len - i === 5 ? 2 : 3;
    out.push(i);
  }
  return out;
}

// ---------- Deductions ----------

export interface Clue {
  person: number;
  thing: number;
  has: boolean;
}

export interface Puzzle {
  /** solution[i] = index of the thing person i has. */
  solution: number[];
  clues: Clue[];
  /** Ask who has this thing. */
  askThing: number;
}

function permutations(n: number): number[][] {
  if (n === 1) return [[0]];
  const out: number[][] = [];
  for (const p of permutations(n - 1)) for (let i = 0; i <= p.length; i++) out.push([...p.slice(0, i), n - 1, ...p.slice(i)]);
  return out;
}

const fits = (perm: number[], clues: Clue[]) => clues.every((c) => (perm[c.person] === c.thing) === c.has);

/** Everyone who could have the asked-about thing, given the clues. One = the puzzle has one answer. */
export function possibleOwners(n: number, clues: Clue[], askThing: number): number[] {
  return [...new Set(permutations(n).filter((perm) => fits(perm, clues)).map((perm) => perm.indexOf(askThing)))];
}

/**
 * A clue puzzle for n people and n things with exactly one answer to "who has thing X?".
 * Clues are "does not" first, so the answer has to be worked out; the answer is never stated.
 */
export function makePuzzle(n: number, askThing = Math.floor(Math.random() * n)): Puzzle {
  const perms = permutations(n);
  const solution = pick(perms);
  const owner = solution.indexOf(askThing);
  const all: Clue[] = [];
  for (let p = 0; p < n; p++) for (let t = 0; t < n; t++) all.push({ person: p, thing: t, has: solution[p] === t });
  const usable = all.filter((c) => !(c.has && (c.person === owner || c.thing === askThing)));
  const ordered = [...shuffle(usable.filter((c) => !c.has)), ...shuffle(usable.filter((c) => c.has))];
  const clues: Clue[] = [];
  for (const c of ordered) {
    if (possibleOwners(n, clues, askThing).length === 1) break;
    const before = perms.filter((p) => fits(p, clues)).length;
    if (perms.filter((p) => fits(p, [...clues, c])).length < before) clues.push(c);
  }
  return { solution, askThing, clues: shuffle(clues) };
}
