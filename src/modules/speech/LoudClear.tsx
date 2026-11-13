import { useCallback, useRef, useState } from 'react';
import { Question } from '../../components/Question';
import { ReadAloud } from '../../components/ReadAloud';
import { LOUD_PHRASES } from '../../data/hub/speech';
import { SetFrame, TaskPage, useDeck, useSet } from '../../hub/Drill';
import { logChoice } from '../../lib/log';
import { useSettings } from '../../lib/settings';
import { useNow } from '../../lib/timers';
import { MicMeter, MicOffNote } from './MicMeter';

export default function LoudClear() {
  const { settings } = useSettings();
  const [tab, setTab] = useState<'ah' | 'phrases'>('ah');
  return (
    <TaskPage id="loud-clear" intro="Take a deep breath. Use a strong, loud voice, like you are talking to someone across the room.">
      {settings.micOn ? null : <MicOffNote />}
      <div className="mode-toggle" role="group" aria-label="Exercise">
        <button aria-pressed={tab === 'ah'} onClick={() => setTab('ah')}>
          Long “ah”
        </button>
        <button aria-pressed={tab === 'phrases'} onClick={() => setTab('phrases')}>
          Loud phrases
        </button>
      </div>
      {tab === 'ah' ? <LongAh /> : <LoudPhrases />}
    </TaskPage>
  );
}

const GOALS = [5, 8, 10, 15, 20];

/** Hold "ah" in a strong voice. With the mic on, it times how long the voice stays at the line. */
function LongAh() {
  const { settings } = useSettings();
  const [goal, setGoal] = useState(10);
  const [tries, setTries] = useState<number[]>([]);
  const [manualStart, setManualStart] = useState<number | null>(null);
  const [liveStart, setLiveStart] = useState<number | null>(null);
  const [micLive, setMicLive] = useState(false);
  const onset = useRef<number | null>(null);
  const lastAbove = useRef(0);
  const now = useNow(manualStart !== null || liveStart !== null, 100);

  const save = useCallback(
    (secs: number) => {
      const s = Math.round(secs * 10) / 10;
      setTries((t) => [...t, s]);
      logChoice({
        nickname: settings.nickname,
        module: 'loud-clear',
        skill: 'phonation',
        level: micLive ? 'With meter' : 'Timed by clinician',
        question: `Hold “ah” (goal ${goal} s)`,
        answer: `${s} s`,
        correct: s >= goal,
        seconds: Math.round(s),
      });
    },
    [goal, micLive, settings.nickname],
  );

  const onLevel = useCallback(
    (level: number) => {
      const t = Date.now();
      if (level >= settings.loudTarget) {
        if (onset.current === null) {
          onset.current = t;
          setLiveStart(t);
        }
        lastAbove.current = t;
      } else if (onset.current !== null && t - lastAbove.current > 600) {
        const secs = (lastAbove.current - onset.current) / 1000;
        onset.current = null;
        setLiveStart(null);
        if (secs >= 1) save(secs);
      }
    },
    [settings.loudTarget, save],
  );

  const running = liveStart ?? manualStart;
  const best = tries.length ? Math.max(...tries) : 0;

  return (
    <div className="question">
      <div className="q-prompt">
        <p className="q-text">Take a deep breath. Say “ahhh” as long and as strong as you can.</p>
        <ReadAloud text="Take a deep breath. Say ah, as long and as strong as you can." />
      </div>
      {settings.micOn && <MicMeter onLevel={onLevel} onLive={setMicLive} />}
      <p className="big-timer">{running ? ((now - running) / 1000).toFixed(1) : '0.0'} s</p>
      <label className="inline-select">
        Goal{' '}
        <select value={goal} onChange={(e) => setGoal(Number(e.target.value))}>
          {GOALS.map((g) => (
            <option key={g} value={g}>
              {g} seconds
            </option>
          ))}
        </select>
      </label>
      {!micLive && (
        <div className="button-row">
          {manualStart === null ? (
            <button className="primary" onClick={() => setManualStart(Date.now())}>
              Start timer
            </button>
          ) : (
            <button
              className="primary"
              onClick={() => {
                save((Date.now() - manualStart) / 1000);
                setManualStart(null);
              }}
            >
              Stop
            </button>
          )}
        </div>
      )}
      {micLive && <p className="muted small">The timer starts by itself when your voice reaches the line, and stops when it drops.</p>}
      {tries.length > 0 && (
        <p className="tries">
          Tries: {tries.map((t) => `${t} s`).join(' · ')} — best <b>{best} s</b>
          {best >= goal ? ' ✓ goal reached' : ''}
        </p>
      )}
    </div>
  );
}

function LoudPhrases() {
  const { settings } = useSettings();
  const draw = useDeck(LOUD_PHRASES);
  const set = useSet(draw);
  const [peak, setPeak] = useState(0);
  const onLevel = useCallback((l: number) => setPeak((p) => Math.max(p, l)), []);

  return (
    <SetFrame set={set} noun="phrases">
      {settings.micOn && <MicMeter onLevel={onLevel} />}
      <Question
        key={set.n}
        module="loud-clear"
        skill="loudness"
        level={settings.micOn ? `Target ${settings.loudTarget}` : 'Clinician judged'}
        prompt={<p className="q-text say-big">“{set.item}”</p>}
        say={set.item}
        logText={`Say loudly: ${set.item}${settings.micOn ? ` (peak ${peak})` : ''}`}
        answerLabel="Loud enough"
        kind="scored"
        scoreLabels={['Loud enough', 'Not loud enough']}
        helpNames={['Breathe', 'Model', 'Together']}
        helps={[
          { content: <p>Take a big breath first. Think “loud”.</p>, say: 'Take a big breath first. Think loud.' },
          { content: <p>Listen to me, then say it just as loud.</p>, say: `Listen, then say it just as loud. ${set.item}` },
          { content: <p>Say it together with me, loud and strong.</p>, say: `Say it together with me. ${set.item}` },
        ]}
        solvedExtra={settings.micOn ? <p className="muted">Loudest on the meter: {peak} (line at {settings.loudTarget}).</p> : undefined}
        onLogged={set.onLogged}
        onNext={() => {
          setPeak(0);
          set.next();
        }}
      />
    </SetFrame>
  );
}
