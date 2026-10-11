import { formatMoney, type Cents } from '../lib/money';

export interface ReceiptLine {
  name: string;
  qty: number;
  /** Price for one */
  price: Cents;
  /** Indented add-on lines (toppings, guac) */
  extras?: { label: string; price: Cents }[];
}

export interface ReceiptRow {
  label: string;
  cents: Cents;
  strong?: boolean;
}

interface Props {
  store: string;
  orderNumber: number;
  lines: ReceiptLine[];
  rows: ReceiptRow[];
  footer: string;
}

export function Receipt({ store, orderNumber, lines, rows, footer }: Props) {
  return (
    <div className="receipt" aria-label="Receipt">
      <p className="receipt-store">{store}</p>
      <p className="receipt-meta">
        Order #{orderNumber} · {new Date().toLocaleDateString('en-US')}
      </p>
      <ul className="receipt-lines">
        {lines.map((l, i) => (
          <li key={i}>
            <div className="receipt-line">
              <span>
                {l.qty > 1 ? `${l.qty} × ` : ''}
                {l.name}
              </span>
              <span>{formatMoney(l.price * l.qty)}</span>
            </div>
            {l.extras?.map((e, j) => (
              <div key={j} className="receipt-line receipt-extra">
                <span>+ {e.label}{l.qty > 1 ? ` × ${l.qty}` : ''}</span>
                <span>{formatMoney(e.price * l.qty)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
      <dl className="receipt-totals">
        {rows.map((r) => (
          <div key={r.label} className={r.strong ? 'receipt-total' : ''}>
            <dt>{r.label}</dt>
            <dd>{formatMoney(r.cents)}</dd>
          </div>
        ))}
      </dl>
      <p className="receipt-footer">{footer}</p>
    </div>
  );
}
