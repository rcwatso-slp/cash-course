import { useEffect, useState } from 'react';
import { Question } from '../components/Question';
import { SetFrame, TaskPage, useSet } from '../hub/Drill';
import { choiceHelps, makeOptions } from '../hub/helps';
import { checkWords } from '../lib/checkbook';
import { formatMoney, sum, type Cents } from '../lib/money';
import { pick, randInt, shuffle } from '../lib/random';
import { useSettings } from '../lib/settings';

type Mode = 'check' | 'deposit' | 'register';

const PAYEES = ['Lakeside Power Co.', 'City Water', 'Dr. Patel', 'Green Lawn Service', 'Main Street Pharmacy', 'County Library', 'Hometown Gas', 'Pine Street Apartments'];
const cents = (lo: number, hi: number) => randInt(lo * 100, hi * 100);

/** Amounts in words that are easy to mix up with the right one. */
function checkOptions(amount: Cents) {
  const d = Math.floor(amount / 100);
  const c = amount % 100;
  const swapDigits = d >= 10 ? Number(String(d).split('').reverse().join('')) : d + 10;
  const wrongs = [
    checkWords(swapDigits * 100 + c),
    checkWords(d * 100 + (c === 0 ? 50 : Number(String(c).padStart(2, '0').split('').reverse().join('')))),
    checkWords((d + 1) * 100 + c),
  ];
  return makeOptions([...new Set([checkWords(amount), ...wrongs])].slice(0, 4));
}

type Tx = { what: string; amount: Cents; kind: 'payment' | 'deposit' };

function makeItem(mode: Mode, level: 1 | 2 | 3) {
  if (mode === 'check') {
    const amount = level === 1 ? randInt(10, 99) * 100 + pick([0, 50]) : level === 2 ? cents(10, 99) : cents(100, 2500);
    return { mode, payee: pick(PAYEES), amount, ...checkOptions(amount) };
  }
  if (mode === 'deposit') {
    const cash = level === 1 ? randInt(1, 5) * 2000 : cents(20, 150);
    const checks = Array.from({ length: level }, () => cents(15, 400));
    const cashBack = level === 3 ? randInt(2, 6) * 1000 : 0;
    return { mode, cash, checks, cashBack, total: cash + sum(checks), net: cash + sum(checks) - cashBack };
  }
  const start = cents(200, 900);
  const count = level + 1;
  const payments = shuffle(['Groceries', 'Electric bill', 'Gas', 'Pharmacy', 'Phone bill', 'Rent share', 'Restaurant']);
  const deposits = shuffle(['Paycheck', 'Birthday check', 'Refund']);
  const nDeposits = level > 1 ? 1 : 0;
  const txs: Tx[] = shuffle([
    ...payments.slice(0, count - nDeposits).map((what): Tx => ({ what, amount: cents(8, 120), kind: 'payment' })),
    ...deposits.slice(0, nDeposits).map((what): Tx => ({ what, amount: cents(25, 400), kind: 'deposit' })),
  ]);
  const balances: Cents[] = [];
  let bal = start;
  for (const t of txs) balances.push((bal += t.kind === 'deposit' ? t.amount : -t.amount));
  return { mode, start, txs, balances, end: bal };
}

const MODES: { id: Mode; label: string }[] = [
  { id: 'check', label: 'Write a check' },
  { id: 'deposit', label: 'Deposit slip' },
  { id: 'register', label: 'Balance the register' },
];

export default function Checkbook() {
  const { settings } = useSettings();
  // Uses the Money "price difficulty" setting: whole dollars → cents → bigger amounts.
  const level: 1 | 2 | 3 = settings.priceLevel <= 2 ? 1 : settings.priceLevel === 3 ? 2 : 3;
  const [mode, setMode] = useState<Mode>('check');
  const set = useSet(() => makeItem(mode, level));
  const item = set.item;

  useEffect(() => {
    if (item.mode !== mode) set.again();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, item.mode]);

  const common = { module: 'checkbook', onLogged: set.onLogged, onNext: set.next };

  return (
    <TaskPage id="checkbook" wide>
      <div className="mode-toggle" role="group" aria-label="Kind of practice">
        {MODES.map((m) => (
          <button key={m.id} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>
            {m.label}
          </button>
        ))}
      </div>
      <SetFrame set={set} noun="problems">
        {item.mode === 'check' && 'payee' in item && (
          <Question
            key={set.n}
            {...common}
            skill="checkWords"
            level={formatMoney(item.amount)}
            prompt={
              <div>
                <div className="check-paper">
                  <div className="check-row">
                    <span>Pay to the order of</span>
                    <b className="check-line">{item.payee}</b>
                    <span className="check-amount">{formatMoney(item.amount)}</span>
                  </div>
                  <div className="check-row">
                    <span className="check-line wide">?</span>
                    <span>Dollars</span>
                  </div>
                </div>
                <p className="q-text">Which is the right way to write {formatMoney(item.amount)} in words on the check?</p>
              </div>
            }
            say={`You are writing a check to ${item.payee} for ${formatMoney(item.amount)}. Which is the right way to write it in words?`}
            logText={`Check for ${formatMoney(item.amount)}`}
            answerLabel={checkWords(item.amount)}
            kind="choice"
            options={item.options}
            answer={item.answer}
            helps={choiceHelps({
              hint: `Dollars are written in words. Cents are written as a fraction out of 100: ${String(item.amount % 100).padStart(2, '0')}/100.`,
              options: item.options,
              answer: item.answer,
            })}
          />
        )}

        {item.mode === 'deposit' && 'checks' in item && (
          <Question
            key={set.n}
            {...common}
            skill="deposit"
            level={`${item.checks.length} check${item.checks.length > 1 ? 's' : ''}${item.cashBack ? ', cash back' : ''}`}
            kind="money"
            answer={item.net}
            inputLabel={item.cashBack ? 'Net deposit' : 'Total deposit'}
            answerLabel={formatMoney(item.net)}
            prompt={
              <div>
                <table className="deposit-slip">
                  <tbody>
                    <tr>
                      <th>Cash</th>
                      <td>{formatMoney(item.cash)}</td>
                    </tr>
                    {item.checks.map((c, i) => (
                      <tr key={i}>
                        <th>Check {i + 1}</th>
                        <td>{formatMoney(c)}</td>
                      </tr>
                    ))}
                    {item.cashBack > 0 && (
                      <tr>
                        <th>Less cash received</th>
                        <td>−{formatMoney(item.cashBack)}</td>
                      </tr>
                    )}
                    <tr className="deposit-total">
                      <th>{item.cashBack ? 'Net deposit' : 'Total deposit'}</th>
                      <td>?</td>
                    </tr>
                  </tbody>
                </table>
                <p className="q-text">{item.cashBack ? 'Add the cash and checks, then take away the cash you get back. What is the net deposit?' : 'Add the cash and the checks. What is the total deposit?'}</p>
              </div>
            }
            say={`Cash ${formatMoney(item.cash)}. ${item.checks.map((c, i) => `Check ${i + 1}: ${formatMoney(c)}.`).join(' ')} ${item.cashBack ? `You want ${formatMoney(item.cashBack)} cash back. What is the net deposit?` : 'What is the total deposit?'}`}
            logText={`Deposit: cash ${formatMoney(item.cash)}, checks ${item.checks.map(formatMoney).join(' + ')}${item.cashBack ? `, cash back ${formatMoney(item.cashBack)}` : ''}`}
            helps={[
              { content: <p>Add everything above the line first.</p>, say: 'Add everything above the line first.' },
              {
                content: (
                  <p>
                    {[item.cash, ...item.checks].map(formatMoney).join(' + ')} = <b>{formatMoney(item.total)}</b>
                    {item.cashBack ? ` Then take away ${formatMoney(item.cashBack)}.` : ''}
                  </p>
                ),
                say: `Cash plus checks is ${formatMoney(item.total)}.${item.cashBack ? ` Then take away ${formatMoney(item.cashBack)}.` : ''}`,
              },
              { content: <p>The {item.cashBack ? 'net' : 'total'} deposit is <b>{formatMoney(item.net)}</b>. Type it to finish.</p>, say: `The deposit is ${formatMoney(item.net)}.` },
            ]}
          />
        )}

        {item.mode === 'register' && 'txs' in item && (
          <Question
            key={set.n}
            {...common}
            skill="register"
            level={`${item.txs.length} entries`}
            kind="money"
            answer={item.end}
            inputLabel="Balance"
            answerLabel={formatMoney(item.end)}
            prompt={
              <div>
                <table className="data-table register">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Payment (−)</th>
                      <th>Deposit (+)</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Starting balance</td>
                      <td />
                      <td />
                      <td>{formatMoney(item.start)}</td>
                    </tr>
                    {item.txs.map((t, i) => (
                      <tr key={i}>
                        <td>{t.what}</td>
                        <td>{t.kind === 'payment' ? formatMoney(t.amount) : ''}</td>
                        <td>{t.kind === 'deposit' ? formatMoney(t.amount) : ''}</td>
                        <td>{i === item.txs.length - 1 ? '?' : '…'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="q-text">What is the balance after the last entry?</p>
              </div>
            }
            say={`You start with ${formatMoney(item.start)}. ${item.txs.map((t) => `${t.what}: ${t.kind === 'payment' ? 'minus' : 'plus'} ${formatMoney(t.amount)}.`).join(' ')} What is the balance now?`}
            logText={`Register from ${formatMoney(item.start)}: ${item.txs.map((t) => `${t.kind === 'payment' ? '−' : '+'}${formatMoney(t.amount)}`).join(' ')}`}
            helps={[
              { content: <p>Go one line at a time. Subtract payments. Add deposits.</p>, say: 'Go one line at a time. Subtract payments. Add deposits.' },
              {
                content: (
                  <p>
                    After the first line: <b>{formatMoney(item.balances[0])}</b>.
                  </p>
                ),
                say: `After the first line, the balance is ${formatMoney(item.balances[0])}.`,
              },
              {
                content: (
                  <ul className="steps-list">
                    {item.balances.map((b, i) => (
                      <li key={i}>
                        {item.txs[i].what}: {formatMoney(b)}
                      </li>
                    ))}
                  </ul>
                ),
                say: `The balance ends at ${formatMoney(item.end)}.`,
              },
            ]}
          />
        )}
      </SetFrame>
    </TaskPage>
  );
}
