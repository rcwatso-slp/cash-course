import { describe, expect, it } from 'vitest';
import { cell, expectedBox, firstWrongStep, makePillTask, makeScanGrid, scanResult, trailSequence, wrongCells, type Med } from './executive';
import { DEFAULT_SETTINGS, OLD_SETTINGS_KEY, PIN_KEY, PROFILES_KEY, loadStore, type ProfileStore } from './settings';
import { nextStep, recordProbe, SRT_INTERVALS, startRun } from './srt';
import { matchesWord, normalize } from './text';
import { nextSpan } from '../modules/memory/NumberRecall';
import { makeDirection } from '../modules/language/FollowDirections';
import { PICTURES } from '../data/hub/pictures';
import { SENTENCES, YES_NO } from '../data/hub/language';
import { ANALOGIES, INFERENCE, ODD_ONE_OUT, SAFETY, WHATS_WRONG } from '../data/hub/reasoning';
import { STORIES } from '../data/hub/stories';
import { TASKS } from '../hub/areas';
import { HUB_PAGES } from '../hub/routes';
import { SKILL_LABELS } from './log';

const reader = (data: Record<string, unknown>) => <T,>(key: string, fallback: T): T => (key in data ? (data[key] as T) : fallback);

describe('patient profiles', () => {
  it('turns the old Cash Course settings into the first patient and keeps the PIN', () => {
    const { store, pin, migrated } = loadStore(reader({ [OLD_SETTINGS_KEY]: { nickname: 'JD', pin: '1234', taxOn: true } }), () => 'p1');
    expect(migrated).toBe(true);
    expect(pin).toBe('1234');
    expect(store.ids).toEqual(['p1']);
    expect(store.profiles.p1.nickname).toBe('JD');
    expect(store.profiles.p1.taxOn).toBe(true);
    expect('pin' in store.profiles.p1).toBe(false);
    // An existing Cash Course user keeps seeing only Cash Course; other new settings get defaults.
    expect(store.profiles.p1.areas).toEqual(['money']);
    expect(store.profiles.p1.memoryLevel).toBe(DEFAULT_SETTINGS.memoryLevel);
  });

  it('starts one empty patient on a new device', () => {
    const { store, pin, migrated } = loadStore(reader({}), () => 'p1');
    expect(migrated).toBe(false);
    expect(pin).toBeNull();
    expect(store.profiles.p1.nickname).toBe('');
    expect(store.profiles.p1.areas).toEqual(DEFAULT_SETTINGS.areas);
  });

  it('loads saved patients and fills in settings added later', () => {
    const saved: ProfileStore = { activeId: 'b', ids: ['a', 'b'], profiles: { a: { nickname: 'A' } as never, b: { nickname: 'B' } as never } };
    const { store, pin } = loadStore(reader({ [PROFILES_KEY]: saved, [PIN_KEY]: '9999', [OLD_SETTINGS_KEY]: { pin: '1111' } }));
    expect(pin).toBe('9999');
    expect(store.activeId).toBe('b');
    expect(store.profiles.b.memoryLevel).toBe(1);
  });
});

describe('typed answers', () => {
  it('ignores case, punctuation, articles and plurals', () => {
    expect(normalize('  The Banana! ')).toBe('banana');
    expect(matchesWord('Bananas', ['banana'])).toBe(true);
    expect(matchesWord('a TV', ['television', 'tv'])).toBe(true);
  });
  it('allows a small typo in longer words only', () => {
    expect(matchesWord('umbrela', ['umbrella'])).toBe(true);
    expect(matchesWord('cap', ['cat'])).toBe(false);
    expect(matchesWord('dog', ['cat'])).toBe(false);
    expect(matchesWord('', ['cat'])).toBe(false);
  });
});

describe('spaced retrieval', () => {
  it('doubles the wait after a right answer and backs off after a miss', () => {
    expect(nextStep(0, true)).toBe(1);
    expect(nextStep(3, false)).toBe(2);
    expect(nextStep(0, false)).toBe(0);
    expect(nextStep(SRT_INTERVALS.length - 1, true)).toBe(SRT_INTERVALS.length - 1);
  });
  it('records probes and the longest interval recalled', () => {
    let run = startRun('p1', 't1');
    run = recordProbe(run, true, 0); // right away
    expect(run.index).toBe(0);
    expect(run.dueAt).toBe(30_000);
    run = recordProbe(run, true, 30_000); // after 30 s
    run = recordProbe(run, true, 90_000); // after 1 min
    expect(run.best).toBe(60);
    run = recordProbe(run, false, 210_000); // missed at 2 min
    expect(run.index).toBe(1);
    expect(run.best).toBe(60);
    expect(run.probes).toHaveLength(4);
  });
});

describe('number span', () => {
  it('goes up after an independent answer and down after two misses', () => {
    expect(nextSpan(4, true, 0)).toBe(5);
    expect(nextSpan(4, false, 1)).toBe(4);
    expect(nextSpan(4, false, 2)).toBe(3);
    expect(nextSpan(2, false, 5)).toBe(2);
  });
});

describe('put it in order', () => {
  it('finds the first step out of place', () => {
    expect(firstWrongStep(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(-1);
    expect(firstWrongStep(['a', 'c', 'b'], ['a', 'b', 'c'])).toBe(1);
    expect(firstWrongStep(['b'], ['a', 'b'])).toBe(0);
  });
});

describe('pill organizer', () => {
  const bp: Med = { id: 'bp', name: 'BP', color: '#fff', label: '', dose: { morning: 1, evening: 1 } };
  const mwf: Med = { id: 'd', name: 'D', color: '#fff', label: '', dose: { morning: 1 }, days: [1, 3, 5] };

  it('fills the box from the labels', () => {
    const box = expectedBox([bp, mwf], ['morning', 'evening']);
    expect(box[cell(0, 'morning')]).toEqual({ bp: 1 });
    expect(box[cell(1, 'morning')]).toEqual({ bp: 1, d: 1 });
    expect(box[cell(1, 'evening')]).toEqual({ bp: 1 });
  });

  it('flags only the wrong boxes', () => {
    const expected = expectedBox([bp], ['morning', 'evening']);
    const filled = JSON.parse(JSON.stringify(expected));
    expect(wrongCells(filled, expected)).toEqual([]);
    filled[cell(2, 'evening')] = {};
    filled[cell(4, 'morning')] = { bp: 2 };
    expect(wrongCells(filled, expected).sort()).toEqual([cell(2, 'evening'), cell(4, 'morning')].sort());
  });

  it('makes tasks with the right number of medicines and an AM/PM box', () => {
    for (const level of [1, 2, 3] as const) {
      const t = makePillTask(level);
      expect(t.meds).toHaveLength(level);
      expect(t.slots).toContain('morning');
      expect(t.slots).toContain('evening');
      for (const m of t.meds) for (const s of Object.keys(m.dose)) expect(t.slots).toContain(s);
    }
  });
});

describe('find them all', () => {
  it('splits misses by left and right side', () => {
    const grid = makeScanGrid(6, 4, '★', ['●'], 3);
    const targets = grid.filter((c) => c.target);
    expect(targets).toHaveLength(6);
    const leftTargets = targets.filter((c) => c.col < 3);
    // Tap only the left-side targets, plus one wrong cell.
    const wrong = grid.find((c) => !c.target)!;
    const r = scanResult(grid, [...leftTargets.map((c) => c.id), wrong.id], 6);
    expect(r).toEqual({ found: 3, total: 6, missedLeft: 0, missedRight: 3, extra: 1 });
  });
});

describe('switch it up', () => {
  it('builds number and switching sequences', () => {
    expect(trailSequence(false, 4)).toEqual(['1', '2', '3', '4']);
    expect(trailSequence(true, 6)).toEqual(['1', 'A', '2', 'B', '3', 'C']);
  });
});

describe('follow directions', () => {
  it('only asks for pictures that are on the board', () => {
    const board = PICTURES.slice(0, 8);
    for (let i = 0; i < 200; i++) {
      const level = ((i % 3) + 1) as 1 | 2 | 3;
      const d = makeDirection(board.slice(0, level === 1 ? 4 : level === 2 ? 6 : 8), level);
      expect(d.sequence.length).toBeGreaterThan(0);
      for (const w of d.sequence) expect(board.some((p) => p.word === w)).toBe(true);
    }
  });
});

describe('content', () => {
  it('has a page and a name for every task', () => {
    for (const t of TASKS) expect(HUB_PAGES[t.id], t.id).toBeTypeOf('function');
    expect(Object.keys(HUB_PAGES).sort()).toEqual(TASKS.map((t) => t.id).sort());
  });
  it('has a label for every skill', () => {
    for (const label of Object.values(SKILL_LABELS)) expect(label).toBeTruthy();
  });
  it('has no repeated picture words or emoji', () => {
    const words = PICTURES.map((p) => p.word);
    const emoji = PICTURES.map((p) => p.emoji);
    expect(new Set(words).size).toBe(words.length);
    expect(new Set(emoji).size).toBe(emoji.length);
  });
  it('has items at every level', () => {
    for (const list of [YES_NO, SENTENCES, ODD_ONE_OUT, ANALOGIES, SAFETY, INFERENCE, WHATS_WRONG, STORIES])
      for (const level of [1, 2, 3]) expect(list.some((x) => x.level === level)).toBe(true);
  });
  it('has distinct options in every multiple-choice item', () => {
    for (const item of [...ODD_ONE_OUT, ...ANALOGIES, ...SAFETY, ...INFERENCE, ...WHATS_WRONG]) {
      expect(new Set(item.options).size, item.prompt).toBe(item.options.length);
    }
    for (const s of SENTENCES) expect(s.foils).not.toContain(s.answer);
    for (const st of STORIES) for (const q of st.questions) expect(new Set(q.options).size, q.q).toBe(q.options.length);
  });
});
