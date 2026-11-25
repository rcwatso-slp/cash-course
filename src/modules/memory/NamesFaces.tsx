import { useEffect, useState } from 'react';
import { Question } from '../../components/Question';
import { ReadAloud } from '../../components/ReadAloud';
import { PEOPLE } from '../../data/hub/mental';
import { TaskPage } from '../../hub/Drill';
import { makeOptions } from '../../hub/helps';
import { pick, shuffle } from '../../lib/random';
import { useSettings } from '../../lib/settings';
import { clock, useNow } from '../../lib/timers';

interface Person {
  name: string;
  role: string;
  emoji: string;
}

const COUNT = { 1: 2, 2: 3, 3: 4 } as const;
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/** People with different-looking faces and jobs that start with different sounds. */
function meet(n: number): Person[] {
  const chosen: typeof PEOPLE = [];
  for (const p of shuffle(PEOPLE)) if (chosen.length < n && chosen.every((c) => c.role[0] !== p.role[0] && c.emoji !== p.emoji)) chosen.push(p);
  return chosen.map((p) => ({ name: pick(p.names), role: p.role, emoji: p.emoji }));
}

type Phase = 'study' | 'wait' | 'test' | 'done';

export default function NamesFaces() {
  const { settings } = useSettings();
  const [people, setPeople] = useState(() => meet(COUNT[settings.memoryLevel]));
  const [phase, setPhase] = useState<Phase>('study');
  const [order, setOrder] = useState<Person[]>([]);
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [endAt, setEndAt] = useState(0);
  const now = useNow(phase === 'wait', 500);

  useEffect(() => {
    if (phase === 'wait' && now >= endAt) setPhase('test');
  }, [phase, now, endAt]);

  function start() {
    setOrder(shuffle(people));
    setI(0);
    setRight(0);
    if (settings.recallDelay > 0) {
      setEndAt(Date.now() + Math.min(settings.recallDelay, 120) * 1000);
      setPhase('wait');
    } else setPhase('test');
  }

  function again() {
    setPeople(meet(COUNT[settings.memoryLevel]));
    setPhase('study');
  }

  const intro = people.map((p) => `This is ${cap(p.role)} ${p.name}.`).join(' ');
  const current = order[i];
  // Names to choose from: everyone just met, plus a few others with the same first letters.
  const options = current ? optionsFor(current, people) : null;

  return (
    <TaskPage id="names-pictures" intro="Link each name to the person’s job. Doctor Dana: D and D.">
      {phase === 'study' && (
        <div className="question">
          <div className="q-prompt">
            <p className="q-text">Meet these people. Say each name out loud.</p>
            <ReadAloud text={intro} />
          </div>
          <div className="people-row">
            {people.map((p) => (
              <div key={p.name} className="person-card">
                <span className="person-face" aria-hidden="true">
                  {p.emoji}
                </span>
                <b className="person-name">{p.name}</b>
                <span className="muted">the {p.role}</span>
                <span className="person-link">
                  {cap(p.role)} {p.name}
                </span>
              </div>
            ))}
          </div>
          <p className="muted small">Tip: the name starts with the same sound as the job.</p>
          <button className="primary next-btn" onClick={start}>
            I’m ready →
          </button>
        </div>
      )}

      {phase === 'wait' && (
        <div className="question srt-card">
          <p className="q-text">Let’s wait a little before I ask.</p>
          <p className="big-timer">{clock((endAt - now) / 1000)}</p>
          <p>Talk about something else for a moment.</p>
          <button className="button" onClick={() => setPhase('test')}>
            Skip the wait
          </button>
        </div>
      )}

      {phase === 'test' && current && options && (
        <>
          <p className="set-progress">
            Person {i + 1} of {order.length}
          </p>
          <Question
            key={`${current.name}-${i}`}
            module="names-pictures"
            skill="nameFace"
            level={`${people.length} people`}
            prompt={
              <div className="picture-prompt">
                <span className="big-picture" aria-hidden="true">
                  {current.emoji}
                </span>
                <p className="q-text">What is this {current.role}’s name?</p>
              </div>
            }
            say={`What is this ${current.role}'s name?`}
            logText={`${cap(current.role)} ${current.name}`}
            answerLabel={current.name}
            helpNames={['Job link', 'First sound', 'Name']}
            helps={[
              { content: <p>Think of the job: <b>{current.role}</b>. The name sounds like it.</p>, say: `Think of the job: ${current.role}. The name sounds like it.` },
              { content: <p className="sound-cue">It starts with <b>“{current.name.slice(0, 2)}…”</b></p>, say: `It starts with ${current.name.slice(0, 2)}.` },
              { content: <p className="model-word">{cap(current.role)} {current.name}</p>, say: `${cap(current.role)} ${current.name}.` },
            ]}
            {...(settings.responseMode === 'spoken'
              ? { kind: 'scored' as const }
              : settings.responseMode === 'typed'
                ? { kind: 'text' as const, accepted: [current.name], inputLabel: 'Name' }
                : { kind: 'choice' as const, options: options.options, answer: options.answer })}
            onLogged={(t) => t.independent && setRight((x) => x + 1)}
            onNext={() => (i + 1 < order.length ? setI(i + 1) : setPhase('done'))}
          />
        </>
      )}

      {phase === 'done' && (
        <div className="question">
          <h2>Done</h2>
          <p className="q-text">
            You remembered <b>{right}</b> of {order.length} on your own.
          </p>
          <button className="primary next-btn" onClick={again} autoFocus>
            Meet new people →
          </button>
        </div>
      )}
    </TaskPage>
  );
}

const optionCache = new Map<string, ReturnType<typeof makeOptions>>();
function optionsFor(p: Person, group: Person[]) {
  const key = `${p.name}|${group.map((g) => g.name).join(',')}`;
  if (!optionCache.has(key)) {
    const others = group.filter((g) => g.name !== p.name).map((g) => g.name);
    const extra = shuffle(PEOPLE.flatMap((x) => x.names).filter((n) => n !== p.name && !others.includes(n))).slice(0, Math.max(0, 4 - 1 - others.length));
    optionCache.set(key, makeOptions([p.name, ...others, ...extra].slice(0, 4)));
  }
  return optionCache.get(key)!;
}
