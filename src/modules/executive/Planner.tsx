import { Question } from '../../components/Question';
import { SetFrame, TaskPage, useSet } from '../../hub/Drill';
import { choiceHelps, makeOptions } from '../../hub/helps';
import { pick, randInt, shuffle } from '../../lib/random';
import { useSettings } from '../../lib/settings';
import { durationText } from './Clocks';

interface Block {
  name: string;
  emoji: string;
  start: number; // minutes since midnight
  len: number;
}

const ACTIVITIES = [
  { name: 'Physical therapy', emoji: '🏃' },
  { name: 'Breakfast', emoji: '🥣' },
  { name: 'Doctor visit', emoji: '🩺' },
  { name: 'Lunch with Sam', emoji: '🥪' },
  { name: 'Grocery shopping', emoji: '🛒' },
  { name: 'Phone call with my son', emoji: '📞' },
  { name: 'Haircut', emoji: '💇' },
  { name: 'Walk the dog', emoji: '🐕' },
  { name: 'Work shift', emoji: '🧾' },
  { name: 'Speech therapy', emoji: '🗣️' },
  { name: 'Laundry', emoji: '🧺' },
  { name: 'Card game', emoji: '🃏' },
  { name: 'Pick up medicine', emoji: '💊' },
  { name: 'Nap', emoji: '😴' },
];

const DAY_START = 8 * 60;
const DAY_END = 18 * 60;

export const time12 = (min: number) => {
  const h = Math.floor(min / 60);
  return `${((h + 11) % 12) + 1}:${String(min % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

/** A day of non-overlapping plans between 8 AM and 6 PM, with gaps. */
export function makeDay(count: number): Block[] {
  for (let tries = 0; tries < 100; tries++) {
    const blocks: Block[] = [];
    for (const a of shuffle(ACTIVITIES).slice(0, count)) {
      const len = pick([30, 60, 60, 90]);
      const start = DAY_START + randInt(0, (DAY_END - DAY_START - len) / 30) * 30;
      if (blocks.every((b) => start + len <= b.start || start >= b.start + b.len)) blocks.push({ ...a, start, len });
    }
    if (blocks.length === count) return blocks.sort((a, b) => a.start - b.start);
  }
  return [{ ...ACTIVITIES[0], start: 9 * 60, len: 60 }];
}

/** Start times (on the half hour) where a plan of `len` minutes fits without overlapping. */
export function freeStarts(day: Block[], len: number): number[] {
  const out: number[] = [];
  for (let t = DAY_START; t + len <= DAY_END; t += 30) if (day.every((b) => t + len <= b.start || t >= b.start + b.len)) out.push(t);
  return out;
}

type Q = { text: string; labels: string[]; hint: string; why?: string } | { text: string; yes: boolean; hint: string; why: string };

function makeQuestion(day: Block[], level: 1 | 2 | 3): Q {
  const b = pick(day);
  const i = day.indexOf(b);
  const otherTimes = shuffle(day.filter((x) => x !== b).map((x) => time12(x.start)));
  const kinds = level === 1 ? ['start', 'what'] : level === 2 ? ['start', 'next', 'howLong', 'end'] : ['free', 'conflict', 'howLong', 'next', 'end'];
  const kind = pick(kinds);
  if (kind === 'what') {
    return { text: `What is planned at ${time12(b.start)}?`, labels: [b.name, ...shuffle(day.filter((x) => x !== b).map((x) => x.name)).slice(0, 3)], hint: `Find ${time12(b.start)} on the left side of the planner.` };
  }
  if (kind === 'next' && i < day.length - 1) {
    const n = day[i + 1];
    return { text: `What comes right after ${b.name}?`, labels: [n.name, ...shuffle(day.filter((x) => x !== n && x !== b).map((x) => x.name)).slice(0, 3)], hint: `Find ${b.name}, then look at the next line down.` };
  }
  if (kind === 'howLong') {
    const others = [b.len + 30, Math.max(30, b.len - 30), b.len + 60].filter((x) => x !== b.len);
    return { text: `How long is ${b.name}?`, labels: [...new Set([durationText(b.len), ...others.map(durationText)])], hint: `It starts at ${time12(b.start)} and ends at ${time12(b.start + b.len)}.` };
  }
  if (kind === 'end') {
    return { text: `What time does ${b.name} end?`, labels: [...new Set([time12(b.start + b.len), time12(b.start), time12(b.start + b.len + 30), time12(b.start + b.len - 30)])], hint: `Add ${durationText(b.len)} to ${time12(b.start)}.` };
  }
  if (kind === 'free') {
    const len = pick([60, 90]);
    const starts = freeStarts(day, len);
    if (starts.length) {
      const first = starts[0];
      const busy = day.map((x) => x.start).filter((t) => !starts.includes(t)).map(time12);
      return {
        text: `You need ${durationText(len)} to visit a friend. What is the earliest time you could start?`,
        labels: [...new Set([time12(first), ...shuffle(busy)])].slice(0, 4),
        hint: 'Look for the first open space that is long enough. Check that nothing starts before you’d finish.',
        why: `${time12(first)} to ${time12(first + len)} is free.`,
      };
    }
  }
  if (kind === 'conflict') {
    const t = DAY_START + randInt(0, 18) * 30;
    const len = 60;
    const clash = day.find((x) => t < x.start + x.len && t + len > x.start);
    return {
      text: `A friend asks you to meet at ${time12(t)} for one hour. Does that clash with your plans?`,
      yes: !!clash,
      hint: `Look at ${time12(t)} to ${time12(t + len)}. Is anything planned then?`,
      why: clash ? `Yes. ${clash.name} is from ${time12(clash.start)} to ${time12(clash.start + clash.len)}.` : `No. ${time12(t)} to ${time12(t + len)} is free.`,
    };
  }
  return { text: `What time does ${b.name} start?`, labels: [time12(b.start), ...otherTimes.slice(0, 3)], hint: `Find ${b.name} in the planner and look at the time next to it.` };
}

export default function Planner() {
  const { settings } = useSettings();
  const level = settings.executiveLevel;
  const set = useSet(() => {
    const day = makeDay(level + 3);
    const q = makeQuestion(day, level);
    return { day, q, opts: 'labels' in q ? makeOptions(q.labels) : null };
  });
  const { day, q, opts } = set.item;

  return (
    <TaskPage id="planner" intro="Read today’s planner. Answer the question.">
      <div className="planner" role="table" aria-label="Today’s planner">
        {day.map((b) => (
          <div key={b.name} className="planner-row" role="row">
            <span className="planner-time" role="cell">
              {time12(b.start)} – {time12(b.start + b.len)}
            </span>
            <span role="cell">
              {b.emoji} {b.name}
            </span>
          </div>
        ))}
      </div>
      <SetFrame set={set} noun="questions">
        {'labels' in q && opts ? (
          <Question
            key={set.n}
            module="planner"
            skill="planner"
            level={`L${level}, ${day.length} plans`}
            prompt={<p className="q-text">{q.text}</p>}
            say={q.text}
            logText={q.text}
            answerLabel={q.labels[0]}
            kind="choice"
            options={opts.options}
            answer={opts.answer}
            helps={choiceHelps({ hint: q.hint, options: opts.options, answer: opts.answer, why: q.why })}
            solvedExtra={q.why ? <p className="why">{q.why}</p> : undefined}
            onLogged={set.onLogged}
            onNext={set.next}
          />
        ) : (
          'yes' in q && (
            <Question
              key={set.n}
              module="planner"
              skill="planner"
              level={`L${level}, conflict`}
              prompt={<p className="q-text">{q.text}</p>}
              say={q.text}
              logText={q.text}
              answerLabel={q.yes ? 'Yes' : 'No'}
              kind="yesno"
              answer={q.yes}
              yesLabel="Yes, it clashes"
              noLabel="No, I’m free"
              helps={[
                { content: <p>{q.hint}</p>, say: q.hint },
                { content: <p>{q.hint} Check where each plan starts and ends.</p>, say: q.hint },
                { content: <p>{q.why}</p>, say: q.why },
              ]}
              solvedExtra={<p className="why">{q.why}</p>}
              onLogged={set.onLogged}
              onNext={set.next}
            />
          )
        )}
      </SetFrame>
    </TaskPage>
  );
}
