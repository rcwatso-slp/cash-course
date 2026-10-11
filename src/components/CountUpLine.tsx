import { Fragment } from 'react';
import { countUpSteps, formatMoney, formatShort, type Cents } from '../lib/money';

/** Count-up number line: $7.39 → $7.40 → $8.00 → $10.00 → $20.00, with each jump labeled. */
export function CountUpLine({ from, to }: { from: Cents; to: Cents }) {
  const steps = countUpSteps(from, to);
  return (
    <div className="countup">
      <ol className="countup-line">
        <li className="cu-point start">{formatMoney(from)}</li>
        {steps.map((s, i) => (
          <Fragment key={i}>
            <li className="cu-jump" aria-label={`plus ${formatShort(s.jump)}`}>
              +{formatShort(s.jump)} →
            </li>
            <li className={`cu-point${i === steps.length - 1 ? ' end' : ''}`}>{formatMoney(s.to)}</li>
          </Fragment>
        ))}
      </ol>
      <p className="cu-sum">
        Add the jumps: {steps.map((s) => formatShort(s.jump)).join(' + ')} = <b>?</b>
      </p>
    </div>
  );
}

export function countUpSpeech(from: Cents, to: Cents): string {
  const steps = countUpSteps(from, to);
  const parts = steps.map((s) => `From ${formatMoney(s.from)} to ${formatMoney(s.to)} is ${formatShort(s.jump)}.`);
  return `Count up. ${parts.join(' ')} Add up the jumps to get your change.`;
}
