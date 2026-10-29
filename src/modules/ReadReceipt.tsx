import { useState } from 'react';
import { formatMoney, sum } from '../lib/money';
import { randInt } from '../lib/random';
import { makeReceiptProblem, type ReceiptProblem } from '../lib/receipts';
import { useSettings } from '../lib/settings';
import { Question, type Help } from '../components/Question';
import { ReadAloud } from '../components/ReadAloud';
import { Receipt } from '../components/Receipt';
import { SetDone, SetProgress } from '../components/SetDone';

type H = [Help, Help, Help];
const helps = (hint: string, more: string, answer: string): H => [
  { content: <p>{hint}</p>, say: hint },
  { content: <p>{more}</p>, say: more },
  { content: <p>{answer}</p>, say: answer },
];

/** Find things on a receipt, and check a receipt against what's in the bag. */
export default function ReadReceipt() {
  const { settings } = useSettings();
  const level = settings.priceLevel;
  const setLength = settings.setLength;
  const [n, setN] = useState(1);
  const [independent, setIndependent] = useState(0);
  const [problem, setProblem] = useState(() => makeReceiptProblem(level, settings.taxRate));
  const [orderNumber] = useState(() => randInt(100, 999));
  const title = <h1 className="drill-title">🧾 Read the Receipt</h1>;

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
            setProblem(makeReceiptProblem(level, settings.taxRate));
          }}
        />
      </div>
    );
  }

  const { receipt: r, ask } = problem;
  const common = {
    module: 'receipts',
    level: `L${level}`,
    onLogged: (t: { independent: boolean }) => t.independent && setIndependent((x) => x + 1),
    onNext: () => {
      setProblem(makeReceiptProblem(level, settings.taxRate));
      setN(n + 1);
    },
  };
  const showBag = ask.kind === 'check';

  const receiptView = (
    <div className="receipt-task">
      {showBag && <Bag problem={problem} />}
      <Receipt
        store={r.place}
        orderNumber={orderNumber + n}
        lines={r.lines}
        rows={[
          { label: 'Subtotal', cents: r.subtotal },
          { label: `Tax (${settings.taxRate}%)`, cents: r.tax },
          { label: 'Total', cents: r.total, strong: true },
          { label: 'Cash', cents: r.cash },
          { label: 'Change', cents: r.change, strong: true },
        ]}
        footer="Thank you! Please keep your receipt."
      />
    </div>
  );

  return (
    <div className="drill">
      {title}
      <SetProgress n={n} of={setLength} />
      {ask.kind === 'check' ? (
        <Question
          key={n}
          {...common}
          skill="checkReceipt"
          kind="yesno"
          yesLabel="Yes, it's correct"
          noLabel="No, there's a mistake"
          answer={ask.correct}
          answerLabel={ask.correct ? 'The receipt is correct' : 'There is a mistake'}
          prompt={
            <>
              {receiptView}
              <p className="q-text">Check your receipt against your bag. Is the receipt correct?</p>
            </>
          }
          say="Check your receipt against your bag. Is the receipt correct?"
          logText={`Check receipt (${ask.correct ? 'correct' : 'has a mistake'})`}
          helps={checkHelps(problem)}
          solvedExtra={
            <div className="say-this">
              <p>{ask.problem}</p>
              {!ask.correct && (
                <p className="say-script">
                  “Excuse me, I think there's a mistake on my receipt.” <ReadAloud text="Excuse me, I think there's a mistake on my receipt." />
                </p>
              )}
            </div>
          }
        />
      ) : ask.kind === 'count' ? (
        <Question
          key={n}
          {...common}
          skill="readReceipt"
          kind="number"
          answer={ask.answer}
          answerLabel={`${ask.answer} things`}
          inputLabel="You bought"
          unit="things"
          prompt={
            <>
              {receiptView}
              <p className="q-text">How many things did you buy?</p>
            </>
          }
          say="Look at the receipt. How many things did you buy?"
          logText="Count items on receipt"
          helps={helps(
            'Count each line on the receipt. A line that starts with "2 ×" means 2 things.',
            `There are ${r.lines.length} lines.${r.lines.some((l) => l.qty > 1) ? ' One of them is 2 things.' : ''}`,
            `${r.lines.map((l) => (l.qty > 1 ? `${l.qty} ${l.name}` : `1 ${l.name}`)).join(', ')}. That's ${ask.answer} things.`,
          )}
        />
      ) : (
        <Question
          key={n}
          {...common}
          skill="readReceipt"
          kind="money"
          answer={ask.answer}
          answerLabel={formatMoney(ask.answer)}
          inputLabel={ask.kind === 'itemPrice' ? 'Price' : ask.kind === 'tax' ? 'Tax' : ask.kind === 'total' ? 'Total' : 'Change'}
          prompt={
            <>
              {receiptView}
              <p className="q-text">{readQuestion(problem)}</p>
            </>
          }
          say={readQuestion(problem)}
          logText={readQuestion(problem)}
          helps={readHelps(problem)}
        />
      )}
    </div>
  );
}

function readQuestion({ ask }: ReceiptProblem): string {
  switch (ask.kind) {
    case 'itemPrice':
      return `How much did one ${ask.item.name} cost?`;
    case 'tax':
      return 'How much was the tax?';
    case 'total':
      return 'What was the total?';
    case 'change':
      return 'How much change did you get?';
    default:
      return '';
  }
}

function readHelps({ ask }: ReceiptProblem): H {
  if (ask.kind === 'itemPrice') {
    return helps(
      `Find the line that says ${ask.item.name}.`,
      `The price is on the right side of the ${ask.item.name} line.${ask.item.qty > 1 ? ' That line is for 2, so take half.' : ''}`,
      `One ${ask.item.name} cost ${formatMoney(ask.answer)}.`,
    );
  }
  const word = ask.kind === 'tax' ? 'Tax' : ask.kind === 'total' ? 'Total' : 'Change';
  return helps(
    'Look near the bottom of the receipt, under the items.',
    `Find the line that starts with "${word}". The amount is on the right.`,
    `The receipt says ${word}: ${formatMoney(ask.kind === 'count' || ask.kind === 'check' ? 0 : ask.answer)}.`,
  );
}

function checkHelps({ receipt: r }: ReceiptProblem): H {
  const bagCount = sum(r.bought.map((b) => b.qty));
  const receiptCount = sum(r.lines.map((l) => l.qty));
  const itemsAdd = sum(r.lines.map((l) => l.price * l.qty));
  const shouldChange = r.cash - r.total;
  const more = [
    `Your bag has ${bagCount} things. The receipt lists ${receiptCount}.`,
    `The items add up to ${formatMoney(itemsAdd)}. The subtotal says ${formatMoney(r.subtotal)}.`,
    `You paid ${formatMoney(r.cash)} for ${formatMoney(r.total)}, so change should be ${formatMoney(shouldChange)}. The receipt says ${formatMoney(r.change)}.`,
  ].join(' ');
  const ok = bagCount === receiptCount && itemsAdd === r.subtotal && shouldChange === r.change;
  return helps(
    'Check 3 things: (1) Is everything on the receipt in your bag, just once? (2) Do the items add up to the subtotal? (3) Is the change right?',
    more,
    ok ? 'Everything matches, so the receipt is correct. The answer is Yes.' : 'Something does not match, so there is a mistake. The answer is No.',
  );
}

function Bag({ problem }: { problem: ReceiptProblem }) {
  return (
    <div className="bag">
      <h3>🛍️ Your bag</h3>
      <ul>
        {problem.receipt.bought.map((b) => (
          <li key={b.name}>
            <span aria-hidden="true">{b.emoji}</span> {b.qty > 1 ? `${b.qty} × ` : ''}
            {b.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
