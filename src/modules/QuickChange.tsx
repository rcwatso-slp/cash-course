import { useState } from 'react';
import { breakdown, formatMoney } from '../lib/money';
import { makeChangeProblem } from '../lib/problems';
import { useSettings } from '../lib/settings';
import { changeHelps } from '../components/helps';
import { MoneyPile } from '../components/MoneyView';
import { Question } from '../components/Question';
import { SetDone, SetProgress } from '../components/SetDone';

export default function QuickChange() {
  const { settings } = useSettings();
  const [n, setN] = useState(1);
  const [independent, setIndependent] = useState(0);
  const [problem, setProblem] = useState(() => makeChangeProblem(settings.changeLevel));
  const setLength = settings.setLength;

  const next = () => {
    setProblem(makeChangeProblem(settings.changeLevel));
    setN(n + 1);
  };

  if (setLength > 0 && n > setLength) {
    return (
      <div className="drill">
        <h1 className="drill-title">💵 Quick Change</h1>
        <SetDone
          count={setLength}
          independent={independent}
          onAgain={() => {
            setN(1);
            setIndependent(0);
            setProblem(makeChangeProblem(settings.changeLevel));
          }}
        />
      </div>
    );
  }

  const { price, paid } = problem;
  const change = paid - price;

  return (
    <div className="drill">
      <h1 className="drill-title">💵 Quick Change</h1>
      <SetProgress n={n} of={setLength} />
      <Question
        key={n}
        module="quickChange"
        skill="change"
        level={`C${settings.changeLevel}`}
        kind="money"
        answer={change}
        answerLabel={formatMoney(change)}
        inputLabel="Change"
        prompt={
          <div className="scenario">
            <p className="q-text">
              The price is <b>{formatMoney(price)}</b>.
            </p>
            <p className="q-text">You pay with {formatMoney(paid)}:</p>
            <MoneyPile denoms={breakdown(paid, [2000, 1000, 500, 100])} />
            <p className="q-text">How much change should you get back?</p>
          </div>
        }
        say={`The price is ${formatMoney(price)}. You pay with ${formatMoney(paid)}. How much change should you get back?`}
        logText={`Change from ${formatMoney(paid)} for ${formatMoney(price)}`}
        helps={changeHelps(price, paid, settings.changeHelpStyle)}
        onLogged={(t) => t.independent && setIndependent((x) => x + 1)}
        onNext={next}
      />
    </div>
  );
}
