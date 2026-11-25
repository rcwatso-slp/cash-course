import { useEffect, useMemo, useState } from 'react';
import { ReadAloud } from '../../components/ReadAloud';
import { FLUENCY_CATEGORIES } from '../../data/hub/language';
import { TaskPage, useDeck } from '../../hub/Drill';
import { logChoice } from '../../lib/log';
import { useSettings } from '../../lib/settings';
import { clock, useNow } from '../../lib/timers';

type Phase = 'ready' | 'running' | 'done';

export default function CategoryNaming() {
  const { settings } = useSettings();
  const items = useMemo(() => FLUENCY_CATEGORIES.filter((c) => c.level === settings.languageLevel), [settings.languageLevel]);
  const draw = useDeck(items, 'category-naming');
  const [cat, setCat] = useState(draw);
  const [seconds, setSeconds] = useState(60);
  const [goal, setGoal] = useState(settings.languageLevel === 1 ? 5 : 10);
  const [phase, setPhase] = useState<Phase>('ready');
  const [count, setCount] = useState(0);
  const [endAt, setEndAt] = useState(0);
  const [showExamples, setShowExamples] = useState(false);
  const now = useNow(phase === 'running', 250);
  const left = (endAt - now) / 1000;

  useEffect(() => {
    if (phase === 'running' && left <= 0) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, left]);

  function finish() {
    setPhase('done');
    logChoice({
      nickname: settings.nickname,
      module: 'category-naming',
      skill: 'fluency',
      level: `L${settings.languageLevel}, ${seconds}s`,
      question: `Name ${cat.name.toLowerCase()}`,
      answer: `${count} named (goal ${goal})`,
      correct: count >= goal,
      helpLevel: showExamples ? 1 : 0,
      seconds,
    });
  }

  const intro = `Name as many ${cat.name.toLowerCase()} as you can. You have ${seconds === 60 ? 'one minute' : `${seconds} seconds`}.`;

  return (
    <TaskPage id="category-naming">
      <div className="question fluency">
        <div className="q-prompt">
          <div>
            <p className="muted">Name as many as you can:</p>
            <p className="category-name">{cat.name}</p>
          </div>
          <ReadAloud text={intro} />
        </div>

        {phase === 'ready' && (
          <>
            <div className="fluency-options">
              <label>
                Time{' '}
                <select value={seconds} onChange={(e) => setSeconds(Number(e.target.value))}>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={90}>90 seconds</option>
                </select>
              </label>
              <label>
                Goal{' '}
                <select value={goal} onChange={(e) => setGoal(Number(e.target.value))}>
                  {[3, 5, 8, 10, 12, 15, 20].map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="button-row">
              <button
                className="primary"
                onClick={() => {
                  setCount(0);
                  setShowExamples(false);
                  setEndAt(Date.now() + seconds * 1000);
                  setPhase('running');
                }}
              >
                Start the timer
              </button>
              <button className="button" onClick={() => setCat(draw())}>
                Different category
              </button>
            </div>
          </>
        )}

        {phase !== 'ready' && (
          <>
            <p className="big-timer">{phase === 'running' ? clock(left) : 'Time!'}</p>
            <p className="scored-label">Clinician: tap +1 for each one they name. Don’t count repeats.</p>
            <div className="counter">
              <button className="button counter-minus" onClick={() => setCount(Math.max(0, count - 1))} aria-label="Take one away">
                −1
              </button>
              <span className="counter-value" aria-live="polite">
                {count}
              </span>
              <button className="primary counter-plus" onClick={() => setCount(count + 1)} disabled={phase === 'done'}>
                +1
              </button>
            </div>
            {phase === 'running' && (
              <div className="button-row">
                <button className="button" onClick={() => setShowExamples(true)} disabled={showExamples}>
                  Stuck? Show 2 examples
                </button>
                <button className="button" onClick={finish}>
                  Stop early
                </button>
              </div>
            )}
            {showExamples && <p className="help-card level-1">Like: {cat.examples.slice(0, 2).join(', ')} …</p>}
          </>
        )}

        {phase === 'done' && (
          <>
            <p className={`feedback ${count >= goal ? 'good' : 'info'}`}>
              {count} named. Goal: {goal}.
            </p>
            <button
              className="primary next-btn"
              onClick={() => {
                setCat(draw());
                setPhase('ready');
                setCount(0);
              }}
              autoFocus
            >
              Next category →
            </button>
          </>
        )}
      </div>
    </TaskPage>
  );
}
