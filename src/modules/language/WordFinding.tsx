// Word-finding tasks: What Am I?, Word Links and Category Builder. Original content in data/hub/wordfinding.ts.
import { useMemo } from 'react';
import { Question } from '../../components/Question';
import { CATEGORY_ITEMS, LINK_PROMPTS, RIDDLES, WORD_LINKS, type CategoryItem } from '../../data/hub/wordfinding';
import { SetFrame, TaskPage, useDeck, useSet } from '../../hub/Drill';
import { choiceHelps, makeOptions } from '../../hub/helps';
import { pick } from '../../lib/random';
import { useSettings } from '../../lib/settings';

const atLevel = <T extends { level: number }>(items: T[], level: number) => {
  const l = items.filter((i) => i.level === level);
  return l.length ? l : items;
};

/** Spoken → clinician marks it. Typed → lenient spelling. Choose → tap one. */
function answerProps(mode: string, answer: string, also: string[] | undefined, options: ReturnType<typeof makeOptions>, inputLabel: string) {
  if (mode === 'spoken') return { kind: 'scored' as const };
  if (mode === 'typed') return { kind: 'text' as const, accepted: [answer, ...(also ?? [])], inputLabel };
  return { kind: 'choice' as const, options: options.options, answer: options.answer };
}

const firstSound = (w: string) => w.slice(0, w.length > 4 ? 2 : 1);

export function WhatAmI() {
  const { settings } = useSettings();
  const items = useMemo(() => atLevel(RIDDLES, settings.languageLevel), [settings.languageLevel]);
  const draw = useDeck(items, 'what-am-i');
  const set = useSet(() => {
    const item = draw();
    return { item, other: pick(item.foils), ...makeOptions([item.answer, ...item.foils].slice(0, Math.max(2, settings.choiceCount))) };
  });
  const { item, other } = set.item;
  const text = `${item.clues.join(' ')} What am I?`;
  return (
    <TaskPage id="what-am-i">
      <SetFrame set={set} noun="riddles" bank={{ items, task: 'what-am-i' }}>
        <Question
          key={set.n}
          module="what-am-i"
          skill="describeNaming"
          level={`L${item.level} ${settings.responseMode}`}
          prompt={
            <div>
              <ul className="clue-list">
                {item.clues.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="q-text big-q">What am I?</p>
            </div>
          }
          say={text}
          logText={item.clues.join(' ')}
          answerLabel={item.answer}
          helpNames={['First sound', 'Pick one', 'Say it with me']}
          helps={[
            { content: <p className="sound-cue">It starts with <b>“{firstSound(item.answer)}…”</b></p>, say: `It starts with ${firstSound(item.answer)}.` },
            { content: <p>Is it <b>{item.answer}</b> or <b>{other}</b>?</p>, say: `Is it ${item.answer}, or ${other}?` },
            { content: <p className="model-word">{item.answer}</p>, say: `It's ${item.answer}. Say it with me: ${item.answer}.` },
          ]}
          {...answerProps(settings.responseMode, item.answer, item.also, set.item, 'The word')}
          onLogged={set.onLogged}
          onNext={set.next}
        />
      </SetFrame>
    </TaskPage>
  );
}

export function WordLinks() {
  const { settings } = useSettings();
  const items = useMemo(() => atLevel(WORD_LINKS, settings.languageLevel), [settings.languageLevel]);
  const draw = useDeck(items, 'word-links');
  const set = useSet(() => {
    const item = draw();
    return { item, ...makeOptions([item.answer, ...item.foils].slice(0, Math.max(2, settings.choiceCount))) };
  });
  const { item, options, answer } = set.item;
  const prompt = LINK_PROMPTS[item.type](item.word);
  const hint = item.type === 'same' ? `Think of another way to say “${item.word}”.` : item.type === 'opposite' ? `What is the reverse of “${item.word}”?` : `What do you often see or use with “${item.word}”?`;
  return (
    <TaskPage id="word-links">
      <SetFrame set={set} noun="questions" bank={{ items, task: 'word-links' }}>
        <Question
          key={set.n}
          module="word-links"
          skill="wordLinks"
          level={`L${item.level} ${item.type}`}
          prompt={<p className="q-text big-q">{prompt}</p>}
          say={settings.responseMode === 'choose' ? `${prompt} ${options.map((o) => o.label).join('? ')}?` : prompt}
          logText={prompt}
          answerLabel={item.answer}
          helps={choiceHelps({ hint, options, answer })}
          {...answerProps(settings.responseMode, item.answer, undefined, set.item, 'The word')}
          onLogged={set.onLogged}
          onNext={set.next}
        />
      </SetFrame>
    </TaskPage>
  );
}

const categoryPrompt = (c: CategoryItem) => (c.kind === 'name' ? 'What group do these belong to?' : `Which one belongs in the group “${c.given[0]}”?`);

export function CategoryBuilder() {
  const { settings } = useSettings();
  const items = useMemo(() => atLevel(CATEGORY_ITEMS, settings.languageLevel), [settings.languageLevel]);
  const draw = useDeck(items, 'category-builder');
  const set = useSet(() => {
    const item = draw();
    return { item, ...makeOptions([item.answer, ...item.foils].slice(0, Math.max(2, settings.choiceCount))) };
  });
  const { item, options, answer } = set.item;
  const prompt = categoryPrompt(item);
  // "Which one fits" is always a choice; naming the group can be spoken or typed.
  const mode = item.kind === 'fits' ? 'choose' : settings.responseMode;
  return (
    <TaskPage id="category-builder">
      <SetFrame set={set} noun="questions" bank={{ items, task: 'category-builder' }}>
        <Question
          key={set.n}
          module="category-builder"
          skill="categories"
          level={`L${item.level} ${item.kind === 'name' ? 'name the group' : 'which fits'}`}
          prompt={
            <div>
              {item.kind === 'name' && (
                <ul className="word-cards">
                  {item.given.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              )}
              <p className="q-text big-q">{prompt}</p>
            </div>
          }
          say={item.kind === 'name' ? `${item.given.join(', ')}. ${prompt}` : `${prompt} ${options.map((o) => o.label).join('? ')}?`}
          logText={item.kind === 'name' ? `${item.given.join(', ')} → ?` : prompt}
          answerLabel={item.answer}
          helps={choiceHelps({
            hint: item.kind === 'name' ? `How are ${item.given[0]} and ${item.given[1]} alike?` : `Think about what all “${item.given[0]}” have in common.`,
            options,
            answer,
          })}
          {...answerProps(mode, item.answer, undefined, set.item, 'The group')}
          onLogged={set.onLogged}
          onNext={set.next}
        />
      </SetFrame>
    </TaskPage>
  );
}
