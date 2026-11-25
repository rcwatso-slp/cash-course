import { useEffect, useMemo, useState } from 'react';
import { Question } from '../../components/Question';
import { ReadAloud } from '../../components/ReadAloud';
import { WRAP_ITEMS, WRAP_STEPS, WRAP_STEPS_QUIZ } from '../../data/hub/wrap';
import { SetFrame, TaskPage, useDeck, useSet } from '../../hub/Drill';
import { choiceHelps, makeOptions } from '../../hub/helps';
import { useSettings } from '../../lib/settings';
import { clock, useNow } from '../../lib/timers';

type Mode = 'use' | 'learn';

export default function Wrap() {
  const [mode, setMode] = useState<Mode>('use');
  return (
    <TaskPage id="wrap" intro="A 4-step way to remember something important. Practice the steps with real-life things to remember.">
      <div className="mode-toggle" role="group" aria-label="Kind of practice">
        <button aria-pressed={mode === 'use'} onClick={() => setMode('use')}>
          🎁 Use WRAP
        </button>
        <button aria-pressed={mode === 'learn'} onClick={() => setMode('learn')}>
          🧠 Learn the steps
        </button>
      </div>
      {mode === 'use' ? <WrapPractice /> : <WrapQuiz />}
    </TaskPage>
  );
}

/** W R A P across the top, lighting up as each step is done. */
function WrapStrip({ step }: { step: number }) {
  return (
    <ol className="wrap-strip" aria-label="WRAP steps">
      {WRAP_STEPS.map((s, i) => (
        <li key={s.letter} className={i === step ? 'now' : i < step ? 'done' : ''} aria-current={i === step ? 'step' : undefined}>
          <span className="wrap-letter">{s.letter}</span>
          <span className="wrap-word">{s.title}</span>
        </li>
      ))}
    </ol>
  );
}

type Stage = 0 | 1 | 2 | 3 | 'wait' | 'recall';

function WrapPractice() {
  const { settings } = useSettings();
  const pool = useMemo(() => {
    const at = WRAP_ITEMS.filter((x) => x.level === settings.memoryLevel);
    return at.length ? at : WRAP_ITEMS;
  }, [settings.memoryLevel]);
  const draw = useDeck(pool, 'wrap');
  const set = useSet(() => {
    const item = draw();
    return { item, ...makeOptions([item.answer, ...item.wrong]) };
  });
  const { item, options, answer } = set.item;

  const [stage, setStage] = useState<Stage>(0);
  const [note, setNote] = useState('');
  const [onPaper, setOnPaper] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [reps, setReps] = useState(0);
  const [myLink, setMyLink] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [showPicture, setShowPicture] = useState(false);
  const [endAt, setEndAt] = useState(0);
  const now = useNow(stage === 'wait', 500);

  useEffect(() => {
    setStage(0);
    setNote('');
    setOnPaper(false);
    setShowNote(false);
    setReps(0);
    setMyLink('');
    setShowLink(false);
    setShowPicture(false);
  }, [set.n, item.id]);

  useEffect(() => {
    if (stage === 'wait' && now >= endAt) setStage('recall');
  }, [stage, now, endAt]);

  function finishSteps() {
    if (settings.recallDelay > 0) {
      setEndAt(Date.now() + Math.min(settings.recallDelay, 120) * 1000);
      setStage('wait');
    } else setStage('recall');
  }

  const step = typeof stage === 'number' ? stage : 4;
  const theirLink = myLink.trim() || item.link;

  return (
    <SetFrame set={set} noun="things to remember" bank={{ items: pool, task: 'wrap' }}>
      {typeof stage === 'number' && (
        <div className="question wrap-card">
          <WrapStrip step={step} />
          <div className="story-card wrap-fact">
            <p className="story-kind">
              {item.emoji} {item.kind}
            </p>
            <p className="story-text">{item.fact}</p>
            <ReadAloud text={item.fact} />
          </div>

          {stage === 0 && (
            <div className="wrap-step">
              <h2>
                <span className="wrap-letter">W</span> Write it
              </h2>
              <p>{WRAP_STEPS[0].how}</p>
              <label className="wrap-label">
                Your note
                <textarea className="text-input wrap-note" rows={2} maxLength={120} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write it in a few words" />
              </label>
              {showNote ? (
                <p className="muted">
                  For example: <b>{item.note}</b>
                </p>
              ) : (
                <button className="link-button" onClick={() => setShowNote(true)}>
                  Show me an example
                </button>
              )}
              <div className="button-row">
                <button className="primary" disabled={!note.trim()} onClick={() => setStage(1)}>
                  Next: Repeat it →
                </button>
                <button
                  className="button"
                  onClick={() => {
                    setOnPaper(true);
                    setStage(1);
                  }}
                >
                  I wrote it on paper
                </button>
              </div>
            </div>
          )}

          {stage === 1 && (
            <div className="wrap-step">
              <h2>
                <span className="wrap-letter">R</span> Repeat it
              </h2>
              <p>Say it out loud, 3 times. Tap a circle each time.</p>
              <div className="wrap-reps" role="group" aria-label="Times said">
                {[1, 2, 3].map((n) => (
                  <button key={n} className={`wrap-rep ${reps >= n ? 'on' : ''}`} aria-pressed={reps >= n} onClick={() => setReps(Math.max(reps, n))}>
                    {reps >= n ? '✓' : n}
                  </button>
                ))}
              </div>
              <button className="primary" disabled={reps < 3} onClick={() => setStage(2)}>
                Next: Associate it →
              </button>
            </div>
          )}

          {stage === 2 && (
            <div className="wrap-step">
              <h2>
                <span className="wrap-letter">A</span> Associate it
              </h2>
              <p>{WRAP_STEPS[2].how} What does it remind you of?</p>
              <label className="wrap-label">
                Your link (optional)
                <input className="text-input" maxLength={120} value={myLink} onChange={(e) => setMyLink(e.target.value)} placeholder="It reminds me of…" />
              </label>
              {showLink ? (
                <p className="wrap-idea">💡 {item.link}</p>
              ) : (
                <button className="link-button" onClick={() => setShowLink(true)}>
                  Give me an idea
                </button>
              )}
              <button className="primary" onClick={() => setStage(3)}>
                Next: Picture it →
              </button>
            </div>
          )}

          {stage === 3 && (
            <div className="wrap-step">
              <h2>
                <span className="wrap-letter">P</span> Picture it
              </h2>
              <p>{WRAP_STEPS[3].how} The sillier, the better.</p>
              {showPicture ? (
                <div className="wrap-picture">
                  <span className="wrap-picture-emoji" aria-hidden="true">
                    {item.pictureEmoji}
                  </span>
                  <p>{item.picture}</p>
                  <ReadAloud text={item.picture} />
                </div>
              ) : (
                <button className="link-button" onClick={() => setShowPicture(true)}>
                  Show me a picture idea
                </button>
              )}
              <button className="primary" onClick={finishSteps}>
                I can see it →
              </button>
            </div>
          )}
        </div>
      )}

      {stage === 'wait' && (
        <div className="question srt-card">
          <WrapStrip step={4} />
          <p className="q-text">Now put your note away. Let’s wait a little before I ask.</p>
          <p className="big-timer">{clock((endAt - now) / 1000)}</p>
          <p>Talk about something else for a moment.</p>
          <button className="button" onClick={() => setStage('recall')}>
            Skip the wait
          </button>
        </div>
      )}

      {stage === 'recall' && (
        <Question
          key={`${set.n}-${item.id}`}
          module="wrap"
          skill="wrap"
          level={`L${item.level}${settings.recallDelay > 0 ? `, ${Math.min(settings.recallDelay, 120)}s delay` : ''}`}
          prompt={
            <div>
              <p className="muted">Without looking at your note:</p>
              <p className="q-text big-q">{item.q}</p>
            </div>
          }
          say={item.q}
          logText={item.fact}
          answerLabel={item.answer}
          helpNames={['Use WRAP', 'Link and picture', 'Your note']}
          helps={[
            {
              content: (
                <p>
                  Think back. What did it remind you of? What did you picture?
                  {myLink.trim() && (
                    <>
                      <br />
                      Your link: <b>{myLink.trim()}</b>
                    </>
                  )}
                </p>
              ),
              say: `Think back. What did it remind you of? What did you picture?${myLink.trim() ? ` Your link: ${myLink.trim()}` : ''}`,
            },
            {
              content: (
                <div className="wrap-picture">
                  <p>💡 {theirLink}</p>
                  <span className="wrap-picture-emoji" aria-hidden="true">
                    {item.pictureEmoji}
                  </span>
                  <p>{item.picture}</p>
                </div>
              ),
              say: `${theirLink} ${item.picture}`,
            },
            {
              content: (
                <p>
                  Look at your note{onPaper && !note.trim() ? ' on paper' : ''}: <b>{note.trim() || item.note}</b>
                  <br />
                  The answer is <b>{item.answer}</b>.
                </p>
              ),
              say: `Look at your note. The answer is ${item.answer}.`,
            },
          ]}
          {...(settings.responseMode === 'spoken'
            ? { kind: 'scored' as const }
            : settings.responseMode === 'typed'
              ? { kind: 'text' as const, accepted: [item.answer], parts: item.parts, inputLabel: 'Your answer' }
              : { kind: 'choice' as const, options, answer })}
          onLogged={set.onLogged}
          onNext={set.next}
        />
      )}
    </SetFrame>
  );
}

/** Questions about the WRAP steps themselves, so the strategy sticks. */
function WrapQuiz() {
  const { settings } = useSettings();
  const draw = useDeck(WRAP_STEPS_QUIZ, 'wrap-steps');
  const set = useSet(() => {
    const item = draw();
    return { item, ...makeOptions(item.options) };
  });
  const { item, options, answer } = set.item;

  return (
    <SetFrame set={set} noun="questions">
      <Question
        key={set.n}
        module="wrap"
        skill="wrapSteps"
        level="Steps"
        prompt={<p className="q-text">{item.q}</p>}
        say={item.q}
        logText={item.q}
        answerLabel={item.options[0]}
        {...(settings.responseMode === 'spoken' ? { kind: 'scored' as const } : { kind: 'choice' as const, options, answer })}
        helps={choiceHelps({ hint: item.why.replace(item.options[0], '…'), options, answer })}
        onLogged={set.onLogged}
        onNext={set.next}
      />
    </SetFrame>
  );
}
