import { useMemo, useState } from 'react';
import { Question } from '../../components/Question';
import { ReadAloud } from '../../components/ReadAloud';
import { STORIES, type Story } from '../../data/hub/stories';
import { BankNote, TaskPage, useDeck } from '../../hub/Drill';
import { choiceHelps, makeOptions } from '../../hub/helps';
import { useSettings } from '../../lib/settings';
import { speak } from '../../lib/speech';

type Phase = 'present' | 'questions' | 'done';

/** Stories saved for delayed questions while the app stays open. */
const delayedQueue: { story: Story; at: number }[] = [];

export default function StoryRecall() {
  const { settings } = useSettings();
  const pool = useMemo(() => {
    const atLevel = STORIES.filter((s) => s.level === settings.memoryLevel);
    return atLevel.length ? atLevel : STORIES;
  }, [settings.memoryLevel]);
  const draw = useDeck(pool, 'story-recall');
  const [story, setStory] = useState<Story>(draw);
  const [delayed, setDelayed] = useState(false);
  const [mode, setMode] = useState<'read' | 'listen'>('read');
  const [phase, setPhase] = useState<Phase>('present');
  const [qi, setQi] = useState(0);
  const [right, setRight] = useState(0);
  const [queued, setQueued] = useState(false);

  function start(next: Story, isDelayed = false) {
    setStory(next);
    setDelayed(isDelayed);
    setPhase(isDelayed ? 'questions' : 'present');
    setQi(0);
    setRight(0);
    setQueued(false);
  }

  const q = story.questions[qi];
  const opts = q ? makeOptionsOnce(story.id, qi, q.options) : null;

  return (
    <TaskPage id="story-recall">
      {phase === 'present' && <BankNote items={pool} task="story-recall" />}
      {phase === 'present' && (
        <div className="question">
          <div className="mode-toggle" role="group" aria-label="Read or listen">
            <button aria-pressed={mode === 'read'} onClick={() => setMode('read')}>
              📖 Read it
            </button>
            <button aria-pressed={mode === 'listen'} onClick={() => setMode('listen')}>
              👂 Listen
            </button>
          </div>
          <div className="story-card">
            <p className="story-kind">
              {story.emoji} {story.kind}: {story.title}
            </p>
            {mode === 'read' ? (
              <>
                <p className="story-text">{story.text}</p>
                <ReadAloud text={story.text} />
              </>
            ) : (
              <button className="primary wide" onClick={() => speak(story.text)}>
                🔊 Play the {story.kind.toLowerCase()}
              </button>
            )}
          </div>
          <p>When you’re ready, it will be hidden and I’ll ask some questions.</p>
          <button className="primary next-btn" onClick={() => setPhase('questions')}>
            I’m ready →
          </button>
        </div>
      )}

      {phase === 'questions' && q && opts && (
        <>
          <p className="set-progress">
            {story.title}
            {delayed ? ' (delayed)' : ''}: question {qi + 1} of {story.questions.length}
          </p>
          <Question
            key={`${story.id}-${qi}-${delayed}`}
            module="story-recall"
            skill="storyRecall"
            level={`L${story.level}${delayed ? ' delayed' : ''}`}
            prompt={<p className="q-text">{q.q}</p>}
            say={q.q}
            logText={`${story.title}: ${q.q}`}
            answerLabel={q.options[0]}
            {...(settings.responseMode === 'spoken'
              ? { kind: 'scored' as const }
              : { kind: 'choice' as const, options: opts.options, answer: opts.answer })}
            helpNames={['Hint', 'Look again', 'Answer']}
            helps={(() => {
              const [hint, , answer] = choiceHelps({ hint: q.hint, options: opts.options, answer: opts.answer });
              return [hint, { content: <p className="story-text">{story.text}</p>, say: story.text }, answer];
            })()}
            onLogged={(t) => t.independent && setRight((x) => x + 1)}
            onNext={() => (qi + 1 < story.questions.length ? setQi(qi + 1) : setPhase('done'))}
          />
        </>
      )}

      {phase === 'done' && (
        <div className="question">
          <h2>Done with “{story.title}”</h2>
          <p className="q-text">
            <b>{right}</b> of {story.questions.length} right on your own.
          </p>
          <div className="button-row">
            <button className="primary" onClick={() => start(draw())} autoFocus>
              Next story
            </button>
            {!delayed && (
              <button
                className="button"
                disabled={queued}
                onClick={() => {
                  delayedQueue.push({ story, at: Date.now() });
                  setQueued(true);
                }}
              >
                {queued ? '✓ Saved for later' : 'Ask again later (delayed recall)'}
              </button>
            )}
          </div>
        </div>
      )}

      {phase === 'present' && delayedQueue.length > 0 && (
        <div className="delayed-box">
          <p>
            <b>Delayed recall:</b> ask about “{delayedQueue[0].story.title}” again (
            {Math.max(1, Math.round((Date.now() - delayedQueue[0].at) / 60000))} min ago).
          </p>
          <button className="button" onClick={() => start(delayedQueue.shift()!.story, true)}>
            Start delayed questions
          </button>
        </div>
      )}
    </TaskPage>
  );
}

/** Keep the same shuffled order for a question while it's on screen. */
const optionCache = new Map<string, ReturnType<typeof makeOptions>>();
function makeOptionsOnce(storyId: string, qi: number, labels: string[]) {
  const key = `${storyId}-${qi}`;
  if (!optionCache.has(key)) optionCache.set(key, makeOptions(labels));
  return optionCache.get(key)!;
}
