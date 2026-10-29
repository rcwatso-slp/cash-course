import { useState } from 'react';
import { makeAffordProblem } from '../lib/budget';
import { breakdown, formatMoney } from '../lib/money';
import { useSettings } from '../lib/settings';
import { affordHelps } from '../components/helps';
import { MoneyPile } from '../components/MoneyView';
import { Question } from '../components/Question';
import { SetDone, SetProgress } from '../components/SetDone';

/** Quick yes/no: "You have $10. It costs $11.29. Can you buy it?" */
export default function AffordIt() {
  const { settings } = useSettings();
  const level = settings.priceLevel;
  const [n, setN] = useState(1);
  const [independent, setIndependent] = useState(0);
  const [problem, setProblem] = useState(() => makeAffordProblem(level));
  const setLength = settings.setLength;

  const title = <h1 className="drill-title">🤔 Can I Afford It?</h1>;

  if (setLength > 0 && n > setLength) {
    return (
      <div className="drill">
        {title}
        <SetDone
          count={setLength}
          independent={independent}
          onAgain={() => {
            setN(1);
            setIndependent(0);
            setProblem(makeAffordProblem(level));
          }}
        />
      </div>
    );
  }

  const { have, items, cost, canBuy } = problem;
  const two = items.length > 1;
  const itemText = items.map((i) => `${i.name} (${formatMoney(i.price)})`).join(' and ');

  return (
    <div className="drill">
      {title}
      <SetProgress n={n} of={setLength} />
      <Question
        key={n}
        module="afford"
        skill="afford"
        level={`L${level}`}
        kind="yesno"
        yesLabel="Yes, I can buy it"
        noLabel="No, not enough"
        answer={canBuy}
        answerLabel={canBuy ? 'You can buy it' : "You can't buy it"}
        prompt={
          <div className="scenario">
            <p className="q-text">
              You have <b>{formatMoney(have)}</b>:
            </p>
            <MoneyPile denoms={breakdown(have)} />
            <div className="afford-items">
              {items.map((i) => (
                <div key={i.name} className="afford-item">
                  <span className="afford-emoji" aria-hidden="true">
                    {i.emoji}
                  </span>
                  <span className="afford-name">{i.name}</span>
                  <b className="afford-price">{formatMoney(i.price)}</b>
                </div>
              ))}
            </div>
            <p className="q-text">{two ? 'Can you buy both?' : 'Can you buy it?'}</p>
          </div>
        }
        say={`You have ${formatMoney(have)}. ${two ? 'You want' : 'It is'} ${itemText}. ${two ? 'Can you buy both?' : 'Can you buy it?'}`}
        logText={`Have ${formatMoney(have)}, cost ${items.map((i) => formatMoney(i.price)).join(' + ')}`}
        helps={affordHelps(
          have,
          items.map((i) => i.price),
        )}
        solvedExtra={
          <p className="say-this">
            {canBuy
              ? cost === have
                ? 'You have exactly enough. Nothing left over.'
                : `You'd have ${formatMoney(have - cost)} left over.`
              : `You'd need ${formatMoney(cost - have)} more.`}
          </p>
        }
        onLogged={(t) => t.independent && setIndependent((x) => x + 1)}
        onNext={() => {
          setProblem(makeAffordProblem(level));
          setN(n + 1);
        }}
      />
    </div>
  );
}
