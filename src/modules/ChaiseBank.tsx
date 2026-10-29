import { useState } from 'react';
import { nextTransaction, startingBalance, type Transaction } from '../lib/bank';
import { formatMoney } from '../lib/money';
import { useSettings } from '../lib/settings';
import { addPartsHelps, affordHelps, changeHelps } from '../components/helps';
import { Question } from '../components/Question';
import { SetDone, SetProgress } from '../components/SetDone';

/** A debit account. Each purchase comes out of the balance; he works out the new balance. */
export default function ChaiseBank() {
  const { settings } = useSettings();
  const level = settings.priceLevel;
  const setLength = settings.setLength;
  const [start] = useState(() => startingBalance(level));
  const [history, setHistory] = useState<Transaction[]>([]);
  const [current, setCurrent] = useState<Transaction>(() => nextTransaction(start, level));
  const [independent, setIndependent] = useState(0);
  const [round, setRound] = useState(0);
  const n = history.length + 1;

  if (setLength > 0 && n > setLength) {
    return (
      <div className="drill">
        <BankHeader balance={history[history.length - 1].after} />
        <SetDone
          count={setLength}
          independent={independent}
          onAgain={() => {
            setRound(round + 1);
            setHistory([]);
            setIndependent(0);
            setCurrent(nextTransaction(history[history.length - 1].after, level));
          }}
        />
      </div>
    );
  }

  const tx = current;
  const next = () => {
    setHistory([...history, tx]);
    setCurrent(nextTransaction(tx.after, level));
  };
  const common = { module: 'bank', level: `L${level}`, onLogged: (t: { independent: boolean }) => t.independent && setIndependent((x) => x + 1), onNext: next };

  return (
    <div className="drill">
      <BankHeader balance={tx.before} />
      <SetProgress n={n} of={setLength} />

      {tx.kind === 'declined' ? (
        <Question
          key={`${round}-${n}`}
          {...common}
          skill="afford"
          kind="yesno"
          yesLabel="Yes, I have enough"
          noLabel="No, not enough"
          answer={false}
          answerLabel="Not enough money"
          prompt={
            <>
              <PendingRow tx={tx} />
              <p className="q-text">
                You want to buy <b>{tx.name}</b> for <b>{formatMoney(tx.amount)}</b> with your debit card. Your balance is{' '}
                <b>{formatMoney(tx.before)}</b>. Is there enough money in your account?
              </p>
            </>
          }
          say={`You want to buy ${tx.name} for ${formatMoney(tx.amount)}. Your balance is ${formatMoney(tx.before)}. Is there enough money in your account?`}
          logText={`Balance ${formatMoney(tx.before)}, buy ${formatMoney(tx.amount)}`}
          helps={affordHelps(tx.before, [tx.amount])}
          solvedExtra={
            <p className="say-this">
              ❌ <b>Card declined.</b> Your balance stays {formatMoney(tx.before)}. You'd need {formatMoney(tx.amount - tx.before)} more. Time to save up!
            </p>
          }
        />
      ) : (
        <Question
          key={`${round}-${n}`}
          {...common}
          skill="balance"
          kind="money"
          answer={tx.after}
          answerLabel={formatMoney(tx.after)}
          inputLabel="New balance"
          prompt={
            <>
              <PendingRow tx={tx} />
              <p className="q-text">
                {tx.kind === 'purchase' ? (
                  <>
                    You spent <b>{formatMoney(tx.amount)}</b> at <b>{tx.name}</b>.
                  </>
                ) : (
                  <>
                    <b>{tx.name}</b>: <b>{formatMoney(tx.amount)}</b> was added to your account.
                  </>
                )}{' '}
                Your balance was <b>{formatMoney(tx.before)}</b>. What is your balance now?
              </p>
            </>
          }
          say={`${tx.kind === 'purchase' ? `You spent ${formatMoney(tx.amount)} at ${tx.name}.` : `${tx.name}: ${formatMoney(tx.amount)} was added to your account.`} Your balance was ${formatMoney(tx.before)}. What is your balance now?`}
          logText={`${formatMoney(tx.before)} ${tx.kind === 'purchase' ? '−' : '+'} ${formatMoney(tx.amount)}`}
          helps={
            tx.kind === 'purchase'
              ? changeHelps(tx.amount, tx.before, settings.changeHelpStyle, 'balance')
              : addPartsHelps([
                  { name: 'Old balance', cents: tx.before },
                  { name: tx.name, cents: tx.amount },
                ])
          }
        />
      )}

      {history.length > 0 && (
        <section className="bank-history">
          <h2>Recent activity</h2>
          <ul>
            {[...history].reverse().slice(0, 8).map((h, i) => (
              <li key={i} className={h.kind === 'declined' ? 'declined' : ''}>
                <span aria-hidden="true">{h.emoji}</span>
                <span className="bank-tx-name">
                  {h.name}
                  {h.kind === 'declined' && <small> · declined</small>}
                </span>
                <span className={`bank-tx-amount ${h.kind}`}>
                  {h.kind === 'deposit' ? '+' : h.kind === 'purchase' ? '−' : ''}
                  {formatMoney(h.amount)}
                </span>
                <span className="bank-tx-balance">{formatMoney(h.after)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function BankHeader({ balance }: { balance: number }) {
  return (
    <div className="bank-header">
      <div className="bank-brand">
        <span aria-hidden="true">🪑</span> Chaise Bank
      </div>
      <div className="bank-account">
        <span>Total Checking ••4821</span>
        <span className="bank-balance-label">Available balance</span>
        <span className="bank-balance">{formatMoney(balance)}</span>
      </div>
    </div>
  );
}

function PendingRow({ tx }: { tx: Transaction }) {
  return (
    <div className="bank-pending">
      <span className="bank-pending-label">{tx.kind === 'declined' ? 'Trying to buy' : tx.kind === 'deposit' ? 'Deposit' : 'Debit card purchase'}</span>
      <span className="bank-pending-row">
        <span aria-hidden="true">{tx.emoji}</span>
        <span className="bank-tx-name">{tx.name}</span>
        <span className={`bank-tx-amount ${tx.kind}`}>
          {tx.kind === 'deposit' ? '+' : '−'}
          {formatMoney(tx.amount)}
        </span>
      </span>
    </div>
  );
}
