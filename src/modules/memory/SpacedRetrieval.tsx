import { useEffect, useState } from 'react';
import { ReadAloud } from '../../components/ReadAloud';
import { TaskPage } from '../../hub/Drill';
import { logChoice } from '../../lib/log';
import { useSettings } from '../../lib/settings';
import { getRun, recordProbe, saveRun, SRT_INTERVALS, startRun, type SrtRun } from '../../lib/srt';
import { clock, spokenDuration, useNow } from '../../lib/timers';

/** Keeps the saved run in sync across the page and the banner. */
export function useSrtRun(): [SrtRun | null, (r: SrtRun | null) => void] {
  const [run, setRun] = useState(getRun);
  useEffect(() => {
    const sync = () => setRun(getRun());
    window.addEventListener('srt-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('srt-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return [run, (r) => saveRun(r)];
}

/** Shown at the top of every page while a spaced-retrieval run is going. */
export function SrtBanner({ onPage }: { onPage: boolean }) {
  const { activeId, settings } = useSettings();
  const [run] = useSrtRun();
  const now = useNow(!!run, 1000);
  if (!run || run.profileId !== activeId || onPage || run.dueAt === null) return null;
  const target = settings.srtTargets.find((t) => t.id === run.targetId);
  if (!target) return null;
  const left = (run.dueAt - now) / 1000;
  return left <= 0 ? (
    <a className="srt-banner due" href="#/spaced-retrieval">
      ⏱️ Time to ask the spaced-retrieval question → Go
    </a>
  ) : (
    <a className="srt-banner" href="#/spaced-retrieval">
      ⏱️ Spaced retrieval: next question in {clock(left)}
    </a>
  );
}

export default function SpacedRetrieval() {
  const { settings, activeId } = useSettings();
  const [savedRun, setRun] = useSrtRun();
  const run = savedRun && savedRun.profileId === activeId ? savedRun : null;
  const target = run ? settings.srtTargets.find((t) => t.id === run.targetId) : undefined;
  const [missed, setMissed] = useState(false);
  const [finished, setFinished] = useState<SrtRun | null>(null);
  const now = useNow(!!run, 500);
  const [askedAt, setAskedAt] = useState(Date.now());

  const due = run && target && (run.dueAt === null || now >= run.dueAt);
  useEffect(() => {
    if (due) setAskedAt(Date.now());
  }, [due]);

  if (settings.srtTargets.length === 0) {
    return (
      <TaskPage id="spaced-retrieval">
        <div className="question">
          <p className="q-text">No spaced-retrieval targets yet for {settings.nickname || 'this patient'}.</p>
          <p>
            Open <b>🔒 Clinician → Settings → Memory</b> and add one, for example “What is your room number?” → “Room 112”, or “How do you
            call for help?” → “Press the red button”.
          </p>
        </div>
      </TaskPage>
    );
  }

  if (finished) {
    return (
      <TaskPage id="spaced-retrieval">
        <RunSummary run={finished} question={settings.srtTargets.find((t) => t.id === finished.targetId)?.question ?? ''} />
        <button className="primary" onClick={() => setFinished(null)}>
          Start another
        </button>
      </TaskPage>
    );
  }

  if (!run || !target) {
    return (
      <TaskPage id="spaced-retrieval" intro="We will practice one important fact. I will ask you again and again, with more time in between.">
        <div className="question">
          <h2>Pick a target</h2>
          <div className="choice-grid">
            {settings.srtTargets.map((t) => (
              <button key={t.id} className="choice-btn" onClick={() => setRun(startRun(activeId, t.id))}>
                <span className="choice-label">
                  {t.question}
                  <small className="muted"> → {t.answer}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </TaskPage>
    );
  }

  function mark(correct: boolean) {
    if (!run || !target) return;
    const interval = run.index < 0 ? 0 : SRT_INTERVALS[run.index];
    logChoice({
      nickname: settings.nickname,
      module: 'spaced-retrieval',
      skill: 'srt',
      level: interval === 0 ? 'Right away' : spokenDuration(interval),
      question: target.question,
      answer: correct ? 'Recalled' : 'Missed',
      correct,
      seconds: Math.round((Date.now() - askedAt) / 1000),
    });
    setRun(recordProbe(run, correct));
    setMissed(!correct);
  }

  const stop = () => {
    setFinished(run);
    setRun(null);
    setMissed(false);
  };

  if (missed) {
    return (
      <TaskPage id="spaced-retrieval">
        <div className="question srt-card">
          <p className="q-text">{target.question}</p>
          <p className="srt-answer">{target.answer}</p>
          <p>Say it with me: “{target.answer}.” Then say it once more on your own.</p>
          <ReadAloud text={`${target.question} ${target.answer}. Say it with me: ${target.answer}.`} />
          <button className="primary" onClick={() => setMissed(false)} autoFocus>
            They said it. Start the shorter wait →
          </button>
        </div>
        <RunStats run={run} />
      </TaskPage>
    );
  }

  if (due) {
    return (
      <TaskPage id="spaced-retrieval">
        <div className="question srt-card">
          <div className="q-prompt">
            <p className="q-text srt-question">{target.question}</p>
            <ReadAloud text={target.question} />
          </div>
          <div className="scored">
            <p className="scored-label">Clinician: answer is “{target.answer}”</p>
            <div className="yesno">
              <button className="big-choice good-choice" onClick={() => mark(true)}>
                ✓ Recalled
              </button>
              <button className="big-choice" onClick={() => mark(false)}>
                ✗ Missed or needed help
              </button>
            </div>
          </div>
        </div>
        <RunStats run={run} onStop={stop} />
      </TaskPage>
    );
  }

  const left = ((run.dueAt ?? now) - now) / 1000;
  return (
    <TaskPage id="spaced-retrieval">
      <div className="question srt-card">
        <p className="muted">Next question in</p>
        <p className="big-timer" aria-live="off">
          {clock(left)}
        </p>
        <p>Talk about something else or do another task. You can leave this page. A reminder shows at the top when it’s time.</p>
        <div className="button-row">
          <button className="button" onClick={() => setRun({ ...run, dueAt: Date.now() })}>
            Ask now
          </button>
        </div>
      </div>
      <RunStats run={run} onStop={stop} />
    </TaskPage>
  );
}

function RunStats({ run, onStop }: { run: SrtRun; onStop?: () => void }) {
  const wait = run.index < 0 ? 0 : SRT_INTERVALS[run.index];
  return (
    <div className="srt-stats">
      <span>
        Current wait: <b>{wait ? spokenDuration(wait) : 'none yet'}</b>
      </span>
      <span>
        Longest recalled: <b>{run.best ? spokenDuration(run.best) : '—'}</b>
      </span>
      <span>
        Questions: <b>{run.probes.length}</b> ({run.probes.filter((p) => p.correct).length} recalled)
      </span>
      {onStop && (
        <button className="button" onClick={onStop}>
          Stop for today
        </button>
      )}
    </div>
  );
}

function RunSummary({ run, question }: { run: SrtRun; question: string }) {
  return (
    <div className="question">
      <h2>Spaced retrieval summary</h2>
      <p className="q-text">{question}</p>
      <p>
        Longest time recalled: <b>{run.best ? spokenDuration(run.best) : 'not yet past right away'}</b>. {run.probes.length} questions,{' '}
        {run.probes.filter((p) => p.correct).length} recalled.
      </p>
      <ol className="steps-list">
        {run.probes.map((p, i) => (
          <li key={i}>
            {p.interval ? `After ${spokenDuration(p.interval)}` : 'Right away'}: {p.correct ? '✓ recalled' : '✗ missed'}
          </li>
        ))}
      </ol>
      <p className="muted">Each question is saved in This session and the CSV export.</p>
    </div>
  );
}
