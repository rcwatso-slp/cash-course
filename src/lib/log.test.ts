import { describe, expect, it } from 'vitest';
import { summarize, toCSV, type Trial } from './log';

const trial = (over: Partial<Trial>): Trial => ({
  id: '1', at: '2026-10-11T17:00:00.000Z', nickname: 'JT', module: 'quickChange', skill: 'change',
  level: 'C4', question: 'Change from $10.00 for $2.16', answer: '$7.84', attempts: 1, helpLevel: 0,
  seconds: 12, calculator: false, independent: true, ...over,
});

describe('summarize', () => {
  it('counts independence and help levels', () => {
    const s = summarize([
      trial({}),
      trial({ attempts: 2, independent: false }),
      trial({ helpLevel: 2, independent: false }),
      trial({ helpLevel: 3, attempts: 3, independent: false }),
    ]);
    expect(s).toEqual({ total: 4, independent: 1, noHelpMoreTries: 1, byHelp: [2, 0, 1, 1] });
  });
});

describe('toCSV', () => {
  it('writes a header and quotes fields with commas', () => {
    const csv = toCSV([trial({ question: 'Add: $1,000.00 + $2.00' })]);
    const [header, row] = csv.split('\n');
    expect(header.split(',')[0]).toBe('date');
    expect(row).toContain('"Add: $1,000.00 + $2.00"');
    expect(row).toContain('Quick Change');
    expect(row).toContain('None');
  });
});
