import { useEffect, useState } from 'react';
import { Question } from '../../components/Question';
import { ReadAloud } from '../../components/ReadAloud';
import { SetFrame, TaskPage, useSet } from '../../hub/Drill';
import { pick, randInt } from '../../lib/random';
import { useSettings } from '../../lib/settings';
import { chunksOf, goodChunks, suggestedBreaks } from '../../lib/workout';

const KINDS: Record<1 | 2 | 3, { label: string; len: number }[]> = {
  1: [{ label: 'phone number', len: 7 }, { label: 'confirmation code', len: 6 }],
  2: [{ label: 'phone number with area code', len: 10 }, { label: 'order number', len: 8 }],
  3: [{ label: 'account number', len: 12 }, { label: 'phone number with area code', len: 10 }, { label: 'card number', len: 11 }],
};

function makeNumber(level: 1 | 2 | 3) {
  const kind = pick(KINDS[level]);
  const digits = Array.from({ length: kind.len }, (_, i) => String(i === 0 ? randInt(2, 9) : randInt(0, 9))).join('');
  return { label: kind.label, digits };
}

const sayChunks = (chunks: string[]) => chunks.map((c) => c.split('').join(' ')).join(', ... ');

export default function ChunkIt() {
  const { settings } = useSettings();
  const set = useSet(() => makeNumber(settings.memoryLevel));
  const { label, digits } = set.item;
  const [breaks, setBreaks] = useState<number[]>([]);
  const [stage, setStage] = useState<'chunk' | 'study' | 'recall'>('chunk');
  const [msg, setMsg] = useState<string | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const chunks = chunksOf(digits, breaks);

  useEffect(() => {
    setBreaks([]);
    setStage('chunk');
    setMsg(null);
    setHintUsed(false);
  }, [set.n, digits]);

  const toggle = (i: number) => setBreaks(breaks.includes(i) ? breaks.filter((b) => b !== i) : [...breaks, i]);

  return (
    <TaskPage id="chunk-it" intro="Long numbers are easier to remember in small chunks, like a phone number: 555 … 0142.">
      <SetFrame set={set} noun="numbers">
        {stage === 'chunk' && (
          <div className="question">
            <div className="q-prompt">
              <p className="q-text">
                Here is a {label}. Tap between the numbers to break it into chunks of 2, 3 or 4.
              </p>
              <ReadAloud text={`Here is a ${label}: ${digits.split('').join(' ')}. Break it into chunks of 2, 3 or 4.`} />
            </div>
            <div className="chunk-row" aria-label="Number with places to break it">
              {digits.split('').map((d, i) => (
                <span key={i} className="chunk-cell">
                  {i > 0 && (
                    <button className={`chunk-gap ${breaks.includes(i) ? 'on' : ''}`} onClick={() => toggle(i)} aria-pressed={breaks.includes(i)} aria-label={`Break before digit ${i + 1}`}>
                      {breaks.includes(i) ? '|' : '·'}
                    </button>
                  )}
                  <span className="chunk-digit">{d}</span>
                </span>
              ))}
            </div>
            <p className="chunk-preview">{chunks.join('   ')}</p>
            {msg && <p className="feedback info">{msg}</p>}
            <div className="button-row">
              <button
                className="button"
                onClick={() => {
                  setBreaks(suggestedBreaks(digits.length));
                  setHintUsed(true);
                }}
              >
                Show me a good way
              </button>
              <button
                className="primary"
                onClick={() => {
                  if (goodChunks(chunks)) {
                    setMsg(null);
                    setStage('study');
                  } else setMsg('Make every chunk 2, 3 or 4 numbers long.');
                }}
              >
                These are my chunks →
              </button>
            </div>
          </div>
        )}

        {stage === 'study' && (
          <div className="question number-card">
            <div className="q-prompt">
              <p className="q-text">Say it in chunks, two or three times. Then hide it.</p>
              <ReadAloud text={sayChunks(chunks)} />
            </div>
            <p className="big-number">{chunks.join('  ')}</p>
            <button className="primary" onClick={() => setStage('recall')} autoFocus>
              Hide it →
            </button>
          </div>
        )}

        {stage === 'recall' && (
          <Question
            key={set.n}
            module="chunk-it"
            skill="chunking"
            level={`${digits.length} digits${hintUsed ? ', chunks shown' : ''}`}
            prompt={<p className="q-text">What was the {label}?</p>}
            say={`What was the ${label}?`}
            logText={`${label}: ${chunks.join(' ')}`}
            answerLabel={chunks.join(' ')}
            helps={[
              { content: <p>It started with <b>{chunks[0]}</b>.</p>, say: `It started with ${chunks[0].split('').join(' ')}.` },
              { content: <p className="big-number small">{chunks.slice(0, -1).join('  ')}  …</p>, say: `The first chunks were ${sayChunks(chunks.slice(0, -1))}.` },
              { content: <p className="big-number small">{chunks.join('  ')}</p>, say: `It was ${sayChunks(chunks)}.` },
            ]}
            {...(settings.responseMode === 'spoken'
              ? { kind: 'scored' as const }
              : { kind: 'text' as const, accepted: [digits], digits: true, inputLabel: `The ${label}` })}
            onLogged={set.onLogged}
            onNext={set.next}
          />
        )}
      </SetFrame>
    </TaskPage>
  );
}
