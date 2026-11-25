import { useEffect, useMemo, useState } from 'react';
import { Question } from '../../components/Question';
import { picturesUpTo, PICTURES, type PictureWord } from '../../data/hub/pictures';
import { SetFrame, TaskPage, useDeck, useSet } from '../../hub/Drill';
import { choiceHelps, makeOptions } from '../../hub/helps';
import { shuffle } from '../../lib/random';
import { useSettings } from '../../lib/settings';
import { speak } from '../../lib/speech';

/** Level 1: unrelated pictures. Level 2: same category. Level 3: same first letter, then same category. */
export function pointFoils(target: PictureWord, n: number, level: number): PictureWord[] {
  const others = PICTURES.filter((p) => p.word !== target.word && p.emoji !== target.emoji);
  const sameCat = shuffle(others.filter((p) => p.category === target.category));
  const diffCat = shuffle(others.filter((p) => p.category !== target.category));
  if (level === 1) return diffCat.slice(0, n);
  if (level === 2) return [...sameCat, ...diffCat].slice(0, n);
  const sound = shuffle(others.filter((p) => p.word[0] === target.word[0]));
  return [...new Set([...sound, ...sameCat, ...diffCat])].slice(0, n);
}

export default function PointToIt() {
  const { settings } = useSettings();
  const [hearOnly, setHearOnly] = useState(false);
  const items = useMemo(() => picturesUpTo(Math.max(2, settings.languageLevel)), [settings.languageLevel]);
  const draw = useDeck(items, 'point-to-it');
  const set = useSet(() => {
    const target = draw();
    const foils = pointFoils(target, Math.max(2, settings.choiceCount) - 1, settings.languageLevel);
    const all = [target, ...foils];
    return { target, ...makeOptions(all.map((p) => p.word), all.map((p) => p.emoji)) };
  });
  const { target, options, answer } = set.item;
  const say = `Point to the ${target.word}.`;

  // Say the word when each new item appears.
  useEffect(() => {
    if (!set.done) speak(say);
  }, [set.n, set.done, say]);

  return (
    <TaskPage id="point-to-it">
      <div className="mode-toggle" role="group" aria-label="How the word is given">
        <button aria-pressed={!hearOnly} onClick={() => setHearOnly(false)}>
          👀 Read and hear
        </button>
        <button aria-pressed={hearOnly} onClick={() => setHearOnly(true)}>
          👂 Hear only
        </button>
      </div>
      <SetFrame set={set} noun="words" bank={{ items, task: 'point-to-it' }}>
        <Question
          key={set.n}
          module="point-to-it"
          skill="wordPicture"
          level={`L${settings.languageLevel}${hearOnly ? ' heard' : ''}`}
          prompt={
            <div className="point-prompt">
              <button className="button" onClick={() => speak(say)}>
                🔊 Hear it again
              </button>
              {!hearOnly && (
                <p className="q-text">
                  Point to the <b className="target-word">{target.word}</b>.
                </p>
              )}
            </div>
          }
          say={say}
          logText={`Point to: ${target.word}`}
          answerLabel={target.word}
          kind="choice"
          options={options}
          answer={answer}
          picturesOnly
          helps={choiceHelps({ hint: target.cue, options, answer })}
          onLogged={set.onLogged}
          onNext={set.next}
        />
      </SetFrame>
    </TaskPage>
  );
}
