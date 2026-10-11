import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, MENU, type CategoryId, type MenuItem, type Size } from '../data/mcdoogles';
import { breakdown, calcTax, formatMoney, nextDollar, sum, type Cents } from '../lib/money';
import {
  PRICE_LEVELS, checkPayment, composeFromWallet, ensureWallet, levelPrice, nextBillUp, suggestPayment, twentyOrMore,
  type PriceLevel,
} from '../lib/problems';
import { randInt, shuffle } from '../lib/random';
import { useSettings } from '../lib/settings';
import { addTaxHelps, addUpHelps, changeHelps, payHelps, taxHelps, type PricedItem } from '../components/helps';
import { Bill, MoneyPile } from '../components/MoneyView';
import { Question } from '../components/Question';
import { ReadAloud } from '../components/ReadAloud';
import { Receipt } from '../components/Receipt';
import { StepBar } from '../components/StepBar';
import { WalletPicker } from '../components/WalletPicker';

type Step = 'order' | 'subtotal' | 'tax' | 'total' | 'pay' | 'change' | 'done';

const STEP_INDEX: Record<Step, number> = { order: 0, subtotal: 1, tax: 1, total: 1, pay: 2, change: 3, done: 4 };

interface Line {
  key: string;
  name: string;
  emoji: string;
  price: Cents;
  qty: number;
}

const lineKey = (item: MenuItem, size?: Size) => (size ? `${item.id}:${size.label}` : item.id);
const lineName = (item: MenuItem, size?: Size) => (size ? `${size.label} ${item.name}` : item.name);

const TASK_SIZES: Record<PriceLevel, [number, number]> = { 1: [2, 2], 2: [2, 3], 3: [3, 4], 4: [4, 6] };

function makeTask(level: PriceLevel): { key: string; name: string; emoji: string }[] {
  const [min, max] = TASK_SIZES[level];
  return shuffle(MENU)
    .slice(0, randInt(min, max))
    .map((item) => {
      const size = item.sizes ? item.sizes[randInt(0, item.sizes.length - 1)] : undefined;
      return { key: lineKey(item, size), name: lineName(item, size), emoji: item.emoji };
    });
}

export default function McDoogles() {
  const [round, setRound] = useState(0);
  return <McDooglesOrder key={round} onNewOrder={() => setRound((r) => r + 1)} />;
}

function McDooglesOrder({ onNewOrder }: { onNewOrder: () => void }) {
  const { settings } = useSettings();
  // Lock the order's rules when it starts, so prices don't change mid-order.
  const [cfg] = useState(() => ({
    level: settings.priceLevel,
    taxOn: settings.taxOn,
    taxRate: settings.taxRate,
    taxMode: settings.taxMode,
    payWith: settings.payWith,
    wallet: settings.wallet,
    task: settings.orderMode === 'task' ? makeTask(settings.priceLevel) : null,
    orderNumber: randInt(100, 999),
  }));
  const [step, setStep] = useState<Step>('order');
  const [lines, setLines] = useState<Line[]>([]);
  const [paidBills, setPaidBills] = useState<Cents[]>([]);

  const units: PricedItem[] = lines.flatMap((l) => Array.from({ length: l.qty }, () => ({ name: l.name, cents: l.price })));
  const subtotal = sum(units.map((u) => u.cents));
  const tax = cfg.taxOn ? calcTax(subtotal, cfg.taxRate) : 0;
  const total = subtotal + tax;
  const paid = sum(paidBills);
  const level = `L${cfg.level}${cfg.taxOn ? ` + tax ${cfg.taxRate}%` : ''}`;
  const common = { module: 'mcdoogles' as const, level };

  const wallet = useMemo(
    () => ensureWallet(cfg.wallet, total, cfg.payWith === 'nextDollar'),
    [cfg.wallet, cfg.payWith, total],
  );

  const afterPay = (bills: Cents[]) => {
    setPaidBills(bills);
    setStep(sum(bills) === total ? 'done' : 'change');
  };

  const orderSummary = <OrderList lines={lines} />;
  const sayOrder = `Your order: ${units.map((u) => `${u.name}, ${formatMoney(u.cents)}`).join('. ')}.`;

  return (
    <div className="mcd">
      <div className="mcd-brand">
        <span className="mcd-logo">McDoogles</span>
        <span className="mcd-tagline">i'm tolerating it</span>
      </div>
      <StepBar steps={['Order', 'Total', 'Pay', 'Change']} current={STEP_INDEX[step]} />

      {step === 'order' && (
        <OrderScreen
          level={cfg.level}
          task={cfg.task}
          lines={lines}
          setLines={setLines}
          showRunningTotal={settings.showRunningTotal}
          onDone={() => setStep('subtotal')}
        />
      )}

      {step === 'subtotal' && (
        <Question
          key="subtotal"
          {...common}
          skill="subtotal"
          kind="money"
          answer={subtotal}
          answerLabel={formatMoney(subtotal)}
          inputLabel={cfg.taxOn ? 'Subtotal' : 'Total'}
          prompt={
            <>
              {orderSummary}
              <p className="q-text">What is your {cfg.taxOn ? 'subtotal (before tax)' : 'total'}? Add up the prices.</p>
            </>
          }
          say={`${sayOrder} What is your ${cfg.taxOn ? 'subtotal' : 'total'}? Add up the prices.`}
          logText={`Add: ${units.map((u) => formatMoney(u.cents)).join(' + ')}`}
          helps={addUpHelps(units, cfg.taxOn ? 'subtotal' : 'total')}
          onNext={() => setStep(cfg.taxOn ? (cfg.taxMode === 'client' ? 'tax' : 'total') : 'pay')}
        />
      )}

      {step === 'tax' && (
        <Question
          key="tax"
          {...common}
          skill="tax"
          kind="money"
          answer={tax}
          answerLabel={formatMoney(tax)}
          inputLabel="Tax"
          prompt={
            <>
              <Totals rows={[['Subtotal', formatMoney(subtotal)], [`Tax (${cfg.taxRate}%)`, '?']]} />
              <p className="q-text">
                Sales tax is {cfg.taxRate}%. How much is the tax on {formatMoney(subtotal)}?
              </p>
            </>
          }
          say={`Your subtotal is ${formatMoney(subtotal)}. Sales tax is ${cfg.taxRate} percent. How much is the tax?`}
          logText={`${cfg.taxRate}% tax on ${formatMoney(subtotal)}`}
          helps={taxHelps(subtotal, cfg.taxRate)}
          onNext={() => setStep('total')}
        />
      )}

      {step === 'total' && (
        <Question
          key="total"
          {...common}
          skill="total"
          kind="money"
          answer={total}
          answerLabel={formatMoney(total)}
          inputLabel="Total"
          prompt={
            <>
              <Totals rows={[['Subtotal', formatMoney(subtotal)], [`Tax (${cfg.taxRate}%)`, formatMoney(tax)], ['Total', '?']]} />
              <p className="q-text">What is your total with tax?</p>
            </>
          }
          say={`Your subtotal is ${formatMoney(subtotal)}. The tax is ${formatMoney(tax)}. What is your total?`}
          logText={`${formatMoney(subtotal)} + ${formatMoney(tax)} tax`}
          helps={addTaxHelps(subtotal, tax)}
          onNext={() => setStep('pay')}
        />
      )}

      {step === 'pay' && (cfg.payWith === 'nextBill' || cfg.payWith === 'twenty') && (
        <GivenBill total={total} bill={cfg.payWith === 'nextBill' ? nextBillUp(total) : twentyOrMore(total)} onPay={afterPay} />
      )}

      {step === 'pay' && (cfg.payWith === 'nextDollar' || cfg.payWith === 'choose') && (
        <Question
          key="pay"
          {...common}
          skill="pay"
          kind="custom"
          answerLabel="You can pay with that"
          prompt={
            <p className="q-text">
              Your total is <b>{formatMoney(total)}</b>.{' '}
              {cfg.payWith === 'nextDollar' ? 'Pay with the next dollar up.' : 'Pick the bills you will pay with.'}
            </p>
          }
          say={`Your total is ${formatMoney(total)}. ${cfg.payWith === 'nextDollar' ? 'Pay with the next dollar up.' : 'Pick the bills you will pay with.'}`}
          logText={`Pay ${formatMoney(total)} (${cfg.payWith === 'nextDollar' ? 'next dollar up' : 'choose bills'})`}
          helps={payHelps(total, cfg.payWith, cfg.payWith === 'nextDollar' ? (composeFromWallet(wallet, nextDollar(total)) ?? suggestPayment(wallet, total)) : suggestPayment(wallet, total))}
          check={(value) => {
            const bills = value as Cents[];
            const r = checkPayment(bills, total, cfg.payWith as 'nextDollar' | 'choose');
            if (!r.ok) return r;
            setPaidBills(bills);
            return { ok: true, label: `You paid ${formatMoney(sum(bills))}` };
          }}
          render={(submit, solved) => <WalletPicker wallet={wallet} disabled={solved} onPay={submit} />}
          onNext={() => setStep(paid === total ? 'done' : 'change')}
        />
      )}

      {step === 'change' && (
        <Question
          key="change"
          {...common}
          skill="change"
          kind="money"
          answer={paid - total}
          answerLabel={formatMoney(paid - total)}
          inputLabel="Change"
          prompt={
            <>
              <p className="q-text">
                Your total is <b>{formatMoney(total)}</b>. You paid <b>{formatMoney(paid)}</b>:
              </p>
              <MoneyPile denoms={paidBills} />
              <p className="q-text">How much change should you get back?</p>
            </>
          }
          say={`Your total is ${formatMoney(total)}. You paid ${formatMoney(paid)}. How much change should you get back?`}
          logText={`Change from ${formatMoney(paid)} for ${formatMoney(total)}`}
          helps={changeHelps(total, paid, settings.changeHelpStyle)}
          onNext={() => setStep('done')}
          nextLabel="See receipt"
        />
      )}

      {step === 'done' && (
        <div className="done">
          <h2>Order complete</h2>
          {paid === total && <p>You paid the exact amount, so there's no change.</p>}
          <div className="done-grid">
            <Receipt
              store="McDoogles"
              orderNumber={cfg.orderNumber}
              lines={lines}
              subtotal={subtotal}
              tax={cfg.taxOn ? tax : null}
              taxRate={cfg.taxRate}
              paid={paid}
              footer="Thanks for eating at McDoogles!"
            />
            {paid > total && (
              <div>
                <h3>Your change</h3>
                <MoneyPile denoms={breakdown(paid - total)} />
              </div>
            )}
          </div>
          <div className="button-row">
            <button className="primary" onClick={onNewOrder} autoFocus>
              New order
            </button>
            <a className="button" href="#/">
              Home
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderList({ lines }: { lines: Line[] }) {
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
          </span>
          <span className="order-price">
            {formatMoney(l.price)}
            {l.qty > 1 ? ' each' : ''}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Totals({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="totals">
      {rows.map(([k, v]) => (
        <div key={k} className={v === '?' ? 'unknown' : ''}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function GivenBill({ total, bill, onPay }: { total: Cents; bill: Cents; onPay: (bills: Cents[]) => void }) {
  const text = `Your total is ${formatMoney(total)}. You pay with a $${bill / 100} bill.`;
  return (
    <section className="question">
      <div className="q-prompt">
        <div className="q-prompt-body">
          <p className="q-text">
            Your total is <b>{formatMoney(total)}</b>. You pay with a <b>${bill / 100} bill</b>.
          </p>
          <Bill cents={bill} />
        </div>
        <ReadAloud text={text} />
      </div>
      <button className="primary next-btn" onClick={() => onPay([bill])} autoFocus>
        Hand it to the cashier →
      </button>
    </section>
  );
}

interface OrderScreenProps {
  level: PriceLevel;
  task: { key: string; name: string; emoji: string }[] | null;
  lines: Line[];
  setLines: (fn: (prev: Line[]) => Line[]) => void;
  showRunningTotal: boolean;
  onDone: () => void;
}

function OrderScreen({ level, task, lines, setLines, showRunningTotal, onDone }: OrderScreenProps) {
  const [category, setCategory] = useState<CategoryId>('meals');
  const [sizeItem, setSizeItem] = useState<MenuItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const maxItems = task ? Math.max(task.length, PRICE_LEVELS[level].maxItems) : PRICE_LEVELS[level].maxItems;
  const count = sum(lines.map((l) => l.qty));
  const price = (c: Cents) => levelPrice(c, level);

  function add(item: MenuItem, size?: Size) {
    if (count >= maxItems) {
      setNotice(`That's the most for this order (${maxItems} items). Remove something to add something else.`);
      return;
    }
    const key = lineKey(item, size);
    const name = lineName(item, size);
    setLines((prev) =>
      prev.some((l) => l.key === key)
        ? prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l))
        : [...prev, { key, name, emoji: item.emoji, price: price(size ? size.price : item.price!), qty: 1 }],
    );
    setNotice(`Added: ${name}`);
  }

  function remove(key: string) {
    setLines((prev) => prev.flatMap((l) => (l.key !== key ? [l] : l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : [])));
    setNotice(null);
  }

  function done() {
    if (task) {
      const matches = lines.length === task.length && task.every((t) => lines.some((l) => l.key === t.key && l.qty === 1));
      if (!matches) {
        setNotice("Your order doesn't match the order card yet. Check the card.");
        return;
      }
    }
    onDone();
  }

  const subtotal = sum(lines.map((l) => l.price * l.qty));

  return (
    <div className="kiosk">
      {task && (
        <div className="task-card">
          <div className="task-card-head">
            <h2>Order card</h2>
            <ReadAloud text={`Order: ${task.map((t) => t.name).join(', ')}.`} />
          </div>
          <ul>
            {task.map((t) => {
              const have = lines.some((l) => l.key === t.key);
              return (
                <li key={t.key} className={have ? 'have' : ''}>
                  <span aria-hidden="true">{have ? '✓' : '○'}</span> {t.emoji} {t.name}
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

      <div className="kiosk-body">
        <nav className="kiosk-cats" aria-label="Menu categories">
          {CATEGORIES.map((c) => (
            <button key={c.id} className="cat-btn" aria-pressed={c.id === category} onClick={() => setCategory(c.id)}>
              {c.label}
            </button>
          ))}
        </nav>

        <div className="kiosk-items">
          <div className="item-grid">
            {MENU.filter((i) => i.category === category).map((item) => (
              <button key={item.id} className="item-tile" onClick={() => (item.sizes ? setSizeItem(item) : add(item))}>
                <span className="item-emoji" aria-hidden="true">
                  {item.emoji}
                </span>
                <span className="item-name">{item.name}</span>
                {item.note && <span className="item-note">{item.note}</span>}
                <span className="item-price">
                  {item.sizes ? `From ${formatMoney(price(item.sizes[0].price))}` : formatMoney(price(item.price!))}
                </span>
              </button>
            ))}
          </div>
        </div>

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
                    </span>
                    <span className="cart-price">
                      {formatMoney(l.price)}
                      {l.qty > 1 ? ' each' : ''}
                    </span>
                    <button className="icon-btn" aria-label={`Remove one ${l.name}`} onClick={() => remove(l.key)}>
                      −
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {showRunningTotal && lines.length > 0 && <p className="cart-running">Subtotal: {formatMoney(subtotal)}</p>}
            <button className="primary wide" disabled={lines.length === 0} onClick={done}>
              Done ordering →
            </button>
          </div>
        </aside>
      </div>

      {sizeItem && (
        <SizePicker
          item={sizeItem}
          price={price}
          onPick={(size) => {
            add(sizeItem, size);
            setSizeItem(null);
          }}
          onClose={() => setSizeItem(null)}
        />
      )}
    </div>
  );
}

function SizePicker({
  item, price, onPick, onClose,
}: {
  item: MenuItem;
  price: (c: Cents) => Cents;
  onPick: (s: Size) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="size-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="size-title">
          {item.emoji} {item.name}
        </h2>
        <p>Pick a size.</p>
        <div className="size-options">
          {item.sizes!.map((s, i) => (
            <button key={s.label} className="size-btn" onClick={() => onPick(s)} autoFocus={i === 1}>
              <span className={`size-icon size-${i}`} aria-hidden="true">
                {item.emoji}
              </span>
              <span>{s.label}</span>
              <b>{formatMoney(price(s.price))}</b>
            </button>
          ))}
        </div>
        <button className="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
