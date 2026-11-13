import { useEffect, useState } from 'react';
import { Question } from '../../components/Question';
import { PICTURES, type PictureWord } from '../../data/hub/pictures';
import { SetFrame, TaskPage, useSet } from '../../hub/Drill';
import { chance, pick, shuffle } from '../../lib/random';
import { useSettings } from '../../lib/settings';
import { speak } from '../../lib/speech';

export interface Direction {
  text: string;
  /** Words to tap, in order. */
  sequence: string[];
  steps: number;
}

const GRID = { 1: 4, 2: 6, 3: 8 } as const;
export const columnsFor = (n: number) => (n <= 4 ? 2 : n <= 6 ? 3 : 4);
const the = (p: PictureWord) => `the ${p.word}`;
const aOrAn = (word: string) => `${/^[aeiou]/.test(word) ? 'an' : 'a'} ${word}`;

/** Builds one direction for the pictures on the board (laid out in rows of `columnsFor`). */
export function makeDirection(board: PictureWord[], level: 1 | 2 | 3): Direction {
  const [a, b, c] = shuffle(board);
  if (level === 1) {
    return chance(0.6)
      ? { text: `Touch ${the(a)}.`, sequence: [a.word], steps: 1 }
      : { text: `Touch ${the(a)}, then ${the(b)}.`, sequence: [a.word, b.word], steps: 2 };
  }
  if (level === 2) {
    const kind = pick(['two', 'three', 'before']);
    if (kind === 'two') return { text: `Touch ${the(a)} and then ${the(b)}.`, sequence: [a.word, b.word], steps: 2 };
    if (kind === 'three') return { text: `Touch ${the(a)}, ${the(b)}, and then ${the(c)}.`, sequence: [a.word, b.word, c.word], steps: 3 };
    return { text: `Before you touch ${the(a)}, touch ${the(b)}.`, sequence: [b.word, a.word], steps: 2 };
  }
  // Level 3: conditions, "after" and "except"
  const kind = pick(['ifYes', 'ifNo', 'after', 'except']);
  if (kind === 'ifYes') return { text: `If there is ${aOrAn(b.word)} on the screen, touch ${the(c)}. If not, touch ${the(a)}.`, sequence: [c.word], steps: 1 };
  if (kind === 'ifNo') {
    const absent = pick(PICTURES.filter((p) => !board.some((x) => x.word === p.word || x.emoji === p.emoji)));
    return { text: `If there is ${aOrAn(absent.word)} on the screen, touch ${the(a)}. If not, touch ${the(b)}.`, sequence: [b.word], steps: 1 };
  }
  if (kind === 'after') return { text: `Touch ${the(a)} after you touch ${the(b)} and ${the(c)}.`, sequence: [b.word, c.word, a.word], steps: 3 };
  const top = board.slice(0, columnsFor(board.length));
  const skip = pick(top);
  const rest = top.filter((p) => p !== skip);
  return { text: `Touch every picture in the top row, left to right, except ${the(skip)}.`, sequence: rest.map((p) => p.word), steps: rest.length };
}

export const sameOrder = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

export default function FollowDirections() {
  const { settings } = useSettings();
  const level = settings.languageLevel;
  const set = useSet(() => {
    const board = shuffle(PICTURES.filter((p) => p.level <= 2)).slice(0, GRID[level]);
    return { board, dir: makeDirection(board, level) };
  });
  const { board, dir } = set.item;
  const [taps, setTaps] = useState<string[]>([]);

  useEffect(() => {
    setTaps([]);
    if (!set.done) speak(dir.text);
  }, [set.n, set.done, dir.text]);

  return (
    <TaskPage id="follow-directions">
      <SetFrame set={set} noun="directions">
        <Question
          key={set.n}
          module="follow-directions"
          skill="directions"
          level={`L${level}, ${dir.steps} step${dir.steps > 1 ? 's' : ''}`}
          prompt={<p className="q-text">{dir.text}</p>}
          say={dir.text}
          logText={dir.text}
          answerLabel={dir.sequence.join(', then ')}
          kind="custom"
          check={(v) => (sameOrder(v as string[], dir.sequence) ? { ok: true } : { ok: false, message: 'Not quite. Clear it and try again.' })}
          render={(submit, solved) => (
            <div className="directions">
              <div className={`direction-grid n-${board.length}`}>
                {board.map((p) => {
                  const order = taps.indexOf(p.word);
                  return (
                    <button
                      key={p.word}
                      className={`direction-pic ${order >= 0 ? 'tapped' : ''}`}
                      disabled={solved}
                      aria-label={p.word}
                      onClick={() => setTaps(order >= 0 ? taps : [...taps, p.word])}
                    >
                      <span aria-hidden="true">{p.emoji}</span>
                      {order >= 0 && <span className="tap-order">{order + 1}</span>}
                    </button>
                  );
                })}
              </div>
              {!solved && (
                <div className="button-row">
                  <button className="button" onClick={() => setTaps([])} disabled={taps.length === 0}>
                    Clear
                  </button>
                  <button className="primary" onClick={() => submit(taps)} disabled={taps.length === 0}>
                    Done
                  </button>
                </div>
              )}
            </div>
          )}
          helps={[
            { content: <p>Listen again. Do one part at a time.</p>, say: `Listen again. ${dir.text}` },
            {
              content: <p>Start with the <b>{dir.sequence[0]}</b>.</p>,
              say: `Start with the ${dir.sequence[0]}.`,
            },
            {
              content: (
                <p>
                  Touch: <b>{dir.sequence.join(' → ')}</b>
                </p>
              ),
              say: `Touch ${dir.sequence.join(', then ')}.`,
            },
          ]}
          onLogged={set.onLogged}
          onNext={set.next}
        />
      </SetFrame>
    </TaskPage>
  );
}
