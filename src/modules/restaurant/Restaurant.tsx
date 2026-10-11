import { useMemo, useState, type CSSProperties } from 'react';
import type { Restaurant as RestaurantData } from '../../data/types';
import { breakdown, calcTax, formatMoney, nextDollar, sum, type Cents } from '../../lib/money';
import { makeTask, orderUnits, type Line } from '../../lib/order';
import { checkPayment, composeFromWallet, ensureWallet, nextBillUp, suggestPayment, twentyOrMore } from '../../lib/problems';
import { randInt } from '../../lib/random';
import { useSettings } from '../../lib/settings';
import { addPartsHelps, addUpHelps, changeHelps, payHelps, taxHelps } from '../../components/helps';
import { Bill, MoneyPile } from '../../components/MoneyView';
import { Question } from '../../components/Question';
import { ReadAloud } from '../../components/ReadAloud';
import { Receipt } from '../../components/Receipt';
import { StepBar } from '../../components/StepBar';
import { Totals } from '../../components/Totals';
import { WalletPicker } from '../../components/WalletPicker';
import { OrderScreen } from './OrderScreen';

type Step = 'order' | 'subtotal' | 'tax' | 'total' | 'pay' | 'change' | 'done';

const STEP_INDEX: Record<Step, number> = { order: 0, subtotal: 1, tax: 1, total: 1, pay: 2, change: 3, done: 4 };

export default function Restaurant({ restaurant }: { restaurant: RestaurantData }) {
  const [round, setRound] = useState(0);
  return <RestaurantOrder key={`${restaurant.id}-${round}`} restaurant={restaurant} onNewOrder={() => setRound((r) => r + 1)} />;
}

function RestaurantOrder({ restaurant: r, onNewOrder }: { restaurant: RestaurantData; onNewOrder: () => void }) {
  const { settings } = useSettings();
  // Lock the order's rules when it starts, so prices don't change mid-order.
  const [cfg] = useState(() => ({
    level: settings.priceLevel,
    taxOn: settings.taxOn,
    taxRate: settings.taxRate,
    taxMode: settings.taxMode,
    payWith: settings.payWith,
    wallet: settings.wallet,
    task: settings.orderMode === 'task' ? makeTask(r.menu, settings.priceLevel) : null,
    orderNumber: randInt(100, 999),
  }));
  const [step, setStep] = useState<Step>('order');
  const [lines, setLines] = useState<Line[]>([]);
  const [paidBills, setPaidBills] = useState<Cents[]>([]);

  const units = orderUnits(lines);
  const subtotal = sum(units.map((u) => u.cents));
  const tax = cfg.taxOn ? calcTax(subtotal, cfg.taxRate) : 0;
  const total = subtotal + tax;
  const paid = sum(paidBills);
  const level = `L${cfg.level}${cfg.taxOn ? ` + tax ${cfg.taxRate}%` : ''}`;
  const common = { module: r.id, level };

  const wallet = useMemo(() => ensureWallet(cfg.wallet, total, cfg.payWith === 'nextDollar'), [cfg.wallet, cfg.payWith, total]);

  const afterPay = (bills: Cents[]) => {
    setPaidBills(bills);
    setStep(sum(bills) === total ? 'done' : 'change');
  };

  const sayOrder = `Your order: ${units.map((u) => `${u.name}, ${formatMoney(u.cents)}`).join('. ')}.`;
  const brandStyle = {
    '--brand': r.colors.brand,
    '--brand-logo': r.colors.logo,
    '--brand-accent': r.colors.accent,
    '--brand-accent-text': r.colors.accentText,
  } as CSSProperties;

  return (
    <div className="rest" style={brandStyle}>
      <div className="rest-brand">
        <span className="rest-logo">
          <span aria-hidden="true">{r.emoji}</span> {r.name}
        </span>
        <span className="rest-tagline">{r.tagline}</span>
      </div>
      <StepBar steps={['Order', 'Total', 'Pay', 'Change']} current={STEP_INDEX[step]} />

      {step === 'order' && (
        <OrderScreen
          restaurant={r}
          level={cfg.level}
          task={cfg.task}
          lines={lines}
          setLines={setLines}
          showRunningTotal={settings.showRunningTotal}
          menuStyle={settings.menuStyle}
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
              <OrderList lines={lines} />
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
          helps={addPartsHelps([{ name: 'Subtotal', cents: subtotal }, { name: 'Tax', cents: tax }])}
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
          helps={payHelps(
            total,
            cfg.payWith,
            cfg.payWith === 'nextDollar' ? (composeFromWallet(wallet, nextDollar(total)) ?? suggestPayment(wallet, total)) : suggestPayment(wallet, total),
          )}
          check={(value) => {
            const bills = value as Cents[];
            const result = checkPayment(bills, total, cfg.payWith as 'nextDollar' | 'choose');
            if (!result.ok) return result;
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
              store={r.name}
              orderNumber={cfg.orderNumber}
              lines={lines}
              rows={[
                { label: 'Subtotal', cents: subtotal },
                ...(cfg.taxOn ? [{ label: `Tax (${cfg.taxRate}%)`, cents: tax }] : []),
                { label: 'Total', cents: total, strong: true },
                { label: 'Cash', cents: paid },
                { label: 'Change', cents: paid - total, strong: true },
              ]}
              footer={r.footer}
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

