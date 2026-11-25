// Visit times: when the clinician started and stopped working with each patient.
// Stored on this device only, like the rest of the data.
import { readJSON, removeKey, writeJSON } from './storage';

export const VISITS_KEY = 'hub.visits.v1';

export interface Visit {
  id: string;
  profileId: string;
  /** Nickname at the time, for exports. */
  nickname: string;
  start: number; // ms
  end: number | null; // null while the visit is running
}

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const getVisits = (): Visit[] => readJSON<Visit[]>(VISITS_KEY, []).filter((v) => v && typeof v.start === 'number');
export const replaceVisits = (visits: Visit[]): void => writeJSON(VISITS_KEY, [...visits].sort((a, b) => a.start - b.start));
export const clearVisits = (): void => removeKey(VISITS_KEY);

export const runningVisit = (profileId: string, visits = getVisits()): Visit | undefined => visits.find((v) => v.profileId === profileId && v.end === null);

/** Start a visit now. If one is already running for this patient, that one is kept. */
export function startVisit(profileId: string, nickname: string, now = Date.now()): Visit {
  const visits = getVisits();
  const running = runningVisit(profileId, visits);
  if (running) return running;
  const v: Visit = { id: newId(), profileId, nickname, start: now, end: null };
  replaceVisits([...visits, v]);
  return v;
}

export function stopVisit(profileId: string, now = Date.now()): Visit | undefined {
  const visits = getVisits();
  const running = runningVisit(profileId, visits);
  if (!running) return undefined;
  const stopped = { ...running, end: Math.max(now, running.start) };
  replaceVisits(visits.map((v) => (v.id === running.id ? stopped : v)));
  return stopped;
}

/** Add a finished visit by hand (the clinician forgot to start the timer). */
export function addVisit(profileId: string, nickname: string, start: number, end: number): Visit {
  const v: Visit = { id: newId(), profileId, nickname, start, end };
  replaceVisits([...getVisits(), v]);
  return v;
}

export function updateVisit(id: string, patch: Partial<Pick<Visit, 'start' | 'end'>>): void {
  replaceVisits(getVisits().map((v) => (v.id === id ? { ...v, ...patch } : v)));
}

export const deleteVisit = (id: string): void => replaceVisits(getVisits().filter((v) => v.id !== id));

/**
 * Whole minutes between the clock times shown, so 10:02 to 10:39 is 37 minutes
 * (the seconds are dropped from both ends, the way the times are written down).
 */
export function minutesBetween(start: number, end: number): number {
  return Math.max(0, Math.floor(end / 60000) - Math.floor(start / 60000));
}

export const visitMinutes = (v: Visit, now = Date.now()): number => minutesBetween(v.start, v.end ?? now);

/** Local date as YYYY-MM-DD. */
export function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const visitsOn = (day: string, visits = getVisits()): Visit[] => visits.filter((v) => dayKey(v.start) === day);

/** Minutes per patient on one day, plus the total. */
export function dayTotals(visits: Visit[], now = Date.now()): { byPatient: { profileId: string; nickname: string; minutes: number; visits: number }[]; total: number } {
  const map = new Map<string, { profileId: string; nickname: string; minutes: number; visits: number }>();
  for (const v of visits) {
    const row = map.get(v.profileId) ?? { profileId: v.profileId, nickname: v.nickname, minutes: 0, visits: 0 };
    row.minutes += visitMinutes(v, now);
    row.visits += 1;
    row.nickname = v.nickname;
    map.set(v.profileId, row);
  }
  const byPatient = [...map.values()];
  return { byPatient, total: byPatient.reduce((s, r) => s + r.minutes, 0) };
}

/** "HH:MM" for a time input. */
export function timeInputValue(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** The same day as `base`, at the "HH:MM" typed in. */
export function atTime(base: number, hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const d = new Date(base);
  d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  return d.getTime();
}

/** A local date "YYYY-MM-DD" at "HH:MM". */
export function dateAt(day: string, hhmm: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return null;
  return atTime(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime(), hhmm);
}

export const clockTime = (ms: number): string => new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export const minutesText = (n: number): string => `${n} minute${n === 1 ? '' : 's'}`;

const esc = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function visitsCSV(visits: Visit[], now = Date.now()): string {
  const rows = visits.map((v) =>
    [new Date(v.start).toLocaleDateString('en-US'), v.nickname, clockTime(v.start), v.end === null ? '(running)' : clockTime(v.end), visitMinutes(v, now)].map(esc).join(','),
  );
  return ['date,nickname,start,stop,minutes', ...rows].join('\n');
}

/** Combine visits from a backup with the ones on this device (by id). */
export function mergeVisits(a: Visit[], b: Visit[]): Visit[] {
  const known = new Set(a.map((v) => v.id));
  return [...a, ...(b ?? []).filter((v) => v && !known.has(v.id) && typeof v.start === 'number')].sort((x, y) => x.start - y.start);
}
