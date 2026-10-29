import { formatMoney } from '../../lib/money';
import type { Line } from '../../lib/order';

/** The order as he sees it while adding up: each item and add-on with its own price. */
export function OrderList({ lines }: { lines: Line[] }) {
  return (
    <ul className="order-list">
      {lines.map((l) => (
        <li key={l.key}>
          <span className="order-emoji" aria-hidden="true">
            {l.emoji}
          </span>
          <span className="order-name">
            {l.qty > 1 ? `${l.qty} × ` : ''}
            {l.name}
            {l.details.length > 0 && <span className="order-details">{l.details.join(', ')}</span>}
          </span>
          <span className="order-price">
            {formatMoney(l.price)}
            {l.qty > 1 ? ' each' : ''}
          </span>
          {l.extras.map((e) => (
            <span key={e.label} className="order-extra">
              <span>+ {e.label}</span>
              <span className="order-price">
                {formatMoney(e.price)}
                {l.qty > 1 ? ' each' : ''}
              </span>
            </span>
          ))}
        </li>
      ))}
    </ul>
  );
}
