// Progress across sessions and the mastery rule. A "session" here is one day of practice.
import type { Skill, Trial } from './log';

export interface DaySummary {
  date: string; // YYYY-MM-DD (local)
  total: number;
  independent: number;
}

const localDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function byDay(trials: Trial[]): DaySummary[] {
  const days = new Map<string, DaySummary>();
  for (const t of trials) {
    const date = localDate(t.at);
    const day = days.get(date) ?? { date, total: 0, independent: 0 };
    day.total += 1;
    if (t.independent) day.independent += 1;
    days.set(date, day);
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export interface MasteryRule {
  pct: number;
  sessions: number;
  min: number;
}

export interface SkillProgress {
  skill: Skill;
  days: DaySummary[];
  /** The sessions that count toward mastery (enough problems), most recent last */
  counted: DaySummary[];
  mastered: boolean;
}

/** Mastered = the last N sessions with enough problems were all at or above the target. */
export function skillProgress(trials: Trial[], skill: Skill, rule: MasteryRule): SkillProgress {
  const days = byDay(trials.filter((t) => t.skill === skill));
  const counted = days.filter((d) => d.total >= rule.min).slice(-rule.sessions);
  const mastered = counted.length >= rule.sessions && counted.every((d) => (d.independent / d.total) * 100 >= rule.pct);
  return { skill, days, counted, mastered };
}

export const pctOf = (d: DaySummary) => (d.total === 0 ? 0 : Math.round((d.independent / d.total) * 100));
