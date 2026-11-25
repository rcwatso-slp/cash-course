// Orientation checks: is the patient oriented to person, place, time and situation (A&O ×0–4)?
// The clinician asks and marks each one. Stored on this device only.
import { readJSON, removeKey, writeJSON } from './storage';

export const ORIENTATION_KEY = 'hub.orientation.v1';

export type OrientDomain = 'person' | 'place' | 'time' | 'situation';
/** yes = oriented on their own, cue = oriented with a cue, no = not oriented, null = not checked. */
export type OrientMark = 'yes' | 'cue' | 'no' | null;
export type OrientMarks = Record<OrientDomain, OrientMark>;

export const DOMAINS: { id: OrientDomain; label: string; ask: string[] }[] = [
  { id: 'person', label: 'Person', ask: ['What is your name?', 'When is your birthday?', 'Who is this? (family photo, visitor)'] },
  { id: 'place', label: 'Place', ask: ['Where are you right now?', 'What kind of place is this?', 'What city are we in?'] },
  { id: 'time', label: 'Time', ask: ['What year is it?', 'What month is it?', 'What day of the week is it?', 'Is it morning or afternoon?'] },
  { id: 'situation', label: 'Situation', ask: ['Why are you here?', 'What happened that you needed help?', 'What are we working on?'] },
];

export const MARK_LABELS: Record<Exclude<OrientMark, null>, string> = { yes: 'Oriented', cue: 'With cue', no: 'Not oriented' };
export const MARK_SYMBOL: Record<Exclude<OrientMark, null>, string> = { yes: '✓', cue: '~', no: '✗' };

export interface OrientCheck {
  id: string;
  profileId: string;
  nickname: string;
  at: number; // ms
  marks: OrientMarks;
  note: string;
}

export const EMPTY_MARKS: OrientMarks = { person: null, place: null, time: null, situation: null };

export const getChecks = (): OrientCheck[] => readJSON<OrientCheck[]>(ORIENTATION_KEY, []).filter((c) => c && c.marks && typeof c.at === 'number');
export const replaceChecks = (checks: OrientCheck[]): void => writeJSON(ORIENTATION_KEY, [...checks].sort((a, b) => a.at - b.at));
export const clearChecks = (): void => removeKey(ORIENTATION_KEY);
export const checksFor = (profileId: string, checks = getChecks()): OrientCheck[] => checks.filter((c) => c.profileId === profileId);

export function saveCheck(profileId: string, nickname: string, marks: OrientMarks, note = '', at = Date.now()): OrientCheck {
  const c: OrientCheck = { id: `${at}-${Math.random().toString(36).slice(2, 8)}`, profileId, nickname, at, marks: { ...marks }, note: note.trim() };
  replaceChecks([...getChecks(), c]);
  return c;
}

export const deleteCheck = (id: string): void => replaceChecks(getChecks().filter((c) => c.id !== id));

const domainsWhere = (marks: OrientMarks, test: (m: OrientMark) => boolean) => DOMAINS.filter((d) => test(marks[d.id])).map((d) => d.id);

/** Oriented ×N: domains the patient got on their own. */
export const orientedCount = (marks: OrientMarks): number => domainsWhere(marks, (m) => m === 'yes').length;
/** Counting the ones they got with a cue too. */
export const withCueCount = (marks: OrientMarks): number => domainsWhere(marks, (m) => m === 'yes' || m === 'cue').length;
export const checkedCount = (marks: OrientMarks): number => domainsWhere(marks, (m) => m !== null).length;

const names = (ids: OrientDomain[]) => {
  const xs = ids.map((id) => DOMAINS.find((d) => d.id === id)!.label.toLowerCase());
  return xs.length <= 2 ? xs.join(' and ') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
};

/** The details after "Oriented ×N": "With a cue: time (×3 with cues). Not oriented to situation." */
export function orientDetail(marks: OrientMarks, withYes = true): string {
  const yes = domainsWhere(marks, (m) => m === 'yes');
  const cue = domainsWhere(marks, (m) => m === 'cue');
  const no = domainsWhere(marks, (m) => m === 'no');
  const skipped = domainsWhere(marks, (m) => m === null);
  const parts: string[] = [];
  if (withYes && yes.length) parts.push(`Oriented to ${names(yes)}.`);
  if (cue.length) parts.push(`With a cue: ${names(cue)} (×${yes.length + cue.length} with cues).`);
  if (no.length) parts.push(`Not oriented to ${names(no)}.`);
  if (skipped.length && skipped.length < 4) parts.push(`Not checked: ${names(skipped)}.`);
  return parts.join(' ');
}

/** "Oriented ×3 (person, place and time). Not oriented to situation." */
export function orientSummary(marks: OrientMarks): string {
  const yes = domainsWhere(marks, (m) => m === 'yes');
  return [`Oriented ×${yes.length}${yes.length ? ` (${names(yes)})` : ''}.`, orientDetail(marks, false)].filter(Boolean).join(' ');
}

export interface DomainStats {
  domain: OrientDomain;
  checked: number;
  yes: number;
  cue: number;
  no: number;
  /** Most recent first. */
  recent: Exclude<OrientMark, null>[];
}

export function domainStats(checks: OrientCheck[]): DomainStats[] {
  const newest = [...checks].sort((a, b) => b.at - a.at);
  return DOMAINS.map(({ id }) => {
    const marks = newest.map((c) => c.marks[id]).filter((m): m is Exclude<OrientMark, null> => m !== null);
    return {
      domain: id,
      checked: marks.length,
      yes: marks.filter((m) => m === 'yes').length,
      cue: marks.filter((m) => m === 'cue').length,
      no: marks.filter((m) => m === 'no').length,
      recent: marks.slice(0, 10),
    };
  });
}

const esc = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const markText = (m: OrientMark) => (m ? MARK_LABELS[m].toLowerCase() : 'not checked');

export function checksCSV(checks: OrientCheck[]): string {
  const rows = checks.map((c) => {
    const d = new Date(c.at);
    return [
      d.toLocaleDateString('en-US'), d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), c.nickname,
      ...DOMAINS.map((x) => markText(c.marks[x.id])), orientedCount(c.marks), withCueCount(c.marks), c.note,
    ].map(esc).join(',');
  });
  return ['date,time,nickname,person,place,time_oriented,situation,oriented_x,oriented_x_with_cues,note', ...rows].join('\n');
}

export function mergeChecks(a: OrientCheck[], b: OrientCheck[]): OrientCheck[] {
  const known = new Set(a.map((c) => c.id));
  return [...a, ...(b ?? []).filter((c) => c && c.marks && !known.has(c.id))].sort((x, y) => x.at - y.at);
}
