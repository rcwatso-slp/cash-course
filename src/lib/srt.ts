// Spaced retrieval: recall the same fact at longer and longer intervals.
// Right → the next interval doubles. Missed → give the answer, have them say it,
// and go back to the last interval that worked.
import { readJSON, writeJSON } from './storage';

export const SRT_INTERVALS = [30, 60, 120, 240, 480, 960, 1920]; // seconds

export function nextStep(index: number, correct: boolean): number {
  if (correct) return Math.min(index + 1, SRT_INTERVALS.length - 1);
  return Math.max(index - 1, 0);
}

export interface SrtRun {
  profileId: string;
  targetId: string;
  /** Index into SRT_INTERVALS for the wait that is running now. -1 = not started (immediate recall first). */
  index: number;
  /** When it is time to ask. null = ask now. */
  dueAt: number | null;
  /** Longest interval recalled correctly in this run, in seconds. */
  best: number;
  probes: { at: number; interval: number; correct: boolean }[];
  startedAt: number;
}

const KEY = 'hub.srt.v1';

/** One run at a time on the device, so a banner can show it on every page. */
export const getRun = (): SrtRun | null => readJSON<SrtRun | null>(KEY, null);
export const saveRun = (run: SrtRun | null): void => {
  writeJSON(KEY, run);
  window.dispatchEvent(new Event('srt-change'));
};

export function startRun(profileId: string, targetId: string): SrtRun {
  return { profileId, targetId, index: -1, dueAt: null, best: 0, probes: [], startedAt: Date.now() };
}

/** Record a probe. Returns the updated run with the next wait scheduled. */
export function recordProbe(run: SrtRun, correct: boolean, now = Date.now()): SrtRun {
  const interval = run.index < 0 ? 0 : SRT_INTERVALS[run.index];
  const index = run.index < 0 ? (correct ? 0 : 0) : nextStep(run.index, correct);
  return {
    ...run,
    index,
    dueAt: now + SRT_INTERVALS[index] * 1000,
    best: correct ? Math.max(run.best, interval) : run.best,
    probes: [...run.probes, { at: now, interval, correct }],
  };
}
