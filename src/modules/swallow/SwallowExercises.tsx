import { useEffect, useRef, useState } from 'react';
import { ReadAloud } from '../../components/ReadAloud';
import { exerciseById, type Exercise } from '../../data/hub/swallow';
import { TaskPage } from '../../hub/Drill';
import { SwallowNote } from '../../hub/HubHome';
import type { ExerciseRx } from '../../hub/types';
import { logChoice } from '../../lib/log';
import { useSettings } from '../../lib/settings';
import { clock, useNow } from '../../lib/timers';

const REST_SEC = 30;

export default function SwallowExercises() {
  const { settings } = useSettings();
  const [current, setCurrent] = useState<{ ex: Exercise; rx: ExerciseRx } | null>(null);
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const prescribed = settings.exercises.map((rx) => ({ rx, ex: exerciseById(rx.id) })).filter((x): x is { rx: ExerciseRx; ex: Exercise } => !!x.ex);

  if (current) {
    return (
      <TaskPage id="swallow-exercises">
        <Coach
          ex={current.ex}
          rx={current.rx}
          onDone={() => {
            setDoneIds([...doneIds, current.ex.id]);
            setCurrent(null);
          }}
        />
      </TaskPage>
    );
  }

  return (
    <TaskPage id="swallow-exercises">
      <SwallowNote />
      {prescribed.length === 0 ? (
        <div className="question">
          <p className="q-text">No exercises are set for {settings.nickname || 'this patient'} yet.</p>
          <p>Your speech therapist picks your exercises in 🔒 Clinician → Settings → Swallowing.</p>
        </div>
      ) : (
        <div className="home-tiles">
          {prescribed.map(({ ex, rx }) => (
            <button key={ex.id} className="home-tile ex-tile" onClick={() => setCurrent({ ex, rx })}>
              <span className="tile-title">
                {doneIds.includes(ex.id) ? '✓ ' : ''}
                {ex.name}
              </span>
              <span className="tile-desc">
                {rx.sets > 1 ? `${rx.sets} sets of ${rx.reps}` : `${rx.reps} times`}
                {rx.holdSec ? `, hold ${rx.holdSec} seconds` : ''}
              </span>
              {ex.aka && <span className="tile-desc muted small">{ex.aka}</span>}
            </button>
          ))}
        </div>
      )}
    </TaskPage>
  );
}

type Stage = 'ready' | 'hold' | 'rest' | 'finished';

function Coach({ ex, rx, onDone }: { ex: Exercise; rx: ExerciseRx; onDone: () => void }) {
  const { settings } = useSettings();
  const [set, setSet] = useState(1);
  const [rep, setRep] = useState(0);
  const [total, setTotal] = useState(0);
  const [stage, setStage] = useState<Stage>('ready');
  const [endAt, setEndAt] = useState(0);
  const startedAt = useRef(Date.now());
  const now = useNow(stage === 'hold' || stage === 'rest', 200);
  const left = (endAt - now) / 1000;

  function countRep() {
    const r = rep + 1;
    setRep(r);
    setTotal((t) => t + 1);
    if (r >= rx.reps) {
      if (set >= rx.sets) finish(total + 1);
      else {
        setStage('rest');
        setEndAt(Date.now() + REST_SEC * 1000);
      }
    } else setStage('ready');
  }

  useEffect(() => {
    if (stage === 'hold' && left <= 0) countRep();
    if (stage === 'rest' && left <= 0) nextSet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, left]);

  function nextSet() {
    setSet((s) => s + 1);
    setRep(0);
    setStage('ready');
  }

  function finish(done: number) {
    setStage('finished');
    const planned = rx.reps * rx.sets;
    logChoice({
      nickname: settings.nickname,
      module: 'swallow-exercises',
      skill: 'swallowEx',
      level: ex.name,
      question: `${ex.name}: ${rx.sets} × ${rx.reps}${rx.holdSec ? `, hold ${rx.holdSec} s` : ''}`,
      answer: `${done} of ${planned} done`,
      correct: done >= planned,
      seconds: Math.round((Date.now() - startedAt.current) / 1000),
    });
  }

  const instructions = ex.steps.join(' ');

  return (
    <div className="question coach">
      <div className="q-prompt">
        <div>
          <h2>{ex.name}</h2>
          {ex.aka && <p className="muted small">{ex.aka}</p>}
        </div>
        <ReadAloud text={`${ex.name}. ${instructions}`} />
      </div>
      <ol className="steps-list ex-steps">
        {ex.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      {ex.note && <p className="notice">{ex.note}</p>}

      <p className="coach-count">
        {rx.sets > 1 && <span>Set {Math.min(set, rx.sets)} of {rx.sets} · </span>}
        <span>
          Rep <b>{Math.min(rep + (stage === 'hold' ? 1 : 0), rx.reps)}</b> of {rx.reps}
        </span>
      </p>

      {stage === 'ready' && (
        <div className="button-row">
          {rx.holdSec > 0 ? (
            <button
              className="primary big-go"
              onClick={() => {
                setStage('hold');
                setEndAt(Date.now() + rx.holdSec * 1000);
              }}
              autoFocus
            >
              Start rep {rep + 1} (hold {rx.holdSec} s)
            </button>
          ) : (
            <button className="primary big-go" onClick={countRep} autoFocus>
              ✓ Did rep {rep + 1}
            </button>
          )}
        </div>
      )}
      {stage === 'hold' && (
        <div className="hold">
          <p className="hold-label">Hold…</p>
          <p className="big-timer">{Math.max(0, Math.ceil(left))}</p>
        </div>
      )}
      {stage === 'rest' && (
        <div className="hold">
          <p className="hold-label">Rest. Next set in</p>
          <p className="big-timer">{clock(left)}</p>
          <button className="button" onClick={nextSet}>
            Skip rest
          </button>
        </div>
      )}
      {stage === 'finished' && (
        <>
          <p className="feedback good">✓ Done. {total} reps.</p>
          <button className="primary next-btn" onClick={onDone} autoFocus>
            Back to my exercises →
          </button>
        </>
      )}
      {stage !== 'finished' && (
        <button className="button stop-btn" onClick={() => finish(total)}>
          Stop here
        </button>
      )}
    </div>
  );
}
