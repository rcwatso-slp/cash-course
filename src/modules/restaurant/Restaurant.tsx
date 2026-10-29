import { useMemo, useState, type CSSProperties } from 'react';
import type { Restaurant as RestaurantData } from '../../data/types';
import { calcTip, pickBudget, TIP_CHOICES } from '../../lib/budget';
import { breakdown, calcTax, formatMoney, nextDollar, sum, type Cents } from '../../lib/money';
import { makeTask, orderUnits, type Line } from '../../lib/order';
import { checkPayment, composeFromWallet, ensureWallet, nextBillUp, suggestPayment, twentyOrMore } from '../../lib/problems';
import { randInt } from '../../lib/random';
import { useSettings } from '../../lib/settings';
import { addPartsHelps, addUpHelps, affordHelps, changeHelps, payHelps, taxHelps, tipHelps } from '../../components/helps';
import { Bill, MoneyPile } from '../../components/MoneyView';
import { Question } from '../../components/Question';
import { ReadAloud } from '../../components/ReadAloud';
import { Receipt } from '../../components/Receipt';
import { StepBar } from '../../components/StepBar';
import { Totals } from '../../components/Totals';
import { WalletPicker } from '../../components/WalletPicker';
import { OrderList } from './OrderList';
import { OrderScreen } from './OrderScreen';
import { SayOrder } from './SayOrder';

type Step = 'order' | 'say' | 'subtotal' | 'tax' | 'total' | 'tip' | 'withTip' | 'budget' | 'pay' | 'change' | 'done';

const STEP_INDEX: Record<Step, number> = {
  order: 0, say: 0, subtotal: 1, tax: 1, total: 1, tip: 1, withTip: 1, budget: 1, pay: 2, change: 3, done: 4,
};

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
    // An order card and a budget would fight each other, so budgets are for free choice only.
    budget: settings.orderMode === 'task' ? 0 : pickBudget(settings.budget),
    tipMode: settings.tipMode,
    tipPct: settings.tipPct,
    sayOrder: settings.sayOrder,
    orderNumber: randInt(100, 999),
  }));
  const [step, setStep] = useState<Step>('order');
  const [lines, setLines] = useState<Line[]>([]);
  const [paidBills, setPaidBills] = useState<Cents[]>([]);
  const [tipPct, setTipPct] = useState<number | null>(null);
  /** When he works out the tip himself, his answer (within a penny) is the tip he leaves. */
  const [ownTip, setOwnTip] = useState<Cents | null>(null);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);

  const units = orderUnits(lines);
  const subtotal = sum(units.map((u) => u.cents));
  const tax = cfg.taxOn ? calcTax(subtotal, cfg.taxRate) : 0;
  const total = subtotal + tax;
  const tip = ownTip ?? (tipPct !== null ? calcTip(subtotal, tipPct) : 0);
  const due = total + tip;
  const paid = sum(paidBills);
  const level = `L${cfg.level}${cfg.taxOn ? ` + tax ${cfg.taxRate}%` : ''}${cfg.budget ? ` · budget ${formatMoney(cfg.budget)}` : ''}`;
  const common = { module: r.id, level };

  const wallet = useMemo(() => ensureWallet(cfg.wallet, due, cfg.payWith === 'nextDollar'), [cfg.wallet, cfg.payWith, due]);

  /** Once the total is known: tip (sit-down), then budget check, then pay. */
  const afterTotal = (): Step => (r.tableService ? 'tip' : afterTip());
  const afterTip = (): Step => (cfg.budget ? 'budget' : 'pay');

  const afterPay = (bills: Cents[]) => {
    setPaidBills(bills);
    setStep(sum(bills) === due ? 'done' : 'change');
  };

  const sayOrder = `Your order: ${units.map((u) => `${u.name}, ${formatMoney(u.cents)}`).join('. ')}.`;
  const checkRows: [string, string][] = [
    [cfg.taxOn ? 'Subtotal' : 'Food total', formatMoney(subtotal)],
    ...(cfg.taxOn ? [[`Tax (${cfg.taxRate}%)`, formatMoney(tax)] as [string, string], ['Total', formatMoney(total)] as [string, string]] : []),
  ];
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
          budget={cfg.budget}
          message={orderMessage}
          lines={lines}
          setLines={setLines}
          showRunningTotal={settings.showRunningTotal}
          menuStyle={settings.menuStyle}
          onDone={() => setStep(cfg.sayOrder ? 'say' : 'subtotal')}
        />
      )}

      {step === 'say' && <SayOrder lines={lines} tableService={!!r.tableService} onDone={() => setStep('subtotal')} />}

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
          onNext={() => setStep(cfg.taxOn ? (cfg.taxMode === 'client' ? 'tax' : 'total') : afterTotal())}
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
          onNext={() => setStep(afterTotal())}
        />
      )}

      {step === 'tip' && cfg.tipMode === 'choose' && (
        <section className="question">
          <div className="q-prompt">
            <div className="q-prompt-body">
              <p className="q-text">Your server brings the check. 🧾</p>
              <Totals rows={checkRows} />
              <p className="q-text">Pick a tip for your server. The tip is figured on the food total, before tax.</p>
            </div>
            <ReadAloud text="Your server brings the check. Pick a tip for your server." />
          </div>
          <div className="tip-choices">
            {TIP_CHOICES.map((pct) => (
              <button
                key={pct}
                className="tip-choice"
                onClick={() => {
                  setTipPct(pct);
                  setStep('withTip');
                }}
              >
                <b>{pct}%</b>
                <span>{formatMoney(calcTip(subtotal, pct))}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 'tip' && cfg.tipMode === 'calculate' && (
        <Question
          key="tip"
          {...common}
          skill="tip"
          kind="money"
          answer={calcTip(subtotal, cfg.tipPct)}
          tolerance={1}
          answerLabel={formatMoney(calcTip(subtotal, cfg.tipPct))}
          inputLabel="Tip"
          prompt={
            <>
              <p className="q-text">Your server brings the check. 🧾</p>
              <Totals rows={checkRows} />
              <p className="q-text">
                Leave a <b>{cfg.tipPct}%</b> tip. Tips are figured on the food total before tax: <b>{formatMoney(subtotal)}</b>. How much is the tip?
              </p>
            </>
          }
          say={`Your server brings the check. Leave a ${cfg.tipPct} percent tip on ${formatMoney(subtotal)}. How much is the tip?`}
          logText={`${cfg.tipPct}% tip on ${formatMoney(subtotal)}`}
          helps={tipHelps(subtotal, cfg.tipPct)}
          onCorrect={setOwnTip}
          onNext={() => {
            setTipPct(cfg.tipPct);
            setStep('withTip');
          }}
        />
      )}

      {step === 'withTip' && (
        <Question
          key="withTip"
          {...common}
          skill="total"
          kind="money"
          answer={due}
          answerLabel={formatMoney(due)}
          inputLabel="With tip"
          prompt={
            <>
              <Totals rows={[...checkRows, [`Tip (${tipPct}%)`, formatMoney(tip)], ['Total with tip', '?']]} />
              <p className="q-text">What is your total with the tip?</p>
            </>
          }
          say={`Your check is ${formatMoney(total)}. The tip is ${formatMoney(tip)}. What is your total with the tip?`}
          logText={`${formatMoney(total)} + ${formatMoney(tip)} tip`}
          helps={addPartsHelps([{ name: cfg.taxOn ? 'Check total' : 'Food total', cents: total }, { name: 'Tip', cents: tip }])}
          onNext={() => setStep(afterTip())}
        />
      )}

      {step === 'budget' && (
        <Question
          key="budget"
          {...common}
          skill="afford"
          kind="yesno"
          yesLabel="Yes, I have enough"
          noLabel="No, it's too much"
          answer={due <= cfg.budget}
          answerLabel={due <= cfg.budget ? 'You have enough' : "It's too much"}
          prompt={
            <>
              <div className="budget-banner">
                💵 You have <b>{formatMoney(cfg.budget)}</b> to spend.
              </div>
              <p className="q-text">
                Your total is <b>{formatMoney(due)}</b>. Do you have enough money?
              </p>
            </>
          }
          say={`You have ${formatMoney(cfg.budget)} to spend. Your total is ${formatMoney(due)}. Do you have enough money?`}
          logText={`Have ${formatMoney(cfg.budget)}, total ${formatMoney(due)}`}
          helps={affordHelps(cfg.budget, [due])}
          solvedExtra={
            <p className="say-this">
              {due <= cfg.budget
                ? `You'll have ${formatMoney(cfg.budget - due)} left over.`
                : `You're ${formatMoney(due - cfg.budget)} over. Take something off your order.`}
            </p>
          }
          nextLabel={due <= cfg.budget ? 'Pay' : 'Put something back'}
          onNext={() => {
            if (due <= cfg.budget) {
              setStep('pay');
              return;
            }
            setOrderMessage(`You're ${formatMoney(due - cfg.budget)} over your ${formatMoney(cfg.budget)}. Take something off your order (tap −).`);
            setTipPct(null);
            setOwnTip(null);
            setStep('order');
          }}
        />
      )}

      {step === 'pay' && (cfg.payWith === 'nextBill' || cfg.payWith === 'twenty') && (
        <GivenBill
          total={due}
          bill={cfg.payWith === 'nextBill' ? nextBillUp(due) : twentyOrMore(due)}
          to={r.tableService ? 'your server' : 'the cashier'}
          onPay={afterPay}
        />
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
              Your total is <b>{formatMoney(due)}</b>.{' '}
              {cfg.payWith === 'nextDollar' ? 'Pay with the next dollar up.' : 'Pick the bills you will pay with.'}
            </p>
          }
          say={`Your total is ${formatMoney(due)}. ${cfg.payWith === 'nextDollar' ? 'Pay with the next dollar up.' : 'Pick the bills you will pay with.'}`}
          logText={`Pay ${formatMoney(due)} (${cfg.payWith === 'nextDollar' ? 'next dollar up' : 'choose bills'})`}
          helps={payHelps(
            due,
            cfg.payWith,
            cfg.payWith === 'nextDollar' ? (composeFromWallet(wallet, nextDollar(due)) ?? suggestPayment(wallet, due)) : suggestPayment(wallet, due),
          )}
          check={(value) => {
            const bills = value as Cents[];
            const result = checkPayment(bills, due, cfg.payWith as 'nextDollar' | 'choose');
            if (!result.ok) return result;
            setPaidBills(bills);
            return { ok: true, label: `You paid ${formatMoney(sum(bills))}` };
          }}
          render={(submit, solved) => <WalletPicker wallet={wallet} disabled={solved} onPay={submit} />}
          onNext={() => setStep(paid === due ? 'done' : 'change')}
        />
      )}

      {step === 'change' && (
        <Question
          key="change"
          {...common}
          skill="change"
          kind="money"
          answer={paid - due}
          answerLabel={formatMoney(paid - due)}
          inputLabel="Change"
          prompt={
            <>
              <p className="q-text">
                Your total is <b>{formatMoney(due)}</b>. You paid <b>{formatMoney(paid)}</b>:
              </p>
              <MoneyPile denoms={paidBills} />
              <p className="q-text">How much change should you get back?</p>
            </>
          }
          say={`Your total is ${formatMoney(due)}. You paid ${formatMoney(paid)}. How much change should you get back?`}
          logText={`Change from ${formatMoney(paid)} for ${formatMoney(due)}`}
          helps={changeHelps(due, paid, settings.changeHelpStyle)}
          onNext={() => setStep('done')}
          nextLabel="See receipt"
        />
      )}

      {step === 'done' && (
        <div className="done">
          <h2>Order complete</h2>
          {paid === due && <p>You paid the exact amount, so there's no change.</p>}
          <div className="done-grid">
            <Receipt
              store={r.name}
              orderNumber={cfg.orderNumber}
              lines={lines}
              rows={[
                { label: 'Subtotal', cents: subtotal },
                ...(cfg.taxOn ? [{ label: `Tax (${cfg.taxRate}%)`, cents: tax }] : []),
                { label: 'Total', cents: total, strong: !r.tableService },
                ...(r.tableService ? [{ label: `Tip (${tipPct}%)`, cents: tip }, { label: 'Total with tip', cents: due, strong: true }] : []),
                { label: 'Cash', cents: paid },
                { label: 'Change', cents: paid - due, strong: true },
              ]}
              footer={r.footer}
            />
            {paid > due && (
              <div>
                <h3>Your change</h3>
                <MoneyPile denoms={breakdown(paid - due)} />
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

function GivenBill({ total, bill, to, onPay }: { total: Cents; bill: Cents; to: string; onPay: (bills: Cents[]) => void }) {
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
        Give it to {to} →
      </button>
    </section>
  );
}
