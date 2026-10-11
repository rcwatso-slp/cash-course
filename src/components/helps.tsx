// The three help levels for each kind of problem: 1 = hint, 2 = more help, 3 = answer.
import { breakdown, calcTax, describeDenoms, formatMoney, nextDollar, sum, type Cents } from '../lib/money';
import { ColumnMath } from './ColumnMath';
import { CountUpLine, countUpSpeech } from './CountUpLine';
import { MoneyPile } from './MoneyView';
import type { Help } from './Question';

type Helps = [Help, Help, Help];

export interface PricedItem {
  name: string;
  cents: Cents;
}

const finish = (answer: Cents) => <p className="help-finish">Type {formatMoney(answer)} to finish.</p>;

export function addUpHelps(items: PricedItem[], what: 'subtotal' | 'total'): Helps {
  const total = sum(items.map((i) => i.cents));
  const [a, b] = items;
  const hint =
    items.length >= 2
      ? `Add the prices of everything in your order. Start with the ${a.name} (${formatMoney(a.cents)}) and the ${b.name} (${formatMoney(b.cents)}).`
      : `You have one item. Its price is your ${what}.`;

  const running: { left: Cents; right: Cents; result: Cents }[] = [];
  let acc = items[0]?.cents ?? 0;
  for (const item of items.slice(1)) {
    running.push({ left: acc, right: item.cents, result: acc + item.cents });
    acc += item.cents;
  }

  return [
    { content: <p>{hint}</p>, say: hint },
    {
      content: (
        <>
          <p>Line up the dots. Add each column, starting on the right.</p>
          <ColumnMath op="+" rows={items.map((i) => i.cents)} />
        </>
      ),
      say: `Line up the dots and add each column, starting on the right. Add ${items.map((i) => formatMoney(i.cents)).join(' plus ')}.`,
    },
    {
      content: (
        <>
          {running.length === 0 ? (
            <p>
              Your {what} is <b>{formatMoney(total)}</b>.
            </p>
          ) : (
            <ul className="steps-list">
              {running.map((r, i) => (
                <li key={i}>
                  {formatMoney(r.left)} + {formatMoney(r.right)} = {i === running.length - 1 ? <b>{formatMoney(r.result)}</b> : formatMoney(r.result)}
                </li>
              ))}
            </ul>
          )}
          {finish(total)}
        </>
      ),
      say: `Your ${what} is ${formatMoney(total)}. Type ${formatMoney(total)} to finish.`,
    },
  ];
}

export function taxHelps(subtotal: Cents, rate: number): Helps {
  const tax = calcTax(subtotal, rate);
  const decimal = String(rate / 100);
  const raw = ((subtotal / 100) * rate) / 100;
  const hint = `Tax is ${rate}% of your subtotal. Multiply ${formatMoney(subtotal)} by ${decimal}, then round to the nearest cent.`;
  return [
    { content: <p>{hint}</p>, say: hint },
    {
      content: (
        <>
          <p className="big-math">
            {formatMoney(subtotal)} × {decimal} = {raw.toFixed(4)}
          </p>
          <p>Round to 2 numbers after the dot. Look at the 3rd number: 5 or more rounds up.</p>
        </>
      ),
      say: `${formatMoney(subtotal)} times ${decimal} equals ${raw.toFixed(4)}. Round to 2 numbers after the dot.`,
    },
    {
      content: (
        <>
          <p>
            The tax is <b>{formatMoney(tax)}</b>.
          </p>
          {finish(tax)}
        </>
      ),
      say: `The tax is ${formatMoney(tax)}.`,
    },
  ];
}

export function addTaxHelps(subtotal: Cents, tax: Cents): Helps {
  const total = subtotal + tax;
  const hint = `Add the subtotal (${formatMoney(subtotal)}) and the tax (${formatMoney(tax)}).`;
  return [
    { content: <p>{hint}</p>, say: hint },
    {
      content: (
        <>
          <p>Line up the dots. Add each column, starting on the right.</p>
          <ColumnMath op="+" rows={[subtotal, tax]} />
        </>
      ),
      say: `Add ${formatMoney(subtotal)} plus ${formatMoney(tax)}.`,
    },
    {
      content: (
        <>
          <p className="big-math">
            {formatMoney(subtotal)} + {formatMoney(tax)} = <b>{formatMoney(total)}</b>
          </p>
          {finish(total)}
        </>
      ),
      say: `${formatMoney(subtotal)} plus ${formatMoney(tax)} equals ${formatMoney(total)}.`,
    },
  ];
}

export function changeHelps(price: Cents, paid: Cents, style: 'countUp' | 'column'): Helps {
  const change = paid - price;
  const coins = breakdown(change);
  const hint =
    style === 'countUp'
      ? `Change is what you paid minus the price. Try counting up from ${formatMoney(price)} to ${formatMoney(paid)}.`
      : `Change is what you paid minus the price. Subtract: ${formatMoney(paid)} − ${formatMoney(price)}.`;
  const level2: Help =
    style === 'countUp'
      ? {
          content: (
            <>
              <p>Count up from the price to what you paid, like a cashier does.</p>
              <CountUpLine from={price} to={paid} />
            </>
          ),
          say: countUpSpeech(price, paid),
        }
      : {
          content: (
            <>
              <p>Subtract each column, starting on the right. The small numbers show where you borrowed.</p>
              <ColumnMath op="−" rows={[paid, price]} showRegroup />
            </>
          ),
          say: `Subtract ${formatMoney(paid)} minus ${formatMoney(price)}, one column at a time, starting on the right.`,
        };
  return [
    { content: <p>{hint}</p>, say: hint },
    level2,
    {
      content: (
        <>
          <p className="big-math">
            {formatMoney(paid)} − {formatMoney(price)} = <b>{formatMoney(change)}</b>
          </p>
          <p>That's {describeDenoms(coins)}:</p>
          <MoneyPile denoms={coins} />
          {finish(change)}
        </>
      ),
      say: `${formatMoney(paid)} minus ${formatMoney(price)} equals ${formatMoney(change)}. That's ${describeDenoms(coins)}.`,
    },
  ];
}

export function payHelps(total: Cents, mode: 'nextDollar' | 'choose', suggestion: Cents[]): Helps {
  const nd = nextDollar(total);
  const singleBill = suggestion.length === 1 ? suggestion[0] : null;
  const hint =
    mode === 'nextDollar'
      ? `Your total is ${formatMoney(total)}. Round up to the next whole dollar.`
      : `You need at least ${formatMoney(total)}. Pick bills that add up to ${formatMoney(total)} or a little more.`;
  const more =
    mode === 'nextDollar'
      ? `The next dollar up from ${formatMoney(total)} is ${formatMoney(nd)}. Pick bills that add up to exactly ${formatMoney(nd)}.`
      : singleBill
        ? `One bill that's bigger than ${formatMoney(total)} works, like a $${singleBill / 100} bill. Or pay the next dollar up: ${formatMoney(nd)}.`
        : `Try paying the next dollar up: ${formatMoney(nd)}.`;
  const answer = `Pay with ${describeDenoms(suggestion)}.`;
  return [
    { content: <p>{hint}</p>, say: hint },
    { content: <p>{more}</p>, say: more },
    {
      content: (
        <>
          <p>{answer}</p>
          <MoneyPile denoms={suggestion} />
        </>
      ),
      say: answer,
    },
  ];
}

export function checkChangeHelps(given: Cents[], correct: Cents): Helps {
  const sorted = [...given].sort((a, b) => b - a);
  const gave = sum(given);
  let running = 0;
  const counts = sorted.map((d) => (running += d));
  const diff = Math.abs(gave - correct);
  const verdict =
    gave === correct
      ? 'They match, so the change is right. The answer is Yes.'
      : `That's ${formatMoney(diff)} too ${gave > correct ? 'much' : 'little'}, so the change is wrong. The answer is No.`;
  const hint = `Count the money they gave you. Does it match ${formatMoney(correct)}?`;
  return [
    { content: <p>{hint}</p>, say: hint },
    {
      content: (
        <>
          <p>Count it one piece at a time:</p>
          <ol className="count-list">
            {counts.map((c, i) => (
              <li key={i}>{formatMoney(c)}</li>
            ))}
          </ol>
          <p>
            They gave you {formatMoney(gave)}. Your change should be {formatMoney(correct)}.
          </p>
        </>
      ),
      say: `Count it one piece at a time: ${counts.map(formatMoney).join(', ')}. They gave you ${formatMoney(gave)}. Your change should be ${formatMoney(correct)}.`,
    },
    {
      content: (
        <p>
          They gave you {formatMoney(gave)}. It should be {formatMoney(correct)}. <b>{verdict}</b>
        </p>
      ),
      say: `They gave you ${formatMoney(gave)}. It should be ${formatMoney(correct)}. ${verdict}`,
    },
  ];
}
