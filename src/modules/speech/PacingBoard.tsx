import { useEffect, useRef, useState } from 'react';
import { ReadAloud } from '../../components/ReadAloud';
import { DDK, PACING } from '../../data/hub/speech';
import { SetFrame, TaskPage, useDeck, useSet } from '../../hub/Drill';
import { logChoice } from '../../lib/log';
import { useSettings } from '../../lib/settings';
import { clock, useNow } from '../../lib/timers';

export default function PacingBoard() {
  const [tab, setTab] = useState<'pace' | 'ddk'>('pace');
  return (
    <TaskPage id="pacing-board" intro="Slow down. Say one word each time you tap a box.">
      <div className="mode-toggle" role="group" aria-label="Exercise">
        <button aria-pressed={tab === 'pace'} onClick={() => setTab('pace')}>
          🚦 Pacing board
        </button>
        <button aria-pressed={tab === 'ddk'} onClick={() => setTab('ddk')}>
          👄 Pa-ta-ka warm-up
        </button>
      </div>
      {tab === 'pace' ? <Pacing /> : <Ddk />}
    </TaskPage>
  );
}

/** Words per minute from tap times. */
export function wordsPerMinute(taps: number[]): number | null {
  if (taps.length < 2) return null;
  const gap = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
  return gap > 0 ? Math.round(60000 / gap) : null;
}

function Pacing() {
  const { settings } = useSettings();
  const draw = useDeck(PACING[settings.speechLevel], 'pacing-board');
  const set = useSet(draw);
  const words = set.item.split(' ');
  const [taps, setTaps] = useState<number[]>([]);
  const [demo, setDemo] = useState(-1);
  const [rated, setRated] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    setTaps([]);
    setRated(false);
    setDemo(-1);
    timers.current.forEach(clearTimeout);
  }, [set.n]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function showPace() {
    timers.current.forEach(clearTimeout);
    setTaps([]);
    timers.current = [...words.map((_, i) => window.setTimeout(() => setDemo(i), i * settings.paceMs)), window.setTimeout(() => setDemo(-1), words.length * settings.paceMs)];
  }

  const wpm = wordsPerMinute(taps);
  const targetWpm = Math.round(60000 / settings.paceMs);
  const allTapped = taps.length === words.length;

  function rate(good: boolean) {
    setRated(true);
    const trial = logChoice({
      nickname: settings.nickname,
      module: 'pacing-board',
      skill: 'pacing',
      level: `${words.length} words, target ${targetWpm}/min`,
      question: set.item,
      answer: `${good ? 'Good pace' : 'Too fast or not clear'}${wpm ? ` (${wpm} words/min)` : ''}`,
      correct: good,
      seconds: taps.length > 1 ? Math.round((taps[taps.length - 1] - taps[0]) / 1000) : 0,
    });
    set.onLogged(trial);
  }

  return (
    <SetFrame set={set} noun="phrases" bank={{ items: PACING[settings.speechLevel], task: 'pacing-board' }}>
      <div className="question">
        <div className="q-prompt">
          <p className="q-text">Tap each box as you say each word. Go slowly.</p>
          <ReadAloud text={set.item} />
        </div>
        <div className="pace-row">
          {words.map((w, i) => (
            <button
              key={i}
              className={`pace-box ${i < taps.length ? 'tapped' : ''} ${demo === i ? 'demo' : ''}`}
              disabled={i !== taps.length || rated}
              onClick={() => setTaps([...taps, Date.now()])}
            >
              {w}
            </button>
          ))}
        </div>
        <div className="button-row">
          <button className="button" onClick={showPace}>
            Show me the pace
          </button>
          <button className="button" onClick={() => setTaps([])} disabled={taps.length === 0 || rated}>
            Start over
          </button>
        </div>
        {allTapped && wpm && (
          <p className="muted">
            Your pace: about {wpm} words a minute. Target: about {targetWpm}.
          </p>
        )}
        {allTapped && !rated && (
          <div className="scored">
            <p className="scored-label">Clinician: was it slow and clear?</p>
            <div className="yesno">
              <button className="big-choice good-choice" onClick={() => rate(true)}>
                ✓ Good pace
              </button>
              <button className="big-choice" onClick={() => rate(false)}>
                ✗ Too fast or not clear
              </button>
            </div>
          </div>
        )}
        {rated && (
          <button className="primary next-btn" onClick={set.next} autoFocus>
            Next →
          </button>
        )}
      </div>
    </SetFrame>
  );
}

function Ddk() {
  const { settings } = useSettings();
  const [which, setWhich] = useState<(typeof DDK)[number]>(DDK[0]);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const now = useNow(endAt !== null, 100);
  const left = endAt ? (endAt - now) / 1000 : 5;
  const timeUp = endAt !== null && left <= 0;

  function save() {
    logChoice({
      nickname: settings.nickname,
      module: 'pacing-board',
      skill: 'ddk',
      level: which.label,
      question: `${which.label} for 5 seconds`,
      answer: `${count} in 5 s`,
      correct: true,
      seconds: 5,
    });
    setSaved([...saved, `${which.label}: ${count}`]);
    setEndAt(null);
    setCount(0);
  }

  return (
    <div className="question">
      <div className="mode-toggle" role="group" aria-label="Sound">
        {DDK.map((d) => (
          <button key={d.id} aria-pressed={which.id === d.id} onClick={() => setWhich(d)}>
            {d.label}
          </button>
        ))}
      </div>
      <div className="q-prompt">
        <p className="q-text say-big">{which.label}</p>
        <ReadAloud text={`Say ${which.say}, as fast and clear as you can.`} />
      </div>
      <p>Say it over and over, fast and clear, until the timer stops.</p>
      <p className="big-timer">{timeUp ? 'Stop!' : clock(left)}</p>
      {endAt === null ? (
        <button className="primary" onClick={() => setEndAt(Date.now() + 5000)}>
          Start 5 seconds
        </button>
      ) : timeUp ? (
        <div>
          <p className="scored-label">Clinician: how many did they say?</p>
          <div className="counter">
            <button className="button" onClick={() => setCount(Math.max(0, count - 1))}>
              −1
            </button>
            <input className="counter-input" type="number" min={0} max={99} value={count} onChange={(e) => setCount(Math.max(0, Number(e.target.value) || 0))} aria-label="How many" />
            <button className="button" onClick={() => setCount(count + 1)}>
              +1
            </button>
          </div>
          <button className="primary next-btn" onClick={save}>
            Save
          </button>
        </div>
      ) : (
        <p className="muted">Go!</p>
      )}
      {saved.length > 0 && <p className="tries">Saved: {saved.join(' · ')}</p>}
    </div>
  );
}
