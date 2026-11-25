import { describe, expect, it } from 'vitest';
import { checkWords, numberWords } from './checkbook';
import { chunksOf, goodChunks, makePuzzle, makeWorkout, possibleOwners, suggestedBreaks } from './workout';
import { clockText, durationText } from '../modules/executive/Clocks';
import { freeStarts, makeDay, time12 } from '../modules/executive/Planner';
import { makeReadDo } from '../modules/language/ReadAndDo';
import { CATEGORY_ITEMS, RIDDLES, WORD_LINKS } from '../data/hub/wordfinding';
import { PEOPLE, SCRAMBLE_SENTENCES } from '../data/hub/mental';

describe('deductions', () => {
  it('always has exactly one answer, and never states it outright', () => {
    for (let i = 0; i < 300; i++) {
      const n = 2 + (i % 3);
      const p = makePuzzle(n);
      const owners = possibleOwners(n, p.clues, p.askThing);
      expect(owners).toEqual([p.solution.indexOf(p.askThing)]);
      expect(p.clues.some((c) => c.has && c.thing === p.askThing)).toBe(false);
      expect(p.clues.length).toBeGreaterThan(0);
    }
  });
});

describe('mental workout', () => {
  it('builds the right answer for each kind', () => {
    for (const level of [1, 2, 3] as const) {
      const back = makeWorkout('backward', level);
      expect(back.answer).toEqual([...back.shown].reverse());
      expect(back.shown).toHaveLength(level + 2);
      const abc = makeWorkout('abc', level);
      expect(abc.answer).toEqual([...abc.shown].sort());
      expect(new Set(abc.shown.map((w) => w[0])).size).toBe(abc.shown.length);
      const size = makeWorkout('size', level);
      expect(new Set(size.answer)).toEqual(new Set(size.shown));
      const un = makeWorkout('unscramble', level);
      expect(SCRAMBLE_SENTENCES[level]).toContain(un.answer.join(' '));
      expect(un.shown.join(' ')).not.toBe(un.answer.join(' '));
    }
  });
});

describe('chunk it', () => {
  it('splits a number at the breaks', () => {
    expect(chunksOf('5550142', [3])).toEqual(['555', '0142']);
    expect(chunksOf('3125550142', [6, 3])).toEqual(['312', '555', '0142']);
  });
  it('accepts chunks of 2 to 4 only', () => {
    expect(goodChunks(['555', '0142'])).toBe(true);
    expect(goodChunks(['5550142'])).toBe(false);
    expect(goodChunks(['5', '550142'])).toBe(false);
  });
  it('suggests good chunks for every length used', () => {
    for (const len of [6, 7, 8, 10, 11, 12]) expect(goodChunks(chunksOf('1'.repeat(len), suggestedBreaks(len))), String(len)).toBe(true);
    expect(suggestedBreaks(10)).toEqual([3, 6]);
  });
});

describe('checkbook', () => {
  it('writes amounts the way they go on a check', () => {
    expect(checkWords(4215)).toBe('Forty-two and 15/100');
    expect(checkWords(100)).toBe('One and 00/100');
    expect(checkWords(120507)).toBe('One thousand two hundred five and 07/100');
    expect(numberWords(19)).toBe('nineteen');
    expect(numberWords(90)).toBe('ninety');
  });
});

describe('clocks and planner', () => {
  it('formats times and durations', () => {
    expect(clockText(15 * 60 + 5)).toBe('3:05');
    expect(clockText(12 * 60)).toBe('12:00');
    expect(clockText(0)).toBe('12:00');
    expect(durationText(75)).toBe('1 hour 15 minutes');
    expect(durationText(120)).toBe('2 hours');
    expect(time12(13 * 60 + 30)).toBe('1:30 PM');
    expect(time12(9 * 60)).toBe('9:00 AM');
  });
  it('makes days without overlapping plans and finds real free time', () => {
    for (let i = 0; i < 100; i++) {
      const day = makeDay(4 + (i % 3));
      for (let a = 1; a < day.length; a++) expect(day[a].start).toBeGreaterThanOrEqual(day[a - 1].start + day[a - 1].len);
      for (const t of freeStarts(day, 60)) for (const b of day) expect(t + 60 <= b.start || t >= b.start + b.len).toBe(true);
    }
  });
});

describe('read and do', () => {
  it('always asks for at least one thing and not everything', () => {
    for (let i = 0; i < 300; i++) {
      const r = makeReadDo(((i % 3) + 1) as 1 | 2 | 3);
      expect(r.answer.length).toBeGreaterThan(0);
      expect(r.answer.length).toBeLessThan(r.board.length);
    }
  });
});

describe('workbook-style content', () => {
  it('has items at every level, with the answer not among the wrong choices', () => {
    for (const list of [RIDDLES, WORD_LINKS, CATEGORY_ITEMS]) {
      for (const level of [1, 2, 3]) expect(list.filter((x) => x.level === level).length).toBeGreaterThanOrEqual(10);
      for (const x of list) {
        expect(x.foils).not.toContain(x.answer);
        expect(new Set(x.foils).size).toBe(x.foils.length);
      }
    }
  });
  it('gives each job three names that start like the job', () => {
    for (const p of PEOPLE) expect(p.names).toHaveLength(3);
    expect(new Set(PEOPLE.flatMap((p) => p.names)).size).toBe(PEOPLE.length * 3);
    expect(new Set(PEOPLE.map((p) => p.emoji)).size).toBe(PEOPLE.length);
    for (const p of PEOPLE) for (const n of p.names) expect(n[0].toLowerCase(), `${p.role} ${n}`).toBe(p.role[0]);
  });
});
