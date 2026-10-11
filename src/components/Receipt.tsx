import { formatMoney, type Cents } from '../lib/money';

export interface ReceiptLine {
  name: string;
  qty: number;
  price: Cents;
}

interface Props {
  store: string;
  orderNumber: number;
  lines: ReceiptLine[];
  subtotal: Cents;
  tax: Cents | null;
  taxRate: number;
  paid: Cents;
  footer: string;
}

export function Receipt({ store, orderNumber, lines, subtotal, tax, taxRate, paid, footer }: Props) {
  const total = subtotal + (tax ?? 0);
  return (
    <div className="receipt" aria-label="Receipt">
      <p className="receipt-store">{store}</p>
      <p className="receipt-meta">
        Order #{orderNumber} · {new Date().toLocaleDateString('en-US')}
      </p>
      <ul className="receipt-lines">
        {lines.map((l) => (
          <li key={l.name}>
            <span>
              {l.qty > 1 ? `${l.qty} × ` : ''}
              {l.name}
            </span>
            <span>{formatMoney(l.price * l.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="receipt-totals">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatMoney(subtotal)}</dd>
        </div>
        {tax !== null && (
          <div>
            <dt>Tax ({taxRate}%)</dt>
            <dd>{formatMoney(tax)}</dd>
          </div>
        )}
        <div className="receipt-total">
          <dt>Total</dt>
          <dd>{formatMoney(total)}</dd>
        </div>
        <div>
          <dt>Cash</dt>
          <dd>{formatMoney(paid)}</dd>
        </div>
        <div className="receipt-total">
          <dt>Change</dt>
          <dd>{formatMoney(paid - total)}</dd>
        </div>
      </dl>
      <p className="receipt-footer">{footer}</p>
    </div>
  );
}
