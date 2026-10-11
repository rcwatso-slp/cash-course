import { useState } from 'react';
import type { MenuItem, Restaurant, Size } from '../../data/types';
import { formatMoney, sum, type Cents } from '../../lib/money';
import { addLine, buildLine, lineEach, matchesTask, removeOne, type Chosen, type Line, type TaskLine } from '../../lib/order';
import { PRICE_LEVELS, levelPrice, type PriceLevel } from '../../lib/problems';
import { ReadAloud } from '../../components/ReadAloud';
import { ItemPicker } from './ItemPicker';

interface Props {
  restaurant: Restaurant;
  level: PriceLevel;
  task: TaskLine[] | null;
  lines: Line[];
  setLines: (fn: (prev: Line[]) => Line[]) => void;
  showRunningTotal: boolean;
  menuStyle: 'kiosk' | 'board';
  onDone: () => void;
}

export function OrderScreen({ restaurant, level, task, lines, setLines, showRunningTotal, menuStyle, onDone }: Props) {
  const [category, setCategory] = useState(restaurant.categories[0].id);
  const [picking, setPicking] = useState<MenuItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const maxItems = task ? Math.max(task.length, PRICE_LEVELS[level].maxItems) : PRICE_LEVELS[level].maxItems;
  const count = sum(lines.map((l) => l.qty));
  const price = (c: Cents) => levelPrice(c, level);

  function add(item: MenuItem, size: Size | undefined, chosen: Chosen) {
    setPicking(null);
    if (count >= maxItems) {
      setNotice(`That's the most for this order (${maxItems} items). Remove something to add something else.`);
      return;
    }
    const line = buildLine(item, size, chosen, level);
    setLines((prev) => addLine(prev, line));
    setNotice(`Added: ${line.name}${line.extras.length ? ` with ${line.extras.map((e) => e.label).join(', ')}` : ''}`);
  }

  function choose(item: MenuItem) {
    if (item.sizes || item.options) setPicking(item);
    else add(item, undefined, {});
  }

  function done() {
    if (task && !matchesTask(lines, task)) {
      setNotice("Your order doesn't match the order card yet. Check the card.");
      return;
    }
    onDone();
  }

  const fromPrice = (item: MenuItem) =>
    item.sizes ? `From ${formatMoney(price(Math.min(...item.sizes.map((s) => s.price))))}` : formatMoney(price(item.price!));

  return (
    <div className="kiosk">
      {task && (
        <div className="task-card">
          <div className="task-card-head">
            <h2>Order card</h2>
            <ReadAloud text={`Order: ${task.map((t) => t.label).join(', ')}.`} />
          </div>
          <ul>
            {task.map((t) => {
              const have = lines.some((l) => l.key === t.key);
              return (
                <li key={t.key} className={have ? 'have' : ''}>
                  <span aria-hidden="true">{have ? '✓' : '○'}</span> {t.emoji} {t.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}

      <div className={`kiosk-body${menuStyle === 'board' ? ' kiosk-body-board' : ''}`}>
        {menuStyle === 'kiosk' ? (
          <>
            <nav className="kiosk-cats" aria-label="Menu categories">
              {restaurant.categories.map((c) => (
                <button key={c.id} className="cat-btn" aria-pressed={c.id === category} onClick={() => setCategory(c.id)}>
                  {c.label}
                </button>
              ))}
            </nav>
            <div className="kiosk-items">
              <div className="item-grid">
                {restaurant.menu
                  .filter((i) => i.category === category)
                  .map((item) => (
                    <button key={item.id} className="item-tile" onClick={() => choose(item)}>
                      <span className="item-emoji" aria-hidden="true">
                        {item.emoji}
                      </span>
                      <span className="item-name">{item.name}</span>
                      {item.note && <span className="item-note">{item.note}</span>}
                      <span className="item-price">{fromPrice(item)}</span>
                    </button>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <MenuBoard restaurant={restaurant} price={price} onChoose={choose} />
        )}

        <aside className={`kiosk-cart${cartOpen ? ' open' : ''}`} aria-label="Your order">
          <button className="cart-toggle" onClick={() => setCartOpen(!cartOpen)} aria-expanded={cartOpen}>
            <span>🛒 Your order ({count})</span>
            <span aria-hidden="true">{cartOpen ? '▼' : '▲'}</span>
          </button>
          <div className="cart-body">
            <h2 className="cart-title">Your order</h2>
            <p className="muted">
              {count} of {maxItems} items
            </p>
            {lines.length === 0 ? (
              <p className="muted">Tap food to add it.</p>
            ) : (
              <ul className="cart-lines">
                {lines.map((l) => (
                  <li key={l.key}>
                    <span className="cart-name">
                      {l.qty > 1 ? `${l.qty} × ` : ''}
                      {l.name}
                      {l.extras.map((e) => (
                        <span key={e.label} className="cart-extra">
                          + {e.label} {formatMoney(e.price)}
                        </span>
                      ))}
                    </span>
                    <span className="cart-price">
                      {formatMoney(l.price)}
                      {l.qty > 1 ? ' each' : ''}
                    </span>
                    <button className="icon-btn" aria-label={`Remove one ${l.name}`} onClick={() => setLines((prev) => removeOne(prev, l.key))}>
                      −
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {showRunningTotal && lines.length > 0 && (
              <p className="cart-running">Subtotal: {formatMoney(sum(lines.map((l) => lineEach(l) * l.qty)))}</p>
            )}
            <button className="primary wide" disabled={lines.length === 0} onClick={done}>
              Done ordering →
            </button>
          </div>
        </aside>
      </div>

      {picking && <ItemPicker item={picking} price={price} onAdd={(size, chosen) => add(picking, size, chosen)} onClose={() => setPicking(null)} />}
    </div>
  );
}

/** A dense, text-only wall menu: harder to scan, closer to ordering at a real counter. */
function MenuBoard({ restaurant, price, onChoose }: { restaurant: Restaurant; price: (c: Cents) => Cents; onChoose: (item: MenuItem) => void }) {
  return (
    <div className="menu-board" aria-label={`${restaurant.name} menu board`}>
      {restaurant.categories.map((c) => (
        <section key={c.id} className="board-section">
          <h3>{c.label}</h3>
          <ul>
            {restaurant.menu
              .filter((i) => i.category === c.id)
              .map((item) => (
                <li key={item.id}>
                  <button className="board-item" onClick={() => onChoose(item)}>
                    <span className="board-name">{item.name}</span>
                    <span className="board-dots" aria-hidden="true" />
                    {item.sizes ? (
                      <span className="board-sizes">
                        {item.sizes.map((s) => (
                          <span key={s.label}>
                            <small>{s.label.replace(/\s*\(.*\)$/, '')}</small> {formatMoney(price(s.price))}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="board-price">{formatMoney(price(item.price!))}</span>
                    )}
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
