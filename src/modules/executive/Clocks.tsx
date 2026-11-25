import { useEffect, useState } from 'react';
import { Question } from '../../components/Question';
import { SetFrame, TaskPage, useSet } from '../../hub/Drill';
import { choiceHelps, makeOptions } from '../../hub/helps';
import { pick, randInt } from '../../lib/random';
import { useSettings } from '../../lib/settings';

type Mode = 'read' | 'set' | 'elapsed';

/** Minutes since midnight → "3:05" (12-hour, no AM/PM). */
export const clockText = (min: number) => {
  const m = ((min % 720) + 720) % 720;
  const h = Math.floor(m / 60) || 12;
  return `${h}:${String(m % 60).padStart(2, '0')}`;
};

/** How long, in words: 1 hour 15 minutes. */
export const durationText = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h && `${h} hour${h > 1 ? 's' : ''}`, m && `${m} minutes`].filter(Boolean).join(' ') || '0 minutes';
};

const STEP = { 1: 30, 2: 15, 3: 5 } as const;

function randomTime(level: 1 | 2 | 3) {
  const step = STEP[level];
  return randInt(1, 12) * 60 + randInt(0, 60 / step - 1) * step;
}

/** An analog clock. Hands are drawn from the time in minutes. */
export function AnalogClock({ minutes, size = 220 }: { minutes: number; size?: number }) {
  const m = minutes % 60;
  const h = (minutes / 60) % 12;
  const hand = (deg: number, len: number, w: number, cls: string) => {
    const r = ((deg - 90) * Math.PI) / 180;
    return <line className={cls} x1={50} y1={50} x2={50 + Math.cos(r) * len} y2={50 + Math.sin(r) * len} strokeWidth={w} strokeLinecap="round" />;
  };
  return (
    <svg className="analog-clock" viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="Clock">
      <circle cx={50} cy={50} r={47} className="clock-face" />
      {Array.from({ length: 60 }, (_, i) => {
        const r = ((i * 6 - 90) * Math.PI) / 180;
        const inner = i % 5 === 0 ? 41 : 44;
        return <line key={i} x1={50 + Math.cos(r) * inner} y1={50 + Math.sin(r) * inner} x2={50 + Math.cos(r) * 46} y2={50 + Math.sin(r) * 46} className="clock-tick" strokeWidth={i % 5 === 0 ? 1.2 : 0.5} />;
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const r = ((n * 30 - 90) * Math.PI) / 180;
        return (
          <text key={n} x={50 + Math.cos(r) * 34} y={50 + Math.sin(r) * 34 + 3.5} textAnchor="middle" className="clock-num">
            {n}
          </text>
        );
      })}
      {hand(h * 30, 22, 3.5, 'clock-hour')}
      {hand(m * 6, 34, 2, 'clock-minute')}
      <circle cx={50} cy={50} r={2.2} className="clock-center" />
    </svg>
  );
}

function makeItem(mode: Mode, level: 1 | 2 | 3) {
  const t = randomTime(level);
  if (mode === 'read') {
    const swapped = (Math.round(((t % 60) / 5)) || 12) * 60 + (Math.floor(t / 60) % 12) * 5;
    const wrong = [t + 60, t - (STEP[level] === 30 ? 30 : 15), swapped].map(clockText).filter((x) => x !== clockText(t));
    const labels = [...new Set([clockText(t), ...wrong])];
    while (labels.length < 4) labels.push(clockText(t + 60 * randInt(2, 5)));
    return { mode, t, ...makeOptions(labels.slice(0, 4)) };
  }
  if (mode === 'set') return { mode, t, ...makeOptions([clockText(t)]) };
  // elapsed: either "what time will it be" or "how long"
  const add = pick(level === 1 ? [30, 60, 120] : level === 2 ? [15, 45, 75, 90] : [25, 40, 85, 105, 135]);
  if (Math.random() < 0.5) {
    const labels = [clockText(t + add), clockText(t + add + (level === 1 ? 30 : 15)), clockText(t + add - (level === 1 ? 30 : 15)), clockText(t + add + 60)];
    return { mode, t, add, kind: 'later' as const, ...makeOptions([...new Set(labels)]) };
  }
  const labels = [durationText(add), durationText(add + (level === 1 ? 30 : 15)), durationText(Math.max(5, add - (level === 1 ? 30 : 15))), durationText(add + 60)];
  return { mode, t, add, kind: 'howLong' as const, ...makeOptions([...new Set(labels)]) };
}

const MODES: { id: Mode; label: string }[] = [
  { id: 'read', label: 'Read the clock' },
  { id: 'set', label: 'Set the clock' },
  { id: 'elapsed', label: 'How long?' },
];

export default function Clocks() {
  const { settings } = useSettings();
  const level = settings.executiveLevel;
  const [mode, setMode] = useState<Mode>('read');
  const set = useSet(() => makeItem(mode, level));
  const item = set.item;
  const [setH, setSetH] = useState(12);
  const [setM, setSetM] = useState(0);

  useEffect(() => {
    if (item.mode !== mode) set.again();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, item.mode]);
  useEffect(() => {
    setSetH(12);
    setSetM(0);
  }, [set.n, item]);

  const target = clockText(item.t);
  const common = { module: 'clocks', skill: 'clockTime' as const, onLogged: set.onLogged, onNext: set.next };
  const step = STEP[level];

  return (
    <TaskPage id="clocks">
      <div className="mode-toggle" role="group" aria-label="Kind of practice">
        {MODES.map((m) => (
          <button key={m.id} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>
            {m.label}
          </button>
        ))}
      </div>
      <SetFrame set={set} noun="clocks">
        {item.mode === 'read' && (
          <Question
            key={set.n}
            {...common}
            level={`Read, every ${step} min`}
            prompt={
              <div className="clock-prompt">
                <AnalogClock minutes={item.t} />
                <p className="q-text">What time is it?</p>
              </div>
            }
            say="What time does the clock show?"
            logText={`Read clock: ${target}`}
            answerLabel={target}
            {...(settings.responseMode === 'typed'
              ? { kind: 'text' as const, accepted: [target], digits: true, inputLabel: 'Time (like 3:45)' }
              : { kind: 'choice' as const, options: item.options, answer: item.answer })}
            helps={[
              { content: <p>The short hand is the hour. It points to (or just past) <b>{Math.floor(item.t / 60) % 12 || 12}</b>.</p>, say: `The short hand is the hour. It points to ${Math.floor(item.t / 60) % 12 || 12}.` },
              { content: <p>The long hand is the minutes. Count by 5s from the 12: it’s at <b>{item.t % 60}</b> minutes.</p>, say: `The long hand is the minutes. Count by fives from the twelve. It's at ${item.t % 60} minutes.` },
              { content: <p>It is <b>{target}</b>.</p>, say: `It is ${target}.` },
            ]}
          />
        )}

        {item.mode === 'set' && (
          <Question
            key={set.n}
            {...common}
            level={`Set, every ${step} min`}
            prompt={<p className="q-text big-q">Set the clock to {target}.</p>}
            say={`Set the clock to ${target}.`}
            logText={`Set clock: ${target}`}
            answerLabel={target}
            kind="custom"
            check={(v) => {
              const [h, m] = v as [number, number];
              if (h * 60 + m === (Math.floor(item.t / 60) % 12 || 12) * 60 + (item.t % 60)) return { ok: true };
              return { ok: false, message: `That shows ${clockText(h * 60 + m)}. Look at the hour and the minutes again.` };
            }}
            render={(submit, solved) => (
              <div className="clock-set">
                <AnalogClock minutes={setH * 60 + setM} />
                <p className="clock-readout">{clockText(setH * 60 + setM)}</p>
                {!solved && (
                  <>
                    <div className="clock-buttons">
                      <span>Hour</span>
                      <button className="button" onClick={() => setSetH(setH === 1 ? 12 : setH - 1)} aria-label="Hour back">−</button>
                      <button className="button" onClick={() => setSetH(setH === 12 ? 1 : setH + 1)} aria-label="Hour forward">+</button>
                      <span>Minutes</span>
                      <button className="button" onClick={() => setSetM((setM - step + 60) % 60)} aria-label="Minutes back">−{step}</button>
                      <button className="button" onClick={() => setSetM((setM + step) % 60)} aria-label="Minutes forward">+{step}</button>
                    </div>
                    <button className="primary" onClick={() => submit([setH, setM])}>
                      Check
                    </button>
                  </>
                )}
              </div>
            )}
            helps={[
              { content: <p>Set the hour first: {Math.floor(item.t / 60) % 12 || 12}.</p>, say: `Set the hour first: ${Math.floor(item.t / 60) % 12 || 12}.` },
              { content: <p>Then the minutes: {item.t % 60}. The long hand points to the {(item.t % 60) / 5 || 12}.</p>, say: `Then the minutes: ${item.t % 60}.` },
              { content: <AnalogClock minutes={item.t} size={140} />, say: `This is what ${target} looks like.` },
            ]}
          />
        )}

        {item.mode === 'elapsed' && 'kind' in item && (
          <Question
            key={set.n}
            {...common}
            level={`How long, ${durationText(item.add)}`}
            prompt={
              <div className="clock-prompt">
                <AnalogClock minutes={item.t} size={170} />
                <p className="q-text">
                  {item.kind === 'later'
                    ? `It is ${clockText(item.t)} now. What time will it be in ${durationText(item.add)}?`
                    : `A movie starts at ${clockText(item.t)} and ends at ${clockText(item.t + item.add)}. How long is it?`}
                </p>
              </div>
            }
            say={item.kind === 'later' ? `It is ${clockText(item.t)} now. What time will it be in ${durationText(item.add)}?` : `A movie starts at ${clockText(item.t)} and ends at ${clockText(item.t + item.add)}. How long is it?`}
            logText={item.kind === 'later' ? `${clockText(item.t)} + ${durationText(item.add)}` : `${clockText(item.t)} to ${clockText(item.t + item.add)}`}
            answerLabel={item.kind === 'later' ? clockText(item.t + item.add) : durationText(item.add)}
            kind="choice"
            options={item.options}
            answer={item.answer}
            helps={choiceHelps({
              hint: item.kind === 'later' ? 'Add the hours first, then the minutes.' : `Count up from ${clockText(item.t)}: first the whole hours, then the minutes.`,
              options: item.options,
              answer: item.answer,
            })}
          />
        )}
      </SetFrame>
    </TaskPage>
  );
}
