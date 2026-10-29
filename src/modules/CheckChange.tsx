import { useState } from 'react';
import { breakdown, formatMoney, sum, type Cents } from '../lib/money';
import { cashierGives, makeChangeProblem, type CashierResult } from '../lib/problems';
import { useSettings } from '../lib/settings';
import { changeHelps, checkChangeHelps } from '../components/helps';
import { MoneyPile } from '../components/MoneyView';
import { Question } from '../components/Question';
import { ReadAloud } from '../components/ReadAloud';
import { SetDone, SetProgress } from '../components/SetDone';

function newProblem(level: 1 | 2 | 3 | 4, errorRate: number) {
  const { price, paid } = makeChangeProblem(level);
  return { price, paid, cashier: cashierGives(paid - price, errorRate) };
}

const spoken = (c: Cents) => (c < 100 ? `${c} cents` : formatMoney(c));

/** First he works out the change, then checks what the cashier actually handed back. */
export default function CheckChange() {
  const { settings } = useSettings();
  const [n, setN] = useState(1);
  const [phase, setPhase] = useState<'compute' | 'check'>('compute');
  const [independent, setIndependent] = useState(0);
  const [problem, setProblem] = useState(() => newProblem(settings.changeLevel, settings.wrongChangeRate));
  const setLength = settings.setLength;

  const restart = () => {
    setN(1);
    setPhase('compute');
    setIndependent(0);
    setProblem(newProblem(settings.changeLevel, settings.wrongChangeRate));
  };

  if (setLength > 0 && n > setLength) {
    return (
      <div className="drill">
        <h1 className="drill-title">🪙 Check the Change</h1>
        <SetDone count={setLength} independent={independent} onAgain={restart} />
      </div>
    );
  }

  const { price, paid, cashier } = problem;
  const change = paid - price;
  const gave = sum(cashier.given);
  const level = `C${settings.changeLevel}`;

  return (
    <div className="drill">
      <h1 className="drill-title">🪙 Check the Change</h1>
      <SetProgress n={n} of={setLength} />

      {phase === 'compute' && (
        <Question
          key={`${n}-compute`}
          module="checkChange"
          skill="change"
          level={level}
          kind="money"
          answer={change}
          answerLabel={formatMoney(change)}
          inputLabel="Change"
          prompt={
            <div className="scenario">
              <p className="q-text">
                You buy something for <b>{formatMoney(price)}</b> and pay with {formatMoney(paid)}:
              </p>
              <MoneyPile denoms={breakdown(paid, [2000, 1000, 500, 100])} />
              <p className="q-text">Before the cashier hands you anything: how much change should you get?</p>
            </div>
          }
          say={`You buy something for ${formatMoney(price)} and pay with ${formatMoney(paid)}. How much change should you get?`}
          logText={`Change from ${formatMoney(paid)} for ${formatMoney(price)}`}
          helps={changeHelps(price, paid, settings.changeHelpStyle)}
          onNext={() => setPhase('check')}
          nextLabel="See what the cashier gives you"
        />
      )}

      {phase === 'check' && (
        <Question
          key={`${n}-check`}
          module="checkChange"
          skill="checkChange"
          level={level}
          kind="yesno"
          answer={cashier.result === 'correct'}
          answerLabel={cashier.result === 'correct' ? 'The change is right' : 'The change is wrong'}
          prompt={
            <div className="scenario">
              <p className="q-text">
                Your change should be <b>{formatMoney(change)}</b>. The cashier hands you this:
              </p>
              <MoneyPile denoms={cashier.given} />
              <p className="q-text">Is this the right change?</p>
            </div>
          }
          say={`Your change should be ${formatMoney(change)}. The cashier hands you some money. Count it. Is this the right change?`}
          logText={`Should get ${formatMoney(change)}, cashier gave ${formatMoney(gave)}`}
          helps={checkChangeHelps(cashier.given, change)}
          solvedExtra={<WhatToSay result={cashier.result} diff={Math.abs(gave - change)} />}
          onLogged={(t) => t.independent && setIndependent((x) => x + 1)}
          onNext={() => {
            setProblem(newProblem(settings.changeLevel, settings.wrongChangeRate));
            setPhase('compute');
            setN(n + 1);
          }}
        />
      )}
    </div>
  );
}

function WhatToSay({ result, diff }: { result: CashierResult; diff: Cents }) {
  const [explain, script] =
    result === 'correct'
      ? ['The change is right.', 'Thank you!']
      : result === 'short'
        ? [`You got ${spoken(diff)} too little.`, `Excuse me, I think my change is ${spoken(diff)} short.`]
        : [`You got ${spoken(diff)} too much. The honest thing is to give it back.`, `Excuse me, I think you gave me ${spoken(diff)} too much.`];
  return (
    <div className="say-this">
      <p>{explain} You can say:</p>
      <p className="say-script">
        “{script}” <ReadAloud text={script} />
      </p>
    </div>
  );
}
