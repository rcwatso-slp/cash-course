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
