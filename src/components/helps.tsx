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

/** Subtotal + shipping + tax (whichever apply). */
export function addPartsHelps(parts: PricedItem[]): Helps {
  const total = sum(parts.map((p) => p.cents));
  const named = parts.map((p) => `the ${p.name.toLowerCase()} (${formatMoney(p.cents)})`);
  const hint = `Add ${named.length > 1 ? `${named.slice(0, -1).join(', ')} and ${named[named.length - 1]}` : named[0]}.`;
  return [
    { content: <p>{hint}</p>, say: hint },
    {
      content: (
        <>
          <p>Line up the dots. Add each column, starting on the right.</p>
          <ColumnMath op="+" rows={parts.map((p) => p.cents)} />
        </>
      ),
      say: `Add ${parts.map((p) => formatMoney(p.cents)).join(' plus ')}.`,
    },
    {
      content: (
        <>
          <p className="big-math">
            {parts.map((p) => formatMoney(p.cents)).join(' + ')} = <b>{formatMoney(total)}</b>
          </p>
          {finish(total)}
        </>
      ),
      say: `${parts.map((p) => formatMoney(p.cents)).join(' plus ')} equals ${formatMoney(total)}.`,
    },
  ];
}

export type Difference = 'change' | 'left' | 'more' | 'balance' | 'extra';

const DIFFERENCE_TEXT: Record<Difference, { hint: (from: string, to: string) => string; countUp: string }> = {
  change: {
    hint: (from, to) => `Change is what you paid minus the price. Try counting up from ${from} to ${to}.`,
    countUp: 'Count up from the price to what you paid, like a cashier does.',
  },
  left: {
    hint: (from, to) => `What's left is your gift card balance minus your total. Try counting up from ${from} to ${to}.`,
    countUp: 'Count up from your total to your gift card balance.',
  },
  more: {
    hint: (from, to) => `How much more = the price minus what you have. Try counting up from ${from} to ${to}.`,
    countUp: 'Count up from what you have to the price.',
  },
  balance: {
    hint: (from, to) => `Your new balance is your old balance minus what you spent. Try counting up from ${from} to ${to}.`,
    countUp: 'Count up from what you spent to your old balance.',
  },
  extra: {
    hint: (from, to) => `The extra cost is the DoorDosh total minus the pickup price. Try counting up from ${from} to ${to}.`,
    countUp: 'Count up from the pickup price to the DoorDosh total.',
  },
};

/** Help for any "bigger minus smaller" money problem: change, money left, how much more. */
export function changeHelps(from: Cents, to: Cents, style: 'countUp' | 'column', kind: Difference = 'change'): Helps {
  const diff = to - from;
  const coins = breakdown(diff);
  const text = DIFFERENCE_TEXT[kind];
  const hint =
    style === 'countUp'
      ? text.hint(formatMoney(from), formatMoney(to))
      : `${text.hint(formatMoney(from), formatMoney(to)).split('.')[0]}. Subtract: ${formatMoney(to)} − ${formatMoney(from)}.`;
  const level2: Help =
    style === 'countUp'
      ? {
          content: (
            <>
              <p>{text.countUp}</p>
              <CountUpLine from={from} to={to} />
            </>
          ),
          say: countUpSpeech(from, to),
        }
      : {
          content: (
            <>
              <p>Subtract each column, starting on the right. The small numbers show where you borrowed.</p>
              <ColumnMath op="−" rows={[to, from]} showRegroup />
            </>
          ),
          say: `Subtract ${formatMoney(to)} minus ${formatMoney(from)}, one column at a time, starting on the right.`,
        };
  return [
    { content: <p>{hint}</p>, say: hint },
    level2,
    {
      content: (
        <>
          <p className="big-math">
            {formatMoney(to)} − {formatMoney(from)} = <b>{formatMoney(diff)}</b>
          </p>
          {kind === 'change' && (
            <>
              <p>That's {describeDenoms(coins)}:</p>
              <MoneyPile denoms={coins} />
            </>
          )}
          {finish(diff)}
        </>
      ),
      say: `${formatMoney(to)} minus ${formatMoney(from)} equals ${formatMoney(diff)}.${kind === 'change' ? ` That's ${describeDenoms(coins)}.` : ''}`,
    },
  ];
}

/** How many weeks of saving `weekly` until you reach `need`? */
export function weeksHelps(need: Cents, weekly: Cents): Helps {
  const weeks = Math.ceil(need / weekly);
  const rows = Array.from({ length: weeks }, (_, i) => (i + 1) * weekly);
  // Show the first few weeks, but never the week that answers it.
  const shown = Math.max(1, Math.min(3, weeks - 1));
  const hint = `Count by ${formatMoney(weekly)} until you get to ${formatMoney(need)} or more. Count how many times you counted.`;
  return [
    { content: <p>{hint}</p>, say: hint },
    {
      content: (
        <>
          <p>Each week you add {formatMoney(weekly)}:</p>
          <ol className="weeks-list">
            {rows.slice(0, shown).map((r, i) => (
              <li key={i}>
                Week {i + 1}: {formatMoney(r)}
              </li>
            ))}
            {shown < weeks && <li className="muted">Keep going… stop when you reach {formatMoney(need)}.</li>}
          </ol>
        </>
      ),
      say: `Week 1, ${formatMoney(weekly)}. Week 2, ${formatMoney(weekly * 2)}. Keep counting by ${formatMoney(weekly)} until you reach ${formatMoney(need)}.`,
    },
    {
      content: (
        <>
          <ol className="weeks-list">
            {rows.map((r, i) => (
              <li key={i} className={i === weeks - 1 ? 'weeks-done' : ''}>
                Week {i + 1}: {formatMoney(r)}
                {i === weeks - 1 ? ` ✓ that's at least ${formatMoney(need)}` : ''}
              </li>
            ))}
          </ol>
          <p className="help-finish">
            It takes <b>{weeks} weeks</b>. Type {weeks} to finish.
          </p>
        </>
      ),
      say: `After ${weeks} weeks you have ${formatMoney(weeks * weekly)}, which is enough. It takes ${weeks} weeks.`,
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

/** Do you have enough money? Works for one price or two things added together. */
export function affordHelps(have: Cents, prices: Cents[]): Helps {
  const cost = sum(prices);
  const enough = cost <= have;
  const two = prices.length > 1;
  const hint = two
    ? `First add the prices together. Then check: is the total ${formatMoney(have)} or less?`
    : `Is ${formatMoney(cost)} the same as or less than ${formatMoney(have)}? If it is, you have enough.`;
  const [cd, hd] = [Math.floor(cost / 100), Math.floor(have / 100)];
  const compare =
    cd !== hd
      ? `Look at the dollars first: ${cd} dollars and ${hd} dollars. Which is bigger?`
      : `The dollars are the same (${cd}). Now compare the cents: ${cost % 100}¢ and ${have % 100}¢.`;
  const more = two ? `${prices.map(formatMoney).join(' + ')} = ${formatMoney(cost)}. ${compare}` : compare;
  const answer = enough
    ? `${formatMoney(cost)} is ${cost === have ? 'exactly' : 'less than'} ${formatMoney(have)}. You have enough${cost === have ? ' (exactly!)' : `, with ${formatMoney(have - cost)} left over`}. The answer is Yes.`
    : `${formatMoney(cost)} is more than ${formatMoney(have)}. You need ${formatMoney(cost - have)} more. The answer is No.`;
  return [
    { content: <p>{hint}</p>, say: hint },
    { content: <p>{more}</p>, say: more },
    { content: <p>{answer}</p>, say: answer },
  ];
}

/** Tips: 10% is the dot moved one place left; 20% is double that; 15% is 10% plus half. */
export function tipHelps(subtotal: Cents, pct: number): Helps {
  const tip = calcTax(subtotal, pct);
  const ten = Math.round(subtotal / 10);
  const hint =
    pct === 20
      ? 'A 20% tip is 10% two times. To find 10%, move the dot one place to the left.'
      : pct === 15
        ? 'A 15% tip is 10% plus half of 10%. To find 10%, move the dot one place to the left.'
        : `A ${pct}% tip: multiply the food total by ${pct / 100}.`;
  const more =
    pct === 20
      ? `10% of ${formatMoney(subtotal)} is about ${formatMoney(ten)}. Double it: ${formatMoney(ten)} + ${formatMoney(ten)} = ?`
      : pct === 15
        ? `10% of ${formatMoney(subtotal)} is about ${formatMoney(ten)}. Half of that is about ${formatMoney(Math.round(ten / 2))}. Add them: ${formatMoney(ten)} + ${formatMoney(Math.round(ten / 2))} = ?`
        : `${formatMoney(subtotal)} × ${pct / 100} = ?  Round to the nearest cent.`;
  return [
    { content: <p>{hint}</p>, say: hint },
    { content: <p className="big-math">{more}</p>, say: more },
    {
      content: (
        <>
          <p>
            The tip is <b>{formatMoney(tip)}</b>. (Being off by a penny is fine.)
          </p>
          {finish(tip)}
        </>
      ),
      say: `The tip is ${formatMoney(tip)}.`,
    },
  ];
}
