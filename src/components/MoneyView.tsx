import { BILLS, COINS, formatShort, type Cents } from '../lib/money';

export function Bill({ cents }: { cents: Cents }) {
  return (
    <span className={`bill bill-${cents / 100}`} aria-label={`$${cents / 100} bill`}>
      <span className="bill-corner">{cents / 100}</span>
      <span className="bill-value">${cents / 100}</span>
      <span className="bill-corner">{cents / 100}</span>
    </span>
  );
}

const COIN_NAMES: Record<number, string> = { 25: 'quarter', 10: 'dime', 5: 'nickel', 1: 'penny' };

export function Coin({ cents }: { cents: Cents }) {
  return (
    <span className={`coin coin-${cents}`} aria-label={COIN_NAMES[cents]}>
      {formatShort(cents)}
    </span>
  );
}

export function Denom({ cents }: { cents: Cents }) {
  return cents >= 100 ? <Bill cents={cents} /> : <Coin cents={cents} />;
}

/** A pile of bills and coins, largest first. */
export function MoneyPile({ denoms }: { denoms: Cents[] }) {
  const sorted = [...denoms].sort((a, b) => b - a);
  const bills = sorted.filter((d) => BILLS.includes(d));
  const coins = sorted.filter((d) => COINS.includes(d));
  return (
    <div className="money-pile">
      {bills.map((d, i) => (
        <Bill key={`b${i}`} cents={d} />
      ))}
      {coins.map((d, i) => (
        <Coin key={`c${i}`} cents={d} />
      ))}
      {denoms.length === 0 && <span className="muted">No money</span>}
    </div>
  );
}
