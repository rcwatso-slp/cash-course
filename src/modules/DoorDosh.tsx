import { useState } from 'react';
import { RESTAURANTS } from '../data/restaurants';
import type { Restaurant } from '../data/types';
import { DASHER_TIPS, deliveryFees, deliveryPrice, SERVICE_FEE_PCT, SMALL_ORDER_UNDER } from '../lib/budget';
import { calcTax, formatMoney, sum } from '../lib/money';
import { orderUnits, type Line } from '../lib/order';
import { randInt } from '../lib/random';
import { useSettings } from '../lib/settings';
import { addPartsHelps, addUpHelps, changeHelps, type PricedItem } from '../components/helps';
import { Question } from '../components/Question';
import { ReadAloud } from '../components/ReadAloud';
import { Receipt } from '../components/Receipt';
import { StepBar } from '../components/StepBar';
import { Totals } from '../components/Totals';
import { OrderList } from './restaurant/OrderList';
import { OrderScreen } from './restaurant/OrderScreen';

type Step = 'pick' | 'order' | 'subtotal' | 'tip' | 'total' | 'extra' | 'done';
const STEP_INDEX: Record<Step, number> = { pick: 0, order: 1, subtotal: 2, tip: 2, total: 2, extra: 3, done: 4 };

// Fast-food places deliver; the sit-down restaurant doesn't.
const DELIVERS = RESTAURANTS.filter((r) => !r.tableService);

export default function DoorDosh() {
  const [round, setRound] = useState(0);
  return <DoorDoshOrder key={round} onNewOrder={() => setRound((r) => r + 1)} />;
}

function DoorDoshOrder({ onNewOrder }: { onNewOrder: () => void }) {
  const { settings } = useSettings();
  const [cfg] = useState(() => ({
    level: settings.priceLevel,
    taxOn: settings.taxOn,
    taxRate: settings.taxRate,
    orderNumber: randInt(1000, 9999),
  }));
  const [step, setStep] = useState<Step>('pick');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [dasherTip, setDasherTip] = useState(0);

  const units = orderUnits(lines);
  const subtotal = sum(units.map((u) => u.cents));
  const fees = deliveryFees(subtotal);
  const tax = cfg.taxOn ? calcTax(subtotal, cfg.taxRate) : 0;
  const parts: PricedItem[] = [
    { name: 'Subtotal', cents: subtotal },
    { name: 'Delivery fee', cents: fees.deliveryFee },
    { name: 'Service fee', cents: fees.serviceFee },
    ...(fees.smallOrderFee ? [{ name: 'Small order fee', cents: fees.smallOrderFee }] : []),
    ...(cfg.taxOn ? [{ name: 'Tax', cents: tax }] : []),
    { name: 'Dasher tip', cents: dasherTip },
  ];
  const total = sum(parts.map((p) => p.cents));
  // The same food, picked up at the restaurant at menu prices.
  const pickupFood = sum(lines.map((l) => (l.regularEach ?? 0) * l.qty));
  const pickupTotal = pickupFood + (cfg.taxOn ? calcTax(pickupFood, cfg.taxRate) : 0);
  const common = { module: 'doordosh', level: `L${cfg.level}${cfg.taxOn ? ` + tax ${cfg.taxRate}%` : ''}` };

  return (
    <div className="dosh">
      <div className="dosh-brand">
        <span className="dosh-logo">🛵 DoorDosh</span>
        <span className="dosh-tagline">{restaurant ? `Delivering from ${restaurant.name}` : 'Food to your door. For a price.'}</span>
      </div>
      <StepBar steps={['Restaurant', 'Order', 'Total', 'Compare', 'Done']} current={STEP_INDEX[step]} />

      {step === 'pick' && (
        <section>
          <h2>Where do you want to order from?</h2>
          <div className="dosh-restaurants">
            {DELIVERS.map((r, i) => (
              <button
                key={r.id}
                className="dosh-restaurant"
                onClick={() => {
                  setRestaurant(r);
                  setStep('order');
                }}
              >
                <span className="dosh-rest-img" style={{ background: r.colors.brand }} aria-hidden="true">
                  {r.emoji}
                </span>
                <b>{r.name}</b>
                <span className="muted">
                  {formatMoney(fees.deliveryFee)} delivery fee · {20 + ((i * 7) % 20)} min
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 'order' && restaurant && (
        <>
          <p className="dosh-note">DoorDosh prices are higher than the prices at {restaurant.name}.</p>
          <OrderScreen
            restaurant={restaurant}
            level={cfg.level}
            task={null}
            adjust={deliveryPrice}
            lines={lines}
            setLines={setLines}
            showRunningTotal={settings.showRunningTotal}
            menuStyle="kiosk"
            onDone={() => setStep('subtotal')}
          />
        </>
      )}

      {step === 'subtotal' && (
        <Question
          key="subtotal"
          {...common}
          skill="subtotal"
          kind="money"
          answer={subtotal}
          answerLabel={formatMoney(subtotal)}
          inputLabel="Subtotal"
          prompt={
            <>
              <OrderList lines={lines} />
              <p className="q-text">What is your subtotal? Add up the prices.</p>
            </>
          }
          say={`Your order: ${units.map((u) => `${u.name}, ${formatMoney(u.cents)}`).join('. ')}. What is your subtotal?`}
          logText={`Add: ${units.map((u) => formatMoney(u.cents)).join(' + ')}`}
          helps={addUpHelps(units, 'subtotal')}
          onNext={() => setStep('tip')}
        />
      )}

      {step === 'tip' && (
        <section className="question">
          <div className="q-prompt">
            <div className="q-prompt-body">
              <p className="q-text">Your Dasher brings the food to your door. Pick a tip for them.</p>
            </div>
            <ReadAloud text="Your Dasher brings the food to your door. Pick a tip for them." />
          </div>
          <div className="tip-choices">
            {DASHER_TIPS.map((t) => (
              <button
                key={t}
                className="tip-choice"
                onClick={() => {
                  setDasherTip(t);
                  setStep('total');
                }}
              >
                <b>{formatMoney(t)}</b>
              </button>
            ))}
          </div>
        </section>
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
              <Totals rows={[...parts.map((p) => [p.name, formatMoney(p.cents)] as [string, string]), ['Total', '?']]} />
              <p className="muted">
                Service fee is {SERVICE_FEE_PCT}% of your subtotal.{' '}
                {fees.smallOrderFee > 0 && `Orders under ${formatMoney(SMALL_ORDER_UNDER)} have a small order fee.`}
              </p>
              <p className="q-text">What is your total with all the fees?</p>
            </>
          }
          say={`${parts.map((p) => `${p.name}, ${formatMoney(p.cents)}`).join('. ')}. What is your total with all the fees?`}
          logText={parts.map((p) => `${p.name} ${formatMoney(p.cents)}`).join(' + ')}
          helps={addPartsHelps(parts)}
          onNext={() => setStep('extra')}
        />
      )}

      {step === 'extra' && restaurant && (
        <Question
          key="extra"
          {...common}
          skill="extraCost"
          kind="money"
          answer={total - pickupTotal}
          answerLabel={formatMoney(total - pickupTotal)}
          inputLabel="Extra"
          prompt={
            <>
              <Totals
                rows={[
                  [`Pick it up at ${restaurant.name}`, formatMoney(pickupTotal)],
                  ['DoorDosh delivery', formatMoney(total)],
                ]}
              />
              <p className="q-text">
                If you went to {restaurant.name} yourself, the same food would cost <b>{formatMoney(pickupTotal)}</b>
                {cfg.taxOn ? ' with tax' : ''}. With DoorDosh it costs <b>{formatMoney(total)}</b>. How much extra does delivery cost?
              </p>
            </>
          }
          say={`If you went to ${restaurant.name} yourself, the same food would cost ${formatMoney(pickupTotal)}. With DoorDosh it costs ${formatMoney(total)}. How much extra does delivery cost?`}
          logText={`DoorDosh ${formatMoney(total)} − pickup ${formatMoney(pickupTotal)}`}
          helps={changeHelps(pickupTotal, total, settings.changeHelpStyle, 'extra')}
          solvedExtra={
            <p className="say-this">
              Delivery costs <b>{formatMoney(total - pickupTotal)}</b> more than picking it up yourself. Higher prices, fees and the tip all add up.
            </p>
          }
          nextLabel="See receipt"
          onNext={() => setStep('done')}
        />
      )}

      {step === 'done' && restaurant && (
        <div className="done">
          <h2>🛵 Your order is on the way!</h2>
          <Receipt
            store={`DoorDosh · ${restaurant.name}`}
            orderNumber={cfg.orderNumber}
            lines={lines}
            rows={[...parts.map((p) => ({ label: p.name, cents: p.cents })), { label: 'Total', cents: total, strong: true }]}
            footer={`Picking it up yourself would have saved ${formatMoney(total - pickupTotal)}.`}
          />
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

