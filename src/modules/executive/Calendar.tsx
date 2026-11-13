import { useState } from 'react';
import { Question } from '../../components/Question';
import { TaskPage } from '../../hub/Drill';
import { choiceHelps, makeOptions } from '../../hub/helps';
import { pick, randInt, shuffle } from '../../lib/random';
import { useSettings } from '../../lib/settings';

const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const EVENTS = [
  { name: 'Doctor', emoji: '🩺' },
  { name: 'Dentist', emoji: '🦷' },
  { name: 'Physical therapy', emoji: '🏃' },
  { name: 'Haircut', emoji: '💇' },
  { name: 'Lunch with Sam', emoji: '🥪' },
  { name: 'Grocery shopping', emoji: '🛒' },
  { name: 'Book club', emoji: '📚' },
  { name: 'Pharmacy pickup', emoji: '💊' },
  { name: 'Work shift', emoji: '🧾' },
  { name: 'Eye exam', emoji: '👓' },
  { name: 'Bank', emoji: '🏦' },
  { name: 'Family visit', emoji: '👪' },
  { name: 'Card game', emoji: '🃏' },
  { name: 'Church', emoji: '⛪' },
];
const TIMES = [9 * 60, 9 * 60 + 30, 10 * 60 + 30, 11 * 60, 13 * 60, 14 * 60 + 15, 15 * 60 + 30, 16 * 60 + 45];

export const timeText = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

interface Ev {
  name: string;
  emoji: string;
  day: number;
  time: number;
}

function makeWeek(level: 1 | 2 | 3): Ev[] {
  const count = level === 1 ? 4 : level === 2 ? 6 : 8;
  // Leave at least one day empty.
  const empty = randInt(0, 6);
  const days = [0, 1, 2, 3, 4, 5, 6].filter((d) => d !== empty);
  const out: Ev[] = [];
  for (const e of shuffle(EVENTS).slice(0, count)) {
    let tries = 0;
    let day: number;
    let time: number;
    do {
      day = pick(days);
      time = pick(TIMES);
      tries++;
    } while (out.some((o) => o.day === day && o.time === time) && tries < 50);
    out.push({ ...e, day, time });
  }
  return out.sort((a, b) => a.day - b.day || a.time - b.time);
}

type Q =
  | { kind: 'choice'; text: string; labels: string[]; hint: string; why?: string }
  | { kind: 'number'; text: string; answer: number; hint: string }
  | { kind: 'yesno'; text: string; answer: boolean; hint: string; why: string };

function makeQuestion(week: Ev[], level: 1 | 2 | 3): Q {
  const e = pick(week);
  const types = level === 1 ? ['day', 'time'] : level === 2 ? ['day', 'time', 'empty', 'count'] : ['leave', 'move', 'count', 'empty', 'leave'];
  const type = pick(types);
  if (type === 'day') {
    const others = shuffle(WEEK.filter((_, i) => i !== e.day)).slice(0, 3);
    return { kind: 'choice', text: `What day is ${e.name}?`, labels: [WEEK[e.day], ...others], hint: `Find ${e.name} on the calendar. Look up to see the day.` };
  }
  if (type === 'time') {
    const others = shuffle(TIMES.filter((t) => t !== e.time)).slice(0, 3).map(timeText);
    return { kind: 'choice', text: `What time is ${e.name} on ${WEEK[e.day]}?`, labels: [timeText(e.time), ...others], hint: `Look at ${WEEK[e.day]}. Find ${e.name}.` };
  }
  const free = WEEK.filter((_, i) => !week.some((w) => w.day === i));
  if (type === 'empty' && free.length > 0) {
    const busy = shuffle(WEEK.filter((_, i) => week.some((w) => w.day === i))).slice(0, 3);
    return { kind: 'choice', text: 'Which day has nothing planned?', labels: [free[0], ...busy], hint: 'Look for a day with no boxes under it.' };
  }
  if (type === 'count' || type === 'empty') {
    const day = pick(week).day;
    return { kind: 'number', text: `How many things are planned on ${WEEK[day]}?`, answer: week.filter((w) => w.day === day).length, hint: `Look only at ${WEEK[day]}. Count the boxes.` };
  }
  if (type === 'leave') {
    const travel = pick([15, 30, 45]);
    const leave = e.time - travel;
    const labels = [leave, e.time, e.time + travel, e.time - travel * 2].map(timeText);
    return {
      kind: 'choice',
      text: `It takes ${travel} minutes to get to ${e.name}. What time should you leave on ${WEEK[e.day]}?`,
      labels,
      hint: `${e.name} is at ${timeText(e.time)}. Go back ${travel} minutes.`,
      why: `${timeText(e.time)} minus ${travel} minutes is ${timeText(leave)}.`,
    };
  }
  // move: the event moves to the next day, same time. Is there a conflict?
  const movable = week.filter((w) => w.day < 6);
  const ev = pick(movable.length ? movable : week);
  const nextDay = Math.min(ev.day + 1, 6);
  const clash = week.find((w) => w.day === nextDay && w.time === ev.time && w !== ev);
  return {
    kind: 'yesno',
    text: `${ev.name} moves to ${WEEK[nextDay]} at the same time (${timeText(ev.time)}). Does it clash with something else?`,
    answer: !!clash,
    hint: `Look at ${WEEK[nextDay]}. Is anything at ${timeText(ev.time)}?`,
    why: clash ? `Yes. ${clash.name} is already at ${timeText(ev.time)} on ${WEEK[nextDay]}.` : `No. Nothing else is at ${timeText(ev.time)} on ${WEEK[nextDay]}.`,
  };
}

/** Also add a clash sometimes, so "yes" is a real answer to the move question. */
function weekWithClash(level: 1 | 2 | 3): Ev[] {
  const week = makeWeek(level);
  if (level === 3 && Math.random() < 0.5 && week.length > 1) {
    const a = week.find((w) => w.day < 6);
    if (a) {
      const b = week.find((w) => w !== a && w.day !== a.day + 1);
      if (b && !week.some((w) => w.day === a.day + 1 && w.time === a.time)) {
        b.day = a.day + 1;
        b.time = a.time;
      }
    }
  }
  return week.sort((x, y) => x.day - y.day || x.time - y.time);
}

const PER_WEEK = 4;

export default function Calendar() {
  const { settings } = useSettings();
  const level = settings.executiveLevel;
  const [week, setWeek] = useState(() => weekWithClash(level));
  const [n, setN] = useState(1);
  const [q, setQ] = useState<Q>(() => makeQuestion(week, level));
  const [opts, setOpts] = useState(() => (q.kind === 'choice' ? makeOptions(q.labels) : null));

  function next() {
    const newWeek = n % PER_WEEK === 0 ? weekWithClash(level) : week;
    const nq = makeQuestion(newWeek, level);
    setWeek(newWeek);
    setQ(nq);
    setOpts(nq.kind === 'choice' ? makeOptions(nq.labels) : null);
    setN(n + 1);
  }

  const answerLabel = q.kind === 'choice' ? q.labels[0] : q.kind === 'number' ? String(q.answer) : q.answer ? 'Yes' : 'No';
  const common = {
    module: 'calendar',
    skill: 'calendar' as const,
    level: `L${level}`,
    prompt: <p className="q-text">{q.text}</p>,
    say: q.text,
    logText: q.text,
    answerLabel,
    onNext: next,
  };
  const simpleHelps = (why?: string) =>
    [
      { content: <p>{q.hint}</p>, say: q.hint },
      { content: <p>{q.hint} Take your time and point to it.</p>, say: q.hint },
      { content: <p>The answer is <b>{answerLabel}</b>. {why}</p>, say: `The answer is ${answerLabel}. ${why ?? ''}` },
    ] as [{ content: JSX.Element; say: string }, { content: JSX.Element; say: string }, { content: JSX.Element; say: string }];

  return (
    <TaskPage id="calendar" wide>
      <div className="week-cal" role="table" aria-label="This week's calendar">
        {WEEK.map((d, i) => (
          <div key={d} className="week-day" role="row">
            <div className="week-day-name" role="columnheader">
              {d}
            </div>
            {week
              .filter((e) => e.day === i)
              .map((e) => (
                <div key={e.name} className="week-event" role="cell">
                  <span className="week-time">{timeText(e.time)}</span>
                  <span>
                    {e.emoji} {e.name}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>
      <p className="set-progress">Question {n}</p>
      {q.kind === 'choice' && opts && (
        <Question key={n} {...common} kind="choice" options={opts.options} answer={opts.answer} helps={choiceHelps({ hint: q.hint, options: opts.options, answer: opts.answer, why: q.why })} solvedExtra={q.why ? <p className="why">{q.why}</p> : undefined} />
      )}
      {q.kind === 'number' && <Question key={n} {...common} kind="number" answer={q.answer} inputLabel="How many" unit="" helps={simpleHelps()} />}
      {q.kind === 'yesno' && <Question key={n} {...common} kind="yesno" answer={q.answer} yesLabel="Yes, it clashes" noLabel="No, it’s fine" helps={simpleHelps(q.why)} solvedExtra={<p className="why">{q.why}</p>} />}
    </TaskPage>
  );
}
