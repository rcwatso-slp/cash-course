// Every task that draws from a fixed list of questions, with the list the patient gets at their
// current level. Used by the clinician's Question bank view. Keep in step with the tasks.
import { FLUENCY_CATEGORIES, SENTENCES, YES_NO } from '../data/hub/language';
import { PICTURES, picturesUpTo } from '../data/hub/pictures';
import { ANALOGIES, INFERENCE, ODD_ONE_OUT, SAFETY, WHATS_WRONG, type ReasonItem } from '../data/hub/reasoning';
import { SEQUENCES, sequencesFor } from '../data/hub/sequences';
import { CLEAR_SPEECH, LOUD_PHRASES, PACING } from '../data/hub/speech';
import { STORIES } from '../data/hub/stories';
import { WRAP_ITEMS, WRAP_STEPS_QUIZ } from '../data/hub/wrap';
import { CATEGORY_ITEMS, RIDDLES, WORD_LINKS } from '../data/hub/wordfinding';
import { strategyById, SWALLOW_SCENARIOS } from '../data/hub/swallow';
import type { Settings } from '../lib/settings';
import type { AreaId } from './types';

export interface Bank {
  task: string;
  area: AreaId;
  /** What this patient gets now (their level). */
  current: readonly unknown[];
  /** Every level. */
  all: readonly unknown[];
  /** For a second list inside one task. */
  title?: string;
}

const atLevel = <T extends { level: number }>(items: readonly T[], level: number) => {
  const l = items.filter((i) => i.level === level);
  return l.length ? l : items;
};

const reason = (task: string, items: ReasonItem[], s: Settings): Bank => ({ task, area: 'reasoning', current: atLevel(items, s.reasoningLevel), all: items });

/** Swallow strategy questions are built from the patient's own plan; only `q` matters for tracking. */
export function swallowQuestions(strategies: string[]): { q: string }[] {
  return [
    ...strategies.map(strategyById).filter((x) => !!x).map((x) => ({ q: x!.ask })),
    ...SWALLOW_SCENARIOS.map((x) => ({ q: x.q })),
  ];
}

export function banksFor(s: Settings): Bank[] {
  return [
    { task: 'wrap', area: 'memory', current: atLevel(WRAP_ITEMS, s.memoryLevel), all: WRAP_ITEMS },
    { task: 'wrap-steps', area: 'memory', current: WRAP_STEPS_QUIZ, all: WRAP_STEPS_QUIZ, title: 'WRAP: learn the steps' },
    { task: 'story-recall', area: 'memory', current: atLevel(STORIES, s.memoryLevel), all: STORIES },
    { task: 'name-it', area: 'language', current: picturesUpTo(s.languageLevel), all: PICTURES },
    { task: 'point-to-it', area: 'language', current: picturesUpTo(Math.max(2, s.languageLevel)), all: PICTURES },
    { task: 'yes-or-no', area: 'language', current: atLevel(YES_NO, s.languageLevel), all: YES_NO },
    { task: 'finish-sentence', area: 'language', current: atLevel(SENTENCES, s.languageLevel), all: SENTENCES },
    { task: 'what-am-i', area: 'language', current: atLevel(RIDDLES, s.languageLevel), all: RIDDLES },
    { task: 'word-links', area: 'language', current: atLevel(WORD_LINKS, s.languageLevel), all: WORD_LINKS },
    { task: 'category-builder', area: 'language', current: atLevel(CATEGORY_ITEMS, s.languageLevel), all: CATEGORY_ITEMS },
    { task: 'category-naming', area: 'language', current: atLevel(FLUENCY_CATEGORIES, s.languageLevel), all: FLUENCY_CATEGORIES },
    { task: 'loud-clear', area: 'speech', current: LOUD_PHRASES, all: LOUD_PHRASES },
    { task: 'say-it-clearly', area: 'speech', current: CLEAR_SPEECH[s.speechLevel], all: Object.values(CLEAR_SPEECH).flat() },
    { task: 'pacing-board', area: 'speech', current: PACING[s.speechLevel], all: Object.values(PACING).flat() },
    { task: 'swallow-strategies', area: 'swallow', current: swallowQuestions(s.strategies), all: swallowQuestions(s.strategies) },
    reason('odd-one-out', ODD_ONE_OUT, s),
    reason('analogies', ANALOGIES, s),
    reason('safety', SAFETY, s),
    reason('inference', INFERENCE, s),
    reason('whats-wrong', WHATS_WRONG, s),
    { task: 'put-in-order', area: 'executive', current: sequencesFor(s.executiveLevel), all: SEQUENCES },
  ];
}
