import { useState } from 'react';
import { TaskPage } from '../../hub/Drill';
import { scatter, trailSequence } from '../../lib/executive';
import { logChoice } from '../../lib/log';
import { useSettings } from '../../lib/settings';

const COUNTS = { numbers: { 1: 8, 2: 12, 3: 16 }, switch: { 1: 6, 2: 10, 3: 14 } } as const;

export default function SwitchItUp() {
  const { settings } = useSettings();
  const level = settings.executiveLevel;
  const [mode, setMode] = useState<'numbers' | 'switch'>(level === 1 ? 'numbers' : 'switch');
  const deal = (m: 'numbers' | 'switch') => {
    const seq = trailSequence(m === 'switch', COUNTS[m][level]);
    return { seq, pts: scatter(seq.length) };
  };
  const [board, setBoard] = useState(() => deal(mode));
  const [done, setDone] = useState(0);
  const [errors, setErrors] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [seconds, setSeconds] = useState<number | null>(null);

  const finished = done === board.seq.length;

  function reset(m = mode) {
    setMode(m);
    setBoard(deal(m));
    setDone(0);
    setErrors(0);
    setMessage(null);
    setStartAt(null);
    setSeconds(null);
  }

  function tap(i: number) {
    if (finished || i < done) return;
    const start = startAt ?? Date.now();
    if (startAt === null) setStartAt(start);
    if (i !== done) {
      setErrors(errors + 1);
      setMessage(`Not that one. Find ${board.seq[done]}.`);
      return;
    }
    setMessage(null);
    const next = done + 1;
    setDone(next);
    if (next === board.seq.length) {
      const secs = Math.round((Date.now() - start) / 1000);
      setSeconds(secs);
      logChoice({
        nickname: settings.nickname,
        module: 'switch-it-up',
        skill: 'trails',
        level: `${mode === 'switch' ? 'Switching' : 'Numbers'}, ${board.seq.length} circles`,
        question: board.seq.slice(0, 4).join('-') + '…',
        answer: `${secs} s, ${errors} wrong taps`,
        correct: true,
        independent: errors === 0,
        attempts: errors + 1,
        seconds: secs,
      });
    }
  }

  const path = board.pts.slice(0, done).map((p) => `${p.x},${p.y}`).join(' ');
  const intro = mode === 'switch' ? 'Tap in order, switching between numbers and letters: 1, A, 2, B, 3, C …' : 'Tap the numbers in order: 1, 2, 3 …';

  return (
    <TaskPage id="switch-it-up" intro={intro}>
      <div className="mode-toggle" role="group" aria-label="Kind">
        <button aria-pressed={mode === 'numbers'} onClick={() => reset('numbers')}>
          1 → 2 → 3
        </button>
        <button aria-pressed={mode === 'switch'} onClick={() => reset('switch')}>
          1 → A → 2 → B
        </button>
      </div>
      <p className="set-progress" aria-live="polite">
        {finished ? `Done in ${seconds} seconds with ${errors} wrong ${errors === 1 ? 'tap' : 'taps'}.` : `Next: ${board.seq[done]}`}
      </p>
      <div className="trail-board">
        <svg className="trail-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline points={path} />
        </svg>
        {board.seq.map((label, i) => (
          <button
            key={label}
            className={`trail-dot ${i < done ? 'done' : ''} ${i === 0 && done === 0 ? 'start' : ''}`}
            style={{ left: `${board.pts[i].x}%`, top: `${board.pts[i].y}%` }}
            onClick={() => tap(i)}
            aria-label={label}
          >
            {label}
          </button>
        ))}
      </div>
      {message && <p className="feedback bad">{message}</p>}
      {finished && (
        <button className="primary next-btn" onClick={() => reset()} autoFocus>
          New board →
        </button>
      )}
    </TaskPage>
  );
}
