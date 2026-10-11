import { useState } from 'react';
import { LEGGO_SETS } from '../data/stores/toys';
import { formatMoney, type Cents } from '../lib/money';
import { levelPrice, type PriceLevel } from '../lib/problems';
import { pick, randInt } from '../lib/random';
import { useSettings } from '../lib/settings';
import { changeHelps, weeksHelps } from '../components/helps';
import { Question } from '../components/Question';
import { SetDone, SetProgress } from '../components/SetDone';

interface Goal {
  id: string;
  name: string;
  emoji: string;
  price: Cents;
}

const GOALS: Goal[] = [
  ...LEGGO_SETS.filter((t) => t.tags.includes('leggo-starwarz') || t.id === 'cabin').map((t) => ({ id: t.id, name: t.name, emoji: t.emoji, price: t.msrp })),
  { id: 'trail-cam', name: 'Bushwhack Trail Camera', emoji: '📷', price: 8999 },
  { id: 'jacket', name: 'Blaze Orange Hunting Jacket', emoji: '🧥', price: 7999 },
  { id: 'license', name: 'Deer License + Tag', emoji: '🦌', price: 4800 },
  { id: 'boots', name: 'Insulated Hunting Boots', emoji: '🥾', price: 12999 },
  { id: 'controller', name: 'Ex-Box Wireless Controller', emoji: '🎮', price: 5999 },
  { id: 'swish', name: 'Nintendough Swish 2', emoji: '🕹️', price: 44999 },
];

const WEEKLY: Record<PriceLevel, Cents[]> = { 1: [500, 1000], 2: [500, 1000, 2000], 3: [500, 1000, 1500, 2000, 2500], 4: [500, 1000, 1500, 2000, 2500] };

interface Problem {
  type: 'more' | 'weeks';
  price: Cents;
  have: Cents;
  weekly: Cents;
}

function makeProblem(goal: Goal, level: PriceLevel, n: number): Problem {
  const wholeDollars = level <= 2;
  const price = levelPrice(goal.price, wholeDollars ? 1 : 3);
  const have = wholeDollars
    ? randInt(Math.ceil((price * 0.1) / 100), Math.floor((price * 0.85) / 100)) * 100
    : randInt(Math.ceil(price * 0.1), Math.floor(price * 0.85));
  const need = price - have;
  // Pick a weekly amount that takes a sensible number of weeks (2–15).
  const options = WEEKLY[level].filter((w) => {
    const weeks = Math.ceil(need / w);
    return weeks >= 2 && weeks <= 15;
  });
  const weekly = options.length ? pick(options) : Math.ceil(need / 10 / 500) * 500;
  return { type: n % 2 === 1 ? 'more' : 'weeks', price, have, weekly };
}

export default function SavingUp() {
  const { settings } = useSettings();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [n, setN] = useState(1);
  const [independent, setIndependent] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const level = settings.priceLevel;
  const setLength = settings.setLength;

  const start = (g: Goal) => {
    setGoal(g);
    setN(1);
    setIndependent(0);
    setProblem(makeProblem(g, level, 1));
  };

  if (!goal || !problem) {
    return (
      <div className="drill">
        <h1 className="drill-title">🐷 Saving Up</h1>
        <p className="q-text">What do you want to save up for?</p>
        <div className="goal-grid">
          {GOALS.map((g) => (
            <button key={g.id} className="goal-tile" onClick={() => start(g)}>
              <span className="goal-emoji" aria-hidden="true">
                {g.emoji}
              </span>
              <span className="goal-name">{g.name}</span>
              <span className="goal-price">{formatMoney(levelPrice(g.price, level <= 2 ? 1 : 3))}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const header = (
    <>
      <h1 className="drill-title">🐷 Saving Up</h1>
      <button className="link-btn" onClick={() => setGoal(null)}>
        ← Pick a different goal
      </button>
    </>
  );

  if (setLength > 0 && n > setLength) {
    return (
      <div className="drill">
        {header}
        <SetDone count={setLength} independent={independent} onAgain={() => start(goal)} />
      </div>
    );
  }

  const { type, price, have, weekly } = problem;
  const need = price - have;
  const weeks = Math.ceil(need / weekly);
  const pct = Math.round((have / price) * 100);

  const goalCard = (
    <div className="goal-card">
      <span className="goal-emoji" aria-hidden="true">
        {goal.emoji}
      </span>
      <div className="goal-card-info">
        <b>{goal.name}</b>
        <span>Price: {formatMoney(price)}</span>
        <div className="progress" role="img" aria-label={`You have ${formatMoney(have)} of ${formatMoney(price)}`}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="muted">
          {type === 'more' ? `You have ${formatMoney(have)} saved.` : `You still need ${formatMoney(need)}.`}
        </span>
      </div>
    </div>
  );

  const next = () => {
    setProblem(makeProblem(goal, level, n + 1));
    setN(n + 1);
  };

  return (
    <div className="drill">
      {header}
      <SetProgress n={n} of={setLength} />
      {type === 'more' ? (
        <Question
          key={n}
          module="savings"
          skill="moreNeeded"
          level={`L${level}`}
          kind="money"
          answer={need}
          answerLabel={formatMoney(need)}
          inputLabel="You need"
          prompt={
            <>
              {goalCard}
              <p className="q-text">
                The {goal.name} costs <b>{formatMoney(price)}</b>. You have <b>{formatMoney(have)}</b>. How much more do you need?
              </p>
            </>
          }
          say={`The ${goal.name} costs ${formatMoney(price)}. You have ${formatMoney(have)}. How much more do you need?`}
          logText={`${goal.name}: ${formatMoney(price)} − ${formatMoney(have)} saved`}
          helps={changeHelps(have, price, settings.changeHelpStyle, 'more')}
          onLogged={(t) => t.independent && setIndependent((x) => x + 1)}
          onNext={next}
        />
      ) : (
        <Question
          key={n}
          module="savings"
          skill="weeks"
          level={`L${level}`}
          kind="number"
          answer={weeks}
          answerLabel={`${weeks} weeks`}
          inputLabel="It takes"
          unit="weeks"
          prompt={
            <>
              {goalCard}
              <p className="q-text">
                You still need <b>{formatMoney(need)}</b>. You save <b>{formatMoney(weekly)}</b> every week. How many weeks until you have enough?
              </p>
            </>
          }
          say={`You still need ${formatMoney(need)}. You save ${formatMoney(weekly)} every week. How many weeks until you have enough?`}
          logText={`${formatMoney(need)} at ${formatMoney(weekly)}/week`}
          helps={weeksHelps(need, weekly)}
          onLogged={(t) => t.independent && setIndependent((x) => x + 1)}
          onNext={next}
        />
      )}
    </div>
  );
}
