import { useEffect, useState } from 'react';
import { Question } from '../../components/Question';
import { ReadAloud } from '../../components/ReadAloud';
import { SetDone, SetProgress } from '../../components/SetDone';
import { TaskPage } from '../../hub/Drill';
import { randInt } from '../../lib/random';
import { useSettings } from '../../lib/settings';

export interface NumberItem {
  label: string;
  digits: string;
  /** How it's written on screen, e.g. 555-0142. */
  shown: string;
}

const rand = (n: number) => Array.from({ length: n }, (_, i) => String(i === 0 ? randInt(1, 9) : randInt(0, 9))).join('');

export function makeNumber(span: number): NumberItem {
  const d = rand(span);
  if (span <= 3) return { label: 'Your room number is', digits: d, shown: d };
  if (span === 4) return { label: 'The door code is', digits: d, shown: d.split('').join(' ') };
  if (span === 5) return { label: 'The ZIP code is', digits: d, shown: d };
  if (span === 6) return { label: 'Your order number is', digits: d, shown: `${d.slice(0, 3)} ${d.slice(3)}` };
  if (span === 7) return { label: 'The phone number is', digits: d, shown: `${d.slice(0, 3)}-${d.slice(3)}` };
  return { label: 'The phone number is', digits: d, shown: `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` };
}

/** Span goes up after a right answer on your own, down after two misses in a row. */
export function nextSpan(span: number, independent: boolean, missesInARow: number): number {
  if (independent) return Math.min(span + 1, 10);
  if (missesInARow >= 2) return Math.max(span - 1, 2);
  return span;
}

const START_SPAN = { 1: 3, 2: 5, 3: 7 } as const;

export default function NumberRecall() {
  const { settings } = useSettings();
  const [backward, setBackward] = useState(false);
  const [span, setSpan] = useState<number>(START_SPAN[settings.memoryLevel]);
  const [item, setItem] = useState(() => makeNumber(START_SPAN[settings.memoryLevel]));
  const [showing, setShowing] = useState(true);
  const [n, setN] = useState(1);
  const [independent, setIndependent] = useState(0);
  const [misses, setMisses] = useState(0);
  const [longest, setLongest] = useState(0);
  const setLength = settings.setLength;

  // Hide automatically after about one second per digit plus two.
  useEffect(() => {
    if (!showing) return;
    const t = setTimeout(() => setShowing(false), (item.digits.length + 2) * 1000);
    return () => clearTimeout(t);
  }, [showing, item]);

  const answer = backward ? item.digits.split('').reverse().join('') : item.digits;
  const spoken = item.digits.split('').join(' ');

  function next(nextSpanValue: number) {
    setSpan(nextSpanValue);
    setItem(makeNumber(nextSpanValue));
    setShowing(true);
    setN(n + 1);
  }

  if (setLength > 0 && n > setLength) {
    return (
      <TaskPage id="number-recall">
        <SetDone
          count={setLength}
          independent={independent}
          noun="numbers"
          onAgain={() => {
            setN(1);
            setIndependent(0);
            setLongest(0);
            setShowing(true);
          }}
        />
        <p className="muted">Longest number remembered on your own: {longest || '—'} digits.</p>
      </TaskPage>
    );
  }

  return (
    <TaskPage id="number-recall">
      <div className="mode-toggle" role="group" aria-label="Direction">
        <button aria-pressed={!backward} onClick={() => setBackward(false)}>
          Forward
        </button>
        <button aria-pressed={backward} onClick={() => setBackward(true)}>
          Backward
        </button>
      </div>
      <SetProgress n={n} of={setLength} noun="numbers" />
      {showing ? (
        <div className="question number-card">
          <div className="q-prompt">
            <p className="q-text">{item.label}</p>
            <ReadAloud text={`${item.label} ${spoken}`} />
          </div>
          <p className="big-number">{item.shown}</p>
          <button className="primary" onClick={() => setShowing(false)} autoFocus>
            Got it. Hide it →
          </button>
        </div>
      ) : (
        <Question
          key={`${n}-${backward}`}
          module="number-recall"
          skill="numberSpan"
          level={`${item.digits.length} digits ${backward ? 'backward' : 'forward'}`}
          prompt={<p className="q-text">{backward ? `Say the number backward. Start with the last number.` : `What was the number?`}</p>}
          say={backward ? 'Say the number backward. Start with the last number.' : 'What was the number?'}
          logText={`${item.label} ${item.shown}${backward ? ' (backward)' : ''}`}
          answerLabel={answer.split('').join(' ')}
          {...(settings.responseMode === 'spoken'
            ? { kind: 'scored' as const }
            : { kind: 'text' as const, accepted: [answer], digits: true, inputLabel: 'The number' })}
          helps={[
            { content: <p>It starts with <b>{answer[0]}</b>.</p>, say: `It starts with ${answer[0]}.` },
            {
              content: (
                <p className="big-number small">
                  {answer.slice(0, Math.ceil(answer.length / 2)).split('').join(' ')} {'_ '.repeat(Math.floor(answer.length / 2))}
                </p>
              ),
              say: `The first part is ${answer.slice(0, Math.ceil(answer.length / 2)).split('').join(' ')}.`,
            },
            { content: <p className="big-number small">{answer.split('').join(' ')}</p>, say: `The answer is ${answer.split('').join(' ')}.` },
          ]}
          onLogged={(t) => {
            if (t.independent) {
              setIndependent((x) => x + 1);
              setLongest((x) => Math.max(x, item.digits.length));
              setMisses(0);
            } else setMisses((m) => m + 1);
          }}
          onNext={() => next(nextSpan(span, misses === 0, misses))}
        />
      )}
    </TaskPage>
  );
}
