import { useMemo } from 'react';
import { Question } from '../../components/Question';
import { SENTENCES } from '../../data/hub/language';
import { SetFrame, TaskPage, useDeck, useSet } from '../../hub/Drill';
import { makeOptions } from '../../hub/helps';
import { pick } from '../../lib/random';
import { useSettings } from '../../lib/settings';

export default function FinishSentence() {
  const { settings } = useSettings();
  const items = useMemo(() => SENTENCES.filter((s) => s.level === settings.languageLevel), [settings.languageLevel]);
  const draw = useDeck(items, 'finish-sentence');
  const set = useSet(() => {
    const item = draw();
    return { item, other: pick(item.foils), ...makeOptions([item.answer, ...item.foils].slice(0, Math.max(2, settings.choiceCount))) };
  });
  const { item, other, options, answer } = set.item;
  const mode = settings.responseMode;
  const [before, after] = item.stem.split('___');
  const spoken = item.stem.replace('___', 'blank');
  const firstSound = item.answer.slice(0, item.answer.length > 4 ? 2 : 1);

  return (
    <TaskPage id="finish-sentence">
      <SetFrame set={set} noun="sentences" bank={{ items, task: 'finish-sentence' }}>
        <Question
          key={set.n}
          module="finish-sentence"
          skill="sentenceComp"
          level={`L${item.level} ${mode}`}
          prompt={
            <p className="q-text big-q">
              {before}
              <span className="blank">{'      '}</span>
              {after}
            </p>
          }
          say={spoken}
          logText={item.stem}
          answerLabel={item.answer}
          helpNames={['First sound', 'Pick one', 'Say it with me']}
          helps={[
            { content: <p className="sound-cue">It starts with <b>“{firstSound}…”</b></p>, say: `It starts with ${firstSound}.` },
            {
              content: (
                <p>
                  Is it <b>{item.answer}</b> or <b>{other}</b>?
                </p>
              ),
              say: `Is it ${item.answer}, or ${other}?`,
            },
            {
              content: (
                <>
                  <p className="model-word">{item.stem.replace('___', item.answer)}</p>
                  <p className="help-finish">Say it with me.</p>
                </>
              ),
              say: `${item.stem.replace('___', item.answer)} Say it with me.`,
            },
          ]}
          {...(mode === 'spoken'
            ? { kind: 'scored' as const }
            : mode === 'typed'
              ? { kind: 'text' as const, accepted: [item.answer, ...(item.also ?? [])], inputLabel: 'The missing word' }
              : { kind: 'choice' as const, options, answer })}
          onLogged={set.onLogged}
          onNext={set.next}
        />
      </SetFrame>
    </TaskPage>
  );
}
