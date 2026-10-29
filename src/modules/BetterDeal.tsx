import { useState } from 'react';
import { makeDealProblem, type DealOption, type DealProblem } from '../lib/deals';
import { formatMoney } from '../lib/money';
import { useSettings } from '../lib/settings';
import { changeHelps } from '../components/helps';
import { Question, type Help } from '../components/Question';
import { SetDone, SetProgress } from '../components/SetDone';
import { Totals } from '../components/Totals';

const numberWord = (n: number) => ['zero', 'one', 'two', 'three', 'four', 'five'][n] ?? String(n);

/** Which store has the better deal? Then: how much do you save? */
export default function BetterDeal() {
  const { settings } = useSettings();
  const level = settings.priceLevel;
  const setLength = settings.setLength;
  const [n, setN] = useState(1);
  const [phase, setPhase] = useState<'pick' | 'save'>('pick');
  const [independent, setIndependent] = useState(0);
  const [problem, setProblem] = useState(() => makeDealProblem(level));
  const title = <h1 className="drill-title">🏷️ Better Deal?</h1>;

  if (setLength > 0 && n > setLength) {
    return (
      <div className="drill">
        {title}
        <SetDone
          count={setLength}
          independent={independent}
          onAgain={() => {
            setN(1);
            setPhase('pick');
            setIndependent(0);
            setProblem(makeDealProblem(level));
          }}
        />
      </div>
    );
  }

  const { item, need, options, better, save } = problem;
  const best = options[better];
  const worse = options[1 - better];
  const needText = need > 1 ? `You need ${numberWord(need)}.` : 'You need one.';

  return (
    <div className="drill">
      {title}
      <SetProgress n={n} of={setLength} />
      {phase === 'pick' ? (
        <Question
          key={`${n}-pick`}
          module="deals"
          skill="betterDeal"
          level={`L${level} ${problem.kind}`}
          kind="custom"
          answerLabel={`${best.store} is the better deal`}
          prompt={
            <p className="q-text">
              {item.emoji} You want <b>{item.name}</b>. {needText} Which store has the better deal?
            </p>
          }
          say={`You want ${item.name}. ${needText} ${options.map((o) => `${o.store}: ${o.sign}${o.saleBadge ? `, ${o.saleBadge}` : ''}`).join('. ')}. Which store has the better deal?`}
          logText={`${item.name} ×${need}: ${options.map((o) => `${o.store} ${o.sign}${o.saleBadge ? ` (${o.saleBadge})` : ''}`).join(' vs ')}`}
          helps={dealHelps(problem)}
          check={(v) =>
            v === better ? { ok: true } : { ok: false, message: `Not quite. Work out what you'd pay for ${numberWord(need)} at each store.` }
          }
          render={(submit, solved) => (
            <div className="deal-options">
              {options.map((o, i) => (
                <DealCard key={o.store} option={o} emoji={item.emoji} disabled={solved} picked={solved && i === better} onPick={() => submit(i)} />
              ))}
            </div>
          )}
          onLogged={(t) => t.independent && setIndependent((x) => x + 1)}
          onNext={() => setPhase('save')}
          nextLabel="How much do you save?"
        />
      ) : (
        <Question
          key={`${n}-save`}
          module="deals"
          skill="dealSave"
          level={`L${level} ${problem.kind}`}
          kind="money"
          answer={save}
          answerLabel={formatMoney(save)}
          inputLabel="You save"
          prompt={
            <>
              <Totals
                rows={[
                  [`${best.store}: ${best.sign}${best.saleBadge ? `, ${best.saleBadge}` : ''}`, formatMoney(best.cost)],
                  [`${worse.store}: ${worse.sign}${worse.saleBadge ? `, ${worse.saleBadge}` : ''}`, formatMoney(worse.cost)],
                ]}
              />
              <p className="q-text">
                {need > 1 ? `For ${numberWord(need)}, ` : ''}
                {best.store} costs <b>{formatMoney(best.cost)}</b> and {worse.store} costs <b>{formatMoney(worse.cost)}</b>. How much do you save at {best.store}?
              </p>
            </>
          }
          say={`${best.store} costs ${formatMoney(best.cost)} and ${worse.store} costs ${formatMoney(worse.cost)}. How much do you save at ${best.store}?`}
          logText={`${formatMoney(worse.cost)} − ${formatMoney(best.cost)}`}
          helps={changeHelps(best.cost, worse.cost, settings.changeHelpStyle, 'save')}
          onLogged={(t) => t.independent && setIndependent((x) => x + 1)}
          onNext={() => {
            setProblem(makeDealProblem(level));
            setPhase('pick');
            setN(n + 1);
          }}
        />
      )}
    </div>
  );
}

function DealCard({ option, emoji, disabled, picked, onPick }: { option: DealOption; emoji: string; disabled: boolean; picked: boolean; onPick: () => void }) {
  return (
    <button className={`deal-card${picked ? ' picked' : ''}`} disabled={disabled} onClick={onPick}>
      <span className="deal-store">{option.store}</span>
      <span className="deal-emoji" aria-hidden="true">
        {emoji}
      </span>
      {option.saleBadge && <span className="deal-badge">{option.saleBadge}</span>}
      <span className="deal-sign">{option.sign}</span>
      {picked && <span className="deal-picked">✓ Better deal</span>}
    </button>
  );
}

function dealHelps(p: DealProblem): [Help, Help, Help] {
  const [a, b] = p.options;
  const best = p.options[p.better];
  const hint =
    p.need > 1
      ? `You need ${numberWord(p.need)}. Work out what ${numberWord(p.need)} would cost at each store. Then pick the smaller total.`
      : 'Work out what you would really pay at each store. Then pick the smaller amount.';
  const trap = p.kind === 'trap' ? ' A big SALE sign does not always mean it is cheaper!' : '';
  return [
    { content: <p>{hint}</p>, say: hint },
    {
      content: (
        <ul className="steps-list">
          <li>
            <b>{a.store}:</b> {a.workQ}
          </li>
          <li>
            <b>{b.store}:</b> {b.workQ}
          </li>
        </ul>
      ),
      say: `${a.store}: ${a.workQ}. ${b.store}: ${b.workQ}.`,
    },
    {
      content: (
        <>
          <ul className="steps-list">
            <li>
              <b>{a.store}:</b> {a.workA}
            </li>
            <li>
              <b>{b.store}:</b> {b.workA}
            </li>
          </ul>
          <p>
            <b>{best.store}</b> costs less, so it's the better deal.{trap}
          </p>
        </>
      ),
      say: `${a.store}: ${a.workA}. ${b.store}: ${b.workA}. ${best.store} costs less, so it's the better deal.${trap}`,
    },
  ];
}
