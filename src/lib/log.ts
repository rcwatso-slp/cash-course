import { readJSON, removeKey, writeJSON } from './storage';

export type ModuleId = 'mcdoogles' | 'quickChange' | 'checkChange';
export type Skill = 'subtotal' | 'tax' | 'total' | 'pay' | 'change' | 'checkChange';

export const MODULE_LABELS: Record<ModuleId, string> = {
  mcdoogles: 'McDoogles',
  quickChange: 'Quick Change',
  checkChange: 'Check the Change',
};

export const SKILL_LABELS: Record<Skill, string> = {
  subtotal: 'Add up the order',
  tax: 'Figure the tax',
  total: 'Total with tax',
  pay: 'Pick bills to pay',
  change: 'Make change',
  checkChange: 'Check the change',
};

export interface Trial {
  id: string;
  at: string; // ISO timestamp
  nickname: string;
  module: ModuleId;
  skill: Skill;
  level: string;
  question: string;
  answer: string;
  attempts: number; // graded tries, including the correct one
  helpLevel: 0 | 1 | 2 | 3; // highest help level reached
  seconds: number;
  calculator: boolean;
  independent: boolean; // right on the first try with no help
}

const TRIALS_KEY = 'cashcourse.trials.v1';
const SESSION_KEY = 'cashcourse.sessionStart.v1';

export function getTrials(): Trial[] {
  return readJSON<Trial[]>(TRIALS_KEY, []);
}

export function addTrial(trial: Trial): void {
  writeJSON(TRIALS_KEY, [...getTrials(), trial]);
}

export function replaceTrials(trials: Trial[]): void {
  writeJSON(TRIALS_KEY, trials);
}

export function clearTrials(): void {
  removeKey(TRIALS_KEY);
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** A session starts when the clinician says so, or automatically on the first use each day. */
export function getSessionStart(): number {
  const saved = readJSON<number | null>(SESSION_KEY, null);
  if (saved && sameDay(new Date(saved), new Date())) return saved;
  const now = Date.now();
  writeJSON(SESSION_KEY, now);
  return now;
}

export function startNewSession(): void {
  writeJSON(SESSION_KEY, Date.now());
}

export function sessionTrials(nickname: string): Trial[] {
  const start = getSessionStart();
  return getTrials().filter((t) => Date.parse(t.at) >= start && t.nickname === nickname);
}

export interface Summary {
  total: number;
  independent: number;
  noHelpMoreTries: number;
  byHelp: [number, number, number, number];
}

export function summarize(trials: Trial[]): Summary {
  const s: Summary = { total: trials.length, independent: 0, noHelpMoreTries: 0, byHelp: [0, 0, 0, 0] };
  for (const t of trials) {
    s.byHelp[t.helpLevel] += 1;
    if (t.independent) s.independent += 1;
    else if (t.helpLevel === 0) s.noHelpMoreTries += 1;
  }
  return s;
}

export const percent = (n: number, d: number) => (d === 0 ? '–' : `${Math.round((n / d) * 100)}%`);

const HELP_NAMES = ['None', 'Hint', 'More help', 'Answer shown'];

export function toCSV(trials: Trial[]): string {
  const header = [
    'date', 'time', 'nickname', 'activity', 'skill', 'level', 'question', 'answer',
    'attempts', 'help_level', 'help_name', 'independent', 'seconds', 'calculator',
  ];
  const esc = (v: string | number | boolean) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = trials.map((t) => {
    const d = new Date(t.at);
    return [
      d.toLocaleDateString('en-US'), d.toLocaleTimeString('en-US'), t.nickname, MODULE_LABELS[t.module],
      SKILL_LABELS[t.skill], t.level, t.question, t.answer, t.attempts, t.helpLevel,
      HELP_NAMES[t.helpLevel], t.independent ? 'yes' : 'no', t.seconds, t.calculator ? 'yes' : 'no',
    ].map(esc).join(',');
  });
  return [header.join(','), ...rows].join('\n');
}
