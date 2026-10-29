import { useState } from 'react';
import type { DeliveryOption, Store } from '../../data/types';
import { calcTax, formatMoney, sum, type Cents } from '../../lib/money';
import type { PriceLevel } from '../../lib/problems';
import { arrivalDate, cartUnits, findProduct, giftCardFor, shippingCost, shopPrice, type CartLine } from '../../lib/shop';
import { useSettings } from '../../lib/settings';
import { addPartsHelps, addUpHelps, affordHelps, changeHelps, taxHelps, type PricedItem } from '../../components/helps';
import { Question, type Help } from '../../components/Question';
import { Receipt } from '../../components/Receipt';
import { StepBar } from '../../components/StepBar';
import { Totals } from '../../components/Totals';

export const CHECKOUT_STEPS = ['Cart', 'Subtotal', 'Delivery', 'Total', 'Pay', 'Done'];

type Step = 'subtotal' | 'delivery' | 'shipping' | 'tax' | 'total' | 'budget' | 'left' | 'review' | 'done';

const STEP_INDEX: Record<Step, number> = { subtotal: 1, delivery: 2, shipping: 2, tax: 3, total: 3, budget: 4, left: 4, review: 4, done: 5 };

interface Props {
  store: Store;
  cart: CartLine[];
  level: PriceLevel;
  orderNumber: number;
  onBackToCart: (message?: string) => void;
  onShopAgain: () => void;
}

export function Checkout({ store, cart, level, orderNumber, onBackToCart, onShopAgain }: Props) {
  const { settings } = useSettings();
  const [cfg] = useState(() => ({
    taxOn: settings.taxOn,
    taxRate: settings.taxRate,
    taxMode: settings.taxMode,
    giftCard: settings.giftCard,
    // Budget mode: the gift card is all he has, so the order has to fit on it.
    strictCard: settings.budget !== 0 && settings.orderMode !== 'task',
  }));
  const [step, setStep] = useState<Step>('subtotal');
  const [delivery, setDelivery] = useState<DeliveryOption | null>(null);

  const units = cartUnits(store, cart, level);
  const subtotal = sum(units.map((u) => u.cents));
  const shipping = delivery ? shippingCost(delivery, subtotal) : 0;
  const tax = cfg.taxOn ? calcTax(subtotal, cfg.taxRate) : 0;
  const total = subtotal + shipping + tax;
  const card = cfg.strictCard ? cfg.giftCard : giftCardFor(total, cfg.giftCard);
  const afterTotal = (): Step => (cfg.strictCard ? 'budget' : 'left');
  const common = { module: store.id, level: `L${level}${cfg.taxOn ? ` + tax ${cfg.taxRate}%` : ''}` };

  const parts: PricedItem[] = [
    { name: 'Subtotal', cents: subtotal },
    ...(shipping > 0 ? [{ name: 'Shipping', cents: shipping }] : []),
    ...(cfg.taxOn ? [{ name: 'Tax', cents: tax }] : []),
  ];
  const shippingLabel = shipping === 0 ? 'FREE' : formatMoney(shipping);

  const afterDelivery = (opt: DeliveryOption) => {
    setDelivery(opt);
    setStep(opt.freeOver !== undefined ? 'shipping' : afterShipping());
  };
  // With no shipping and no tax, the total is just the subtotal, so skip asking it again.
  const afterShipping = (): Step => (cfg.taxOn ? (cfg.taxMode === 'client' ? 'tax' : 'total') : 'total');
  const needsTotalQuestion = (opt: DeliveryOption | null) => cfg.taxOn || (opt ? shippingCost(opt, subtotal) > 0 : false);

  const lines = cart.map((l) => {
    const p = findProduct(store, l.productId);
    return { name: p.name, qty: l.qty, price: shopPrice(p, level), emoji: p.emoji };
  });

  return (
    <div className="checkout">
      <StepBar steps={CHECKOUT_STEPS} current={STEP_INDEX[step]} />

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
              <CartSummary lines={lines} />
              <p className="q-text">What is your subtotal? Add up the prices.</p>
            </>
          }
          say={`Your cart: ${lines.map((l) => `${l.qty > 1 ? `${l.qty} of ` : ''}${l.name}, ${formatMoney(l.price)}${l.qty > 1 ? ' each' : ''}`).join('. ')}. What is your subtotal?`}
          logText={`Add: ${units.map((u) => formatMoney(u.cents)).join(' + ')}`}
          helps={addUpHelps(units, 'subtotal')}
          onNext={() => setStep('delivery')}
        />
      )}

      {step === 'delivery' && (
        <section className="question">
          <h2>How do you want to get your order?</h2>
          <p className="muted">Your subtotal is {formatMoney(subtotal)}.</p>
          <div className="delivery-options">
            {store.delivery.map((opt) => (
              <button key={opt.id} className="delivery-option" onClick={() => afterDelivery(opt)}>
                <b>{opt.label}</b>
                <span>{opt.detail}</span>
              </button>
            ))}
          </div>
          <button className="link-btn" onClick={() => onBackToCart()}>
            ← Back to {store.cartName.toLowerCase()}
          </button>
        </section>
      )}

      {step === 'shipping' && delivery && (
        <Question
          key="shipping"
          {...common}
          skill="shipping"
          kind="yesno"
          yesLabel="Yes, it's free"
          noLabel={`No, I pay ${formatMoney(delivery.price)}`}
          answer={subtotal >= delivery.freeOver!}
          answerLabel={subtotal >= delivery.freeOver! ? `Shipping is FREE` : `Shipping costs ${formatMoney(delivery.price)}`}
          prompt={
            <>
              <p className="q-text">
                {delivery.label}: <b>{delivery.detail}</b>.
              </p>
              <p className="q-text">
                Your subtotal is <b>{formatMoney(subtotal)}</b>. Is your shipping free?
              </p>
            </>
          }
          say={`${delivery.label}. ${delivery.detail}. Your subtotal is ${formatMoney(subtotal)}. Is your shipping free?`}
          logText={`Is ${formatMoney(subtotal)} at least ${formatMoney(delivery.freeOver!)}?`}
          helps={freeShippingHelps(subtotal, delivery)}
          onNext={() => setStep(needsTotalQuestion(delivery) ? afterShipping() : afterTotal())}
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

      {step === 'total' && !needsTotalQuestion(delivery) && <SkipTotal onNext={() => setStep(afterTotal())} total={total} />}

      {step === 'total' && needsTotalQuestion(delivery) && (
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
              <Totals
                rows={[
                  ['Subtotal', formatMoney(subtotal)],
                  ['Shipping', shippingLabel],
                  ...(cfg.taxOn ? [[`Tax (${cfg.taxRate}%)`, formatMoney(tax)] as [string, string]] : []),
                  ['Order total', '?'],
                ]}
              />
              <p className="q-text">What is your order total?</p>
            </>
          }
          say={`Subtotal ${formatMoney(subtotal)}. Shipping ${shipping === 0 ? 'free' : formatMoney(shipping)}.${cfg.taxOn ? ` Tax ${formatMoney(tax)}.` : ''} What is your order total?`}
          logText={parts.map((p) => `${p.name} ${formatMoney(p.cents)}`).join(' + ')}
          helps={addPartsHelps(parts)}
          onNext={() => setStep(afterTotal())}
        />
      )}

      {step === 'budget' && (
        <Question
          key="budget"
          {...common}
          skill="afford"
          kind="yesno"
          yesLabel="Yes, there's enough"
          noLabel="No, it's too much"
          answer={total <= card}
          answerLabel={total <= card ? "There's enough on the card" : "There isn't enough on the card"}
          prompt={
            <>
              <div className="gift-card" aria-label={`Gift card with ${formatMoney(card)}`}>
                <span className="gift-card-name">🎁 {store.name} Gift Card</span>
                <span className="gift-card-balance">Balance: {formatMoney(card)}</span>
              </div>
              <p className="q-text">
                Your order total is <b>{formatMoney(total)}</b>. Is there enough on your gift card?
              </p>
            </>
          }
          say={`Your gift card has ${formatMoney(card)}. Your order total is ${formatMoney(total)}. Is there enough on your gift card?`}
          logText={`Card ${formatMoney(card)}, total ${formatMoney(total)}`}
          helps={affordHelps(card, [total])}
          solvedExtra={
            total > card && (
              <p className="say-this">
                You're {formatMoney(total - card)} over. Take something out of your {store.cartName.toLowerCase()}.
              </p>
            )
          }
          nextLabel={total <= card ? 'Next' : `Back to ${store.cartName.toLowerCase()}`}
          onNext={() =>
            total <= card
              ? setStep('left')
              : onBackToCart(`Your order is ${formatMoney(total - card)} more than your ${formatMoney(card)} gift card. Take something out, then check out again.`)
          }
        />
      )}

      {step === 'left' && (
        <Question
          key="left"
          {...common}
          skill="left"
          kind="money"
          answer={card - total}
          answerLabel={formatMoney(card - total)}
          inputLabel="Left on card"
          prompt={
            <>
              <div className="gift-card" aria-label={`Gift card with ${formatMoney(card)}`}>
                <span className="gift-card-name">🎁 {store.name} Gift Card</span>
                <span className="gift-card-balance">Balance: {formatMoney(card)}</span>
              </div>
              <p className="q-text">
                You're paying with a gift card that has <b>{formatMoney(card)}</b> on it. Your order total is <b>{formatMoney(total)}</b>.
              </p>
              <p className="q-text">How much will be left on your gift card?</p>
            </>
          }
          say={`You're paying with a gift card that has ${formatMoney(card)} on it. Your order total is ${formatMoney(total)}. How much will be left on your gift card?`}
          logText={`${formatMoney(card)} gift card − ${formatMoney(total)}`}
          helps={changeHelps(total, card, settings.changeHelpStyle, 'left')}
          onNext={() => setStep('review')}
          nextLabel="Review order"
        />
      )}

      {step === 'review' && delivery && (
        <section className="question review">
          <h2>Review your order</h2>
          <div className="review-grid">
            <div>
              <h3>{delivery.days === 0 ? 'Pickup' : 'Shipping to'}</h3>
              <p>
                {delivery.days === 0 ? 'Pick up at the store' : `${settings.nickname || 'You'}, 123 Practice Lane, Anytown, USA`}
                <br />
                <span className="muted">This is a practice address.</span>
              </p>
              <h3>Payment</h3>
              <p>🎁 Gift card ({formatMoney(card)})</p>
              <h3>{delivery.label}</h3>
              <p>{delivery.days === 0 ? 'Ready today' : `Arrives ${arrivalDate(delivery.days)}`}</p>
            </div>
            <Totals
              rows={[
                ['Items', formatMoney(subtotal)],
                ['Shipping', shippingLabel],
                ...(cfg.taxOn ? [['Tax', formatMoney(tax)] as [string, string]] : []),
                ['Order total', formatMoney(total)],
                ['Left on gift card', formatMoney(card - total)],
              ]}
            />
          </div>
          <button className="store-checkout" onClick={() => setStep('done')} autoFocus>
            Place your order
          </button>
        </section>
      )}

      {step === 'done' && delivery && (
        <section className="done">
          <h2>✓ Order placed. Thanks{settings.nickname ? `, ${settings.nickname}` : ''}!</h2>
          <p>{delivery.days === 0 ? 'It will be ready for pickup today.' : `It will arrive ${arrivalDate(delivery.days)}.`}</p>
          <Receipt
            store={store.name}
            orderNumber={orderNumber}
            lines={lines}
            rows={[
              { label: 'Items', cents: subtotal },
              { label: 'Shipping', cents: shipping },
              ...(cfg.taxOn ? [{ label: `Tax (${cfg.taxRate}%)`, cents: tax }] : []),
              { label: 'Order total', cents: total, strong: true },
              { label: 'Gift card', cents: card },
              { label: 'Left on card', cents: card - total, strong: true },
            ]}
            footer={store.footer}
          />
          <div className="button-row">
            <button className="primary" onClick={onShopAgain} autoFocus>
              Shop again
            </button>
            <a className="button" href="#/">
              Home
            </a>
          </div>
        </section>
      )}
    </div>
  );
}

function CartSummary({ lines }: { lines: { name: string; qty: number; price: Cents; emoji: string }[] }) {
  return (
    <ul className="order-list">
      {lines.map((l) => (
        <li key={l.name}>
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

function SkipTotal({ total, onNext }: { total: Cents; onNext: () => void }) {
  return (
    <section className="question">
      <p className="q-text">
        Shipping is free and there's no tax, so your order total is the same as your subtotal: <b>{formatMoney(total)}</b>.
      </p>
      <button className="primary next-btn" onClick={onNext} autoFocus>
        Next →
      </button>
    </section>
  );
}

function freeShippingHelps(subtotal: Cents, opt: DeliveryOption): [Help, Help, Help] {
  const over = opt.freeOver!;
  const free = subtotal >= over;
  const hint = `Compare your subtotal to ${formatMoney(over)}. If it's ${formatMoney(over)} or more, shipping is free.`;
  const more = `Look at the dollars first: ${Math.floor(subtotal / 100)} dollars and ${Math.floor(over / 100)} dollars. Which is bigger?`;
  const answer = free
    ? `${formatMoney(subtotal)} is ${subtotal === over ? 'exactly' : 'more than'} ${formatMoney(over)}, so shipping is FREE. The answer is Yes.`
    : `${formatMoney(subtotal)} is less than ${formatMoney(over)}, so you pay ${formatMoney(opt.price)} for shipping. The answer is No.`;
  return [
    { content: <p>{hint}</p>, say: hint },
    { content: <p>{more}</p>, say: more },
    { content: <p>{answer}</p>, say: answer },
  ];
}
