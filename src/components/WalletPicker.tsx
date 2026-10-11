import { useState } from 'react';
import { formatMoney, sum, type Cents } from '../lib/money';
import type { Wallet } from '../lib/problems';
import { Bill } from './MoneyView';

interface Props {
  wallet: Wallet;
  disabled: boolean;
  onPay: (bills: Cents[]) => void;
}

/** Tap bills in the wallet to hand them over. Tap a handed-over bill to take it back. */
export function WalletPicker({ wallet, disabled, onPay }: Props) {
  const [handing, setHanding] = useState<Cents[]>([]);
  const left = (bill: Cents) => (wallet[bill] ?? 0) - handing.filter((b) => b === bill).length;
  const bills = [2000, 1000, 500, 100].filter((b) => (wallet[b] ?? 0) > 0);

  return (
    <div className="wallet">
      <div className="wallet-section">
        <h3>Your wallet</h3>
        <div className="wallet-bills">
          {bills.map((b) => (
            <button
              key={b}
              type="button"
              className="bill-btn"
              disabled={disabled || left(b) === 0}
              onClick={() => setHanding([...handing, b].sort((x, y) => y - x))}
              aria-label={`Add a $${b / 100} bill. ${left(b)} left.`}
            >
              <Bill cents={b} />
              <span className="bill-count">× {left(b)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="wallet-section paying">
        <h3>Handing to the cashier</h3>
        <div className="wallet-bills">
          {handing.length === 0 && <span className="muted">Tap bills in your wallet to add them here.</span>}
          {handing.map((b, i) => (
            <button
              key={i}
              type="button"
              className="bill-btn"
              disabled={disabled}
              onClick={() => setHanding(handing.filter((_, j) => j !== i))}
              aria-label={`Take back the $${b / 100} bill`}
            >
              <Bill cents={b} />
            </button>
          ))}
        </div>
        <p className="wallet-sum">Handing over: <b>{formatMoney(sum(handing))}</b></p>
        <button type="button" className="primary" disabled={disabled || handing.length === 0} onClick={() => onPay(handing)}>
          Pay
        </button>
      </div>
    </div>
  );
}
