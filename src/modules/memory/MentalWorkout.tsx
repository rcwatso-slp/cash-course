import { useEffect, useState } from 'react';
import { Question } from '../../components/Question';
import { ReadAloud } from '../../components/ReadAloud';
import { SetFrame, TaskPage, useSet } from '../../hub/Drill';
import { shuffle } from '../../lib/random';
import { useSettings } from '../../lib/settings';
import { speak } from '../../lib/speech';
import { makeWorkout, type WorkoutItem, type WorkoutMode } from '../../lib/workout';

const MODES: { id: WorkoutMode; label: string; ask: string }[] = [
  { id: 'backward', label: 'Backward', ask: 'Say the words backward. Start with the last one.' },
  { id: 'abc', label: 'ABC order', ask: 'Put the words in ABC order.' },
  { id: 'size', label: 'Smallest to biggest', ask: 'Put them in order from smallest to biggest.' },
  { id: 'unscramble', label: 'Unscramble', ask: 'Put the words in order to make a sentence.' },
];

export default function MentalWorkout() {
  const { settings } = useSettings();
  const level = settings.memoryLevel;
  const [mode, setMode] = useState<WorkoutMode>('backward');
  const set = useSet(() => makeWorkout(mode, level));
  const [showing, setShowing] = useState(true);
  const [taps, setTaps] = useState<string[]>([]);
  const item: WorkoutItem = set.item;
  const info = MODES.find((m) => m.id === item.mode)!;
  // Unscramble keeps the words on screen; the others hide them so they are held in mind.
  const hides = item.mode !== 'unscramble';

  useEffect(() => {
    setShowing(true);
    setTaps([]);
  }, [set.n, item]);

  // The effect below starts a new set in the new mode.
  const changeMode = (m: WorkoutMode) => setMode(m);

  // useSet captured the mode when it was created; re-draw when the mode changes.
  useEffect(() => {
    if (item.mode !== mode) set.again();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, item.mode]);

  const pool = shuffleOnce(item);
  const spoken = settings.responseMode === 'spoken';

  return (
    <TaskPage id="mental-workout" intro="Hold the words in your mind and move them around.">
      <div className="mode-toggle" role="group" aria-label="Kind of workout">
        {MODES.map((m) => (
          <button key={m.id} aria-pressed={mode === m.id} onClick={() => changeMode(m.id)}>
            {m.label}
          </button>
        ))}
      </div>
      <SetFrame set={set} noun="lists">
        {showing && hides ? (
          <div className="question">
            <div className="q-prompt">
              <p className="q-text">Remember these words:</p>
              <ReadAloud text={item.shown.join(', ')} />
            </div>
            <ul className="word-cards">
              {item.shown.map((w) => (
                <li key={w}>
                  {item.emojis?.[w] && <span className="word-pic">{item.emojis[w]}</span>}
                  <span>{w}</span>
                </li>
              ))}
            </ul>
            <div className="button-row">
              <button className="button" onClick={() => speak(item.shown.join('... '))}>
                🔊 Read them to me
              </button>
              <button className="primary" onClick={() => setShowing(false)} autoFocus>
                Hide them →
              </button>
            </div>
          </div>
        ) : (
          <Question
            key={`${set.n}-${item.mode}`}
            module="mental-workout"
            skill="mentalManip"
            level={`${info.label}, ${item.shown.length} words`}
            prompt={<p className="q-text">{info.ask}</p>}
            say={hides ? info.ask : `${info.ask} The words are: ${item.shown.join(', ')}.`}
            logText={`${info.label}: ${item.shown.join(', ')}`}
            answerLabel={item.mode === 'unscramble' ? item.answer.join(' ') : item.answer.join(', ')}
            helpNames={['First word', 'See them again', 'Answer']}
            helps={[
              { content: <p>Start with <b>{item.answer[0]}</b>.</p>, say: `Start with ${item.answer[0]}.` },
              { content: <p>The words were: {item.shown.join(', ')}.</p>, say: `The words were: ${item.shown.join(', ')}.` },
              { content: <p><b>{item.answer.join(' → ')}</b></p>, say: `The answer is: ${item.answer.join(', ')}.` },
            ]}
            {...(spoken
              ? { kind: 'scored' as const }
              : {
                  kind: 'custom' as const,
                  check: (v: unknown) => {
                    const got = v as string[];
                    if (got.join(' ') === item.answer.join(' ')) return { ok: true };
                    const right = got.findIndex((w, i) => w !== item.answer[i]);
                    setTaps(got.slice(0, right));
                    return { ok: false, message: right === 0 ? 'The first one isn’t right yet.' : `The first ${right} ${right === 1 ? 'is' : 'are'} right. Try again from there.` };
                  },
                  render: (submit: (v: unknown) => void, solved: boolean) => (
                    <div className="sequence">
                      <p className="tap-answer" aria-live="polite">
                        {taps.length ? taps.join(' → ') : <span className="muted">Tap the words in order…</span>}
                      </p>
                      {!solved && (
                        <>
                          <div className="choice-grid">
                            {pool.map((w) => (
                              <button key={w} className="choice-btn" disabled={taps.includes(w)} onClick={() => setTaps([...taps, w])}>
                                {item.emojis?.[w] && <span className="choice-picture">{item.emojis[w]}</span>}
                                <span className="choice-label">{w}</span>
                              </button>
                            ))}
                          </div>
                          <div className="button-row">
                            <button className="button" onClick={() => setTaps([])} disabled={!taps.length}>
                              Start over
                            </button>
                            <button className="primary" onClick={() => submit(taps)} disabled={taps.length !== item.answer.length}>
                              Check
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ),
                })}
            onLogged={set.onLogged}
            onNext={set.next}
          />
        )}
      </SetFrame>
    </TaskPage>
  );
}

/** Keep the same tap order for an item while it's on screen. */
const pools = new WeakMap<WorkoutItem, string[]>();
function shuffleOnce(item: WorkoutItem): string[] {
  if (!pools.has(item)) pools.set(item, item.mode === 'unscramble' ? item.shown : shuffle(item.shown));
  return pools.get(item)!;
}
