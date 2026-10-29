import { RESTAURANTS } from '../data/restaurants';
import { STORES } from '../data/stores';
import { readJSON, removeKey, writeJSON } from './storage';

// Restaurants and stores log under their own id (mcdoogles, chipoodle, falmart...).
export type ModuleId = string;
export type Skill =
  | 'subtotal' | 'tax' | 'total' | 'pay' | 'change' | 'checkChange' | 'shipping' | 'left' | 'moreNeeded' | 'weeks'
  | 'afford' | 'tip' | 'balance' | 'extraCost'
  | 'betterDeal' | 'dealSave' | 'readReceipt' | 'checkReceipt' | 'scam';

const MODULE_LABELS: Record<string, string> = {
  quickChange: 'Quick Change',
  checkChange: 'Check the Change',
  savings: 'Saving Up',
  afford: 'Can I Afford It?',
  bank: 'Chaise Bank',
  doordosh: 'DoorDosh',
  deals: 'Better Deal?',
  receipts: 'Read the Receipt',
  scams: 'Spot the Scam',
  ...Object.fromEntries([...RESTAURANTS, ...STORES].map((x) => [x.id, x.name])),
};

export const moduleLabel = (id: string): string => MODULE_LABELS[id] ?? id;

export const SKILL_LABELS: Record<Skill, string> = {
  subtotal: 'Add up the order',
  tax: 'Figure the tax',
  total: 'Total (with tax/shipping)',
  pay: 'Pick bills to pay',
  change: 'Make change',
  checkChange: 'Check the change',
  shipping: 'Free shipping?',
  left: 'Money left on card',
  moreNeeded: 'How much more to save',
  weeks: 'Weeks to save',
  afford: 'Enough money?',
  tip: 'Figure the tip',
  balance: 'New bank balance',
  extraCost: 'Extra cost of delivery',
  betterDeal: 'Pick the better deal',
  dealSave: 'How much you save',
  readReceipt: 'Read a receipt',
  checkReceipt: 'Find receipt mistakes',
  scam: 'Spot a scam',
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

/** Log a one-click choice that isn't a Question (closing a scam pop-up). */
export function logChoice(t: { nickname: string; module: ModuleId; skill: Skill; level: string; question: string; answer: string; correct: boolean; seconds: number }): void {
  addTrial({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    nickname: t.nickname,
    module: t.module,
    skill: t.skill,
    level: t.level,
    question: t.question,
    answer: t.answer,
    attempts: t.correct ? 1 : 2,
    helpLevel: 0,
    seconds: t.seconds,
    calculator: false,
    independent: t.correct,
  });
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
      d.toLocaleDateString('en-US'), d.toLocaleTimeString('en-US'), t.nickname, moduleLabel(t.module),
      SKILL_LABELS[t.skill], t.level, t.question, t.answer, t.attempts, t.helpLevel,
      HELP_NAMES[t.helpLevel], t.independent ? 'yes' : 'no', t.seconds, t.calculator ? 'yes' : 'no',
    ].map(esc).join(',');
  });
  return [header.join(','), ...rows].join('\n');
}
