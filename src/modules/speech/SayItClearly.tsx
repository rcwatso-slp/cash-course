import { useEffect, useRef, useState } from 'react';
import { ReadAloud } from '../../components/ReadAloud';
import { CLEAR_SPEECH } from '../../data/hub/speech';
import { SetFrame, TaskPage, useDeck, useSet } from '../../hub/Drill';
import { useRecorder } from '../../lib/audio';
import { logChoice } from '../../lib/log';
import { useSettings } from '../../lib/settings';
import { MicOffNote } from './MicMeter';

const RATINGS = [
  { id: 'clear', label: '✓ Understood', correct: true },
  { id: 'partly', label: '~ Partly understood', correct: false },
  { id: 'unclear', label: '✗ Not understood', correct: false },
] as const;

export default function SayItClearly() {
  const { settings } = useSettings();
  const level = settings.speechLevel;
  const draw = useDeck(CLEAR_SPEECH[level], 'say-it-clearly');
  const set = useSet(draw);
  const rec = useRecorder();
  const [rated, setRated] = useState<string | null>(null);
  const [modeled, setModeled] = useState(false);
  const startAt = useRef(Date.now());

  useEffect(() => {
    setRated(null);
    setModeled(false);
    rec.clear();
    startAt.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set.n]);

  function rate(r: (typeof RATINGS)[number]) {
    setRated(r.id);
    const trial = logChoice({
      nickname: settings.nickname,
      module: 'say-it-clearly',
      skill: 'clarity',
      level: ['Words', 'Phrases', 'Sentences'][level - 1],
      question: set.item,
      answer: r.label.replace(/^[✓~✗] /, ''),
      correct: r.correct,
      independent: r.correct && !modeled,
      helpLevel: modeled ? 2 : 0,
      seconds: Math.round((Date.now() - startAt.current) / 1000),
    });
    set.onLogged(trial);
  }

  return (
    <TaskPage id="say-it-clearly" intro="Say it slowly. Open your mouth wide and make every sound clear.">
      {!settings.micOn && <MicOffNote />}
      <SetFrame set={set} noun={['words', 'phrases', 'sentences'][level - 1]} bank={{ items: CLEAR_SPEECH[level], task: 'say-it-clearly' }}>
        <div className="question">
          <div className="q-prompt">
            <p className="q-text say-big">“{set.item}”</p>
            <span onClick={() => setModeled(true)}>
              <ReadAloud text={set.item} />
            </span>
          </div>
          <p className="muted small">Tip: big mouth movements, every sound, and a breath before you start.</p>

          {settings.micOn && (
            <div className="recorder">
              {!rec.recording ? (
                <button className="button" onClick={() => void rec.start()}>
                  ⏺ Record yourself
                </button>
              ) : (
                <button className="primary" onClick={rec.stop}>
                  ⏹ Stop recording
                </button>
              )}
              {rec.url && (
                <div className="playback">
                  <span>Listen back:</span>
                  <audio controls src={rec.url} />
                </div>
              )}
              {rec.error && <p className="feedback bad">{rec.error}</p>}
              <p className="muted small">The recording stays on this screen only. It’s gone when you move on.</p>
            </div>
          )}

          {!rated ? (
            <div className="scored">
              <p className="scored-label">Clinician: how well did you understand it?</p>
              <div className="rating-row">
                {RATINGS.map((r) => (
                  <button key={r.id} className={`big-choice ${r.correct ? 'good-choice' : ''}`} onClick={() => rate(r)}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="feedback info">Marked: {RATINGS.find((r) => r.id === rated)?.label}</p>
              <button className="primary next-btn" onClick={set.next} autoFocus>
                Next →
              </button>
            </>
          )}
        </div>
      </SetFrame>
    </TaskPage>
  );
}
