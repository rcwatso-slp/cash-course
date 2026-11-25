import { beforeEach, describe, expect, it } from 'vitest';
import {
  atTime, dateAt, dayKey, dayTotals, getVisits, mergeVisits, minutesBetween, runningVisit, startVisit, stopVisit, timeInputValue, visitsCSV, type Visit,
} from './visits';
import { checksCSV, domainStats, EMPTY_MARKS, orientedCount, orientSummary, saveCheck, getChecks, withCueCount, type OrientCheck } from './orientation';

// A small in-memory localStorage for the tests that save data.
beforeEach(() => {
  const data = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
});

const at = (h: number, m: number, s = 0) => new Date(2026, 10, 25, h, m, s).getTime();

describe('visit times', () => {
  it('counts the minutes between the clock times shown', () => {
    expect(minutesBetween(at(10, 2, 40), at(10, 39, 10))).toBe(37);
    expect(minutesBetween(at(10, 2, 0), at(10, 2, 59))).toBe(0);
    expect(minutesBetween(at(9, 55), at(11, 5))).toBe(70);
    expect(minutesBetween(at(11, 0), at(10, 0))).toBe(0);
  });

  it('starts, keeps one running visit per patient, and stops', () => {
    const a = startVisit('p1', 'JD', at(10, 0));
    expect(startVisit('p1', 'JD', at(10, 5)).id).toBe(a.id);
    startVisit('p2', 'MK', at(10, 10));
    expect(runningVisit('p1')?.id).toBe(a.id);
    const done = stopVisit('p1', at(10, 45, 30));
    expect(done?.end).toBe(at(10, 45, 30));
    expect(runningVisit('p1')).toBeUndefined();
    expect(runningVisit('p2')).toBeDefined();
    expect(getVisits()).toHaveLength(2);
  });

  it('adds up minutes per patient for a day', () => {
    const visits: Visit[] = [
      { id: '1', profileId: 'p1', nickname: 'JD', start: at(9, 0), end: at(9, 30) },
      { id: '2', profileId: 'p2', nickname: 'MK', start: at(10, 0), end: at(10, 45) },
      { id: '3', profileId: 'p1', nickname: 'JD', start: at(14, 0), end: null },
    ];
    const t = dayTotals(visits, at(14, 20));
    expect(t.total).toBe(95);
    expect(t.byPatient.find((r) => r.profileId === 'p1')).toMatchObject({ minutes: 50, visits: 2 });
    expect(visitsCSV(visits, at(14, 20)).split('\n')[3]).toContain('(running),20');
  });

  it('edits times with a time input on the same day', () => {
    expect(timeInputValue(at(9, 5))).toBe('09:05');
    expect(atTime(at(9, 5), '14:30')).toBe(at(14, 30));
    expect(atTime(at(9, 5), 'later')).toBeNull();
    expect(dateAt('2026-11-25', '08:15')).toBe(at(8, 15));
    expect(dayKey(at(23, 59))).toBe('2026-11-25');
  });

  it('merges visits from a backup without doubling them', () => {
    const a: Visit[] = [{ id: '1', profileId: 'p1', nickname: 'JD', start: at(9, 0), end: at(9, 30) }];
    const b: Visit[] = [a[0], { id: '2', profileId: 'p1', nickname: 'JD', start: at(8, 0), end: at(8, 20) }];
    expect(mergeVisits(a, b).map((v) => v.id)).toEqual(['2', '1']);
  });
});

describe('orientation', () => {
  const marks = { person: 'yes', place: 'yes', time: 'cue', situation: 'no' } as const;

  it('counts oriented ×N on their own and with cues', () => {
    expect(orientedCount(marks)).toBe(2);
    expect(withCueCount(marks)).toBe(3);
    expect(orientedCount({ person: 'yes', place: 'yes', time: 'yes', situation: 'yes' })).toBe(4);
    expect(orientedCount(EMPTY_MARKS)).toBe(0);
  });

  it('writes a plain summary', () => {
    expect(orientSummary(marks)).toBe('Oriented ×2 (person and place). With a cue: time (×3 with cues). Not oriented to situation.');
    expect(orientSummary({ person: 'yes', place: 'yes', time: 'yes', situation: null })).toBe('Oriented ×3 (person, place and time). Not checked: situation.');
  });

  it('keeps data for each area over time', () => {
    saveCheck('p1', 'JD', marks, '', at(9, 0));
    saveCheck('p1', 'JD', { person: 'yes', place: 'yes', time: 'yes', situation: null }, 'Used the calendar', at(10, 0));
    const checks = getChecks();
    expect(checks).toHaveLength(2);
    const time = domainStats(checks).find((d) => d.domain === 'time')!;
    expect(time).toMatchObject({ checked: 2, yes: 1, cue: 1, no: 0 });
    expect(time.recent).toEqual(['yes', 'cue']); // newest first
    expect(domainStats(checks).find((d) => d.domain === 'situation')!.checked).toBe(1);
    const csv = checksCSV(checks as OrientCheck[]).split('\n');
    expect(csv[1]).toContain('oriented,oriented,with cue,not oriented,2,3');
    expect(csv[2]).toContain('not checked,3,3,Used the calendar');
  });
});

import { matchesParts } from './text';
import { WRAP_ITEMS, WRAP_STEPS_QUIZ } from '../data/hub/wrap';

describe('WRAP', () => {
  it('checks answers with several parts in any order', () => {
    const parts = [['tuesday', 'tue'], ['2 30', '230', 'two thirty']];
    expect(matchesParts('Tuesday at 2:30', parts)).toBe(true);
    expect(matchesParts('2:30 on tue', parts)).toBe(true);
    expect(matchesParts('Thursday at 2:30', parts)).toBe(false);
    expect(matchesParts('Tuesday', parts)).toBe(false);
    expect(matchesParts('milk bread stamps', [['milk'], ['bread'], ['stamp']])).toBe(true);
    expect(matchesParts('', parts)).toBe(false);
  });

  it('has at least 10 items at each level, and every answer fits its own parts but no wrong choice does', () => {
    for (const level of [1, 2, 3]) expect(WRAP_ITEMS.filter((x) => x.level === level).length).toBeGreaterThanOrEqual(10);
    expect(new Set(WRAP_ITEMS.map((x) => x.id)).size).toBe(WRAP_ITEMS.length);
    for (const x of WRAP_ITEMS) {
      expect(matchesParts(x.answer, x.parts), x.id).toBe(true);
      for (const w of x.wrong) expect(matchesParts(w, x.parts), `${x.id}: ${w}`).toBe(false);
      expect(new Set([x.answer, ...x.wrong]).size, x.id).toBe(4);
    }
  });

  it('has step questions with four different choices', () => {
    for (const q of WRAP_STEPS_QUIZ) expect(new Set(q.options).size, q.q).toBe(4);
  });
});
