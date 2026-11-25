import { useEffect, useState } from 'react';
import { Question } from '../../components/Question';
import { SetFrame, TaskPage, useSet } from '../../hub/Drill';
import { pick, randInt, shuffle } from '../../lib/random';
import { useSettings } from '../../lib/settings';

export type Shape = 'circle' | 'square' | 'triangle' | 'star';
export type Color = 'red' | 'blue' | 'green';

export type Piece = { id: number; kind: 'shape'; shape: Shape; color: Color } | { id: number; kind: 'number'; value: number };

export interface ReadDo {
  board: Piece[];
  text: string;
  answer: number[];
}

const SHAPES: Shape[] = ['circle', 'square', 'triangle', 'star'];
const COLORS: Color[] = ['red', 'blue', 'green'];
const SYMBOL: Record<Shape, string> = { circle: '●', square: '■', triangle: '▲', star: '★' };
const SIZE = { 1: 8, 2: 10, 3: 12 } as const;

function makeBoard(n: number): Piece[] {
  const pieces: Piece[] = [];
  const numbers = shuffle(Array.from({ length: 12 }, (_, i) => i + 1)).slice(0, Math.floor(n / 2));
  for (const value of numbers) pieces.push({ id: 0, kind: 'number', value });
  while (pieces.length < n) pieces.push({ id: 0, kind: 'shape', shape: pick(SHAPES), color: pick(COLORS) });
  return shuffle(pieces).map((p, id) => ({ ...p, id }));
}

const isShape = (p: Piece): p is Extract<Piece, { kind: 'shape' }> => p.kind === 'shape';
const isNum = (p: Piece): p is Extract<Piece, { kind: 'number' }> => p.kind === 'number';
const plural = (s: Shape) => `${s}s`;

type Rule = { text: string; test: (p: Piece, board: Piece[]) => boolean };

function rules(level: 1 | 2 | 3, board: Piece[]): Rule[] {
  const shape = pick(SHAPES);
  const color = pick(COLORS);
  const [c2, s2] = [pick(COLORS.filter((c) => c !== color)), pick(SHAPES.filter((s) => s !== shape))];
  const k = randInt(3, 9);
  const lo = randInt(2, 6);
  const hi = lo + randInt(3, 5);
  if (level === 1)
    return [
      { text: `Tap every ${shape}.`, test: (p) => isShape(p) && p.shape === shape },
      { text: `Tap all the ${color} shapes.`, test: (p) => isShape(p) && p.color === color },
      { text: `Tap all the numbers.`, test: isNum },
      { text: `Tap the number ${pick(board.filter(isNum)).value}.`, test: () => false },
    ];
  if (level === 2)
    return [
      { text: `Tap the ${color} ${plural(shape)} and the ${c2} ${plural(s2)}.`, test: (p) => isShape(p) && ((p.color === color && p.shape === shape) || (p.color === c2 && p.shape === s2)) },
      { text: `Tap every number bigger than ${k}.`, test: (p) => isNum(p) && p.value > k },
      { text: `Tap the shapes that are not ${plural(shape)}.`, test: (p) => isShape(p) && p.shape !== shape },
      { text: `Tap every number smaller than ${k}.`, test: (p) => isNum(p) && p.value < k },
    ];
  const circles = board.filter((p) => isShape(p) && p.shape === shape).length;
  const squares = board.filter((p) => isShape(p) && p.shape === s2).length;
  return [
    { text: 'Tap every even number and every green shape.', test: (p) => (isNum(p) && p.value % 2 === 0) || (isShape(p) && p.color === 'green') },
    {
      text: `If there are more ${plural(shape)} than ${plural(s2)}, tap the ${plural(shape)}. If not, tap the ${plural(s2)}.`,
      test: (p) => isShape(p) && p.shape === (circles > squares ? shape : s2),
    },
    { text: `Tap the numbers between ${lo} and ${hi}.`, test: (p) => isNum(p) && p.value > lo && p.value < hi },
    { text: `Tap every shape that is not ${color} and not a ${shape}.`, test: (p) => isShape(p) && p.color !== color && p.shape !== shape },
  ];
}

/** A direction whose answer is at least one piece and not every piece. */
export function makeReadDo(level: 1 | 2 | 3): ReadDo {
  for (let tries = 0; tries < 200; tries++) {
    const board = makeBoard(SIZE[level]);
    const rule = pick(rules(level, board));
    let answer = board.filter((p) => rule.test(p, board)).map((p) => p.id);
    // "Tap the number N" names one number on the board.
    const m = rule.text.match(/^Tap the number (\d+)\.$/);
    if (m) answer = board.filter((p) => isNum(p) && p.value === Number(m[1])).map((p) => p.id);
    if (answer.length > 0 && answer.length < board.length) return { board, text: rule.text, answer };
  }
  const board = makeBoard(SIZE[level]);
  return { board, text: 'Tap all the numbers.', answer: board.filter(isNum).map((p) => p.id) };
}

export const sameSet = (a: number[], b: number[]) => a.length === b.length && a.every((x) => b.includes(x));

function PieceView({ p }: { p: Piece }) {
  return isShape(p) ? (
    <span className={`rd-shape rd-${p.color}`} aria-hidden="true">
      {SYMBOL[p.shape]}
    </span>
  ) : (
    <span className="rd-number" aria-hidden="true">
      {p.value}
    </span>
  );
}

const label = (p: Piece) => (isShape(p) ? `${p.color} ${p.shape}` : `number ${p.value}`);

export default function ReadAndDo() {
  const { settings } = useSettings();
  const set = useSet(() => makeReadDo(settings.languageLevel));
  const { board, text, answer } = set.item;
  const [taps, setTaps] = useState<number[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTaps([]);
    setShow(false);
  }, [set.n]);

  return (
    <TaskPage id="read-and-do" intro="Read the direction carefully. Tap what it tells you to, then press Done.">
      <SetFrame set={set} noun="directions">
        <Question
          key={set.n}
          module="read-and-do"
          skill="readDo"
          level={`L${settings.languageLevel}`}
          prompt={<p className="q-text big-q">{text}</p>}
          say={text}
          logText={text}
          answerLabel={`${answer.length} tapped`}
          kind="custom"
          check={(v) => {
            const got = v as number[];
            if (sameSet(got, answer)) return { ok: true };
            const missing = answer.filter((x) => !got.includes(x)).length;
            const extra = got.filter((x) => !answer.includes(x)).length;
            return { ok: false, message: [missing && `${missing} still to find`, extra && `${extra} that ${extra === 1 ? 'doesn’t' : 'don’t'} belong`].filter(Boolean).join(', ') + '.' };
          }}
          render={(submit, solved) => (
            <div>
              <div className="rd-board">
                {board.map((p) => {
                  const on = taps.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      className={`rd-piece ${on ? 'on' : ''} ${(show || solved) && answer.includes(p.id) ? 'target' : ''}`}
                      aria-pressed={on}
                      aria-label={label(p)}
                      disabled={solved}
                      onClick={() => setTaps(on ? taps.filter((x) => x !== p.id) : [...taps, p.id])}
                    >
                      <PieceView p={p} />
                    </button>
                  );
                })}
              </div>
              {!solved && (
                <div className="button-row">
                  <button className="button" onClick={() => setTaps([])} disabled={!taps.length}>
                    Clear
                  </button>
                  <button className="primary" onClick={() => submit(taps)}>
                    Done
                  </button>
                </div>
              )}
            </div>
          )}
          helps={[
            { content: <p>Read it again, one part at a time. What kind of things does it ask for?</p>, say: `Read it again, one part at a time. ${text}` },
            { content: <p>There {answer.length === 1 ? 'is' : 'are'} <b>{answer.length}</b> to tap.</p>, say: `There ${answer.length === 1 ? 'is' : 'are'} ${answer.length} to tap.` },
            {
              content: (
                <>
                  <p>The right ones are outlined.</p>
                  {!show && (
                    <button className="button" onClick={() => setShow(true)}>
                      Outline them
                    </button>
                  )}
                </>
              ),
              say: 'Here are the right ones. Tap them, then press Done.',
            },
          ]}
          onLogged={set.onLogged}
          onNext={set.next}
        />
      </SetFrame>
    </TaskPage>
  );
}
