import { useState, type FormEvent } from 'react';
import type { Store as StoreData } from '../../data/types';
import { formatMoney } from '../../lib/money';
import {
  addToCart, cartCount, checkList, findProduct, makeShoppingList, search, setQty, shopPrice, type CartLine,
} from '../../lib/shop';
import { levelPrice, type PriceLevel } from '../../lib/problems';
import { randInt } from '../../lib/random';
import { useSettings } from '../../lib/settings';
import { StepBar } from '../../components/StepBar';
import { CHECKOUT_STEPS, Checkout } from './Checkout';
import { PriceTag, ProductCard, ShoppingList, Stars } from './StoreParts';

type View =
  | { name: 'browse'; category: string | null; query: string }
  | { name: 'product'; id: string }
  | { name: 'cart' }
  | { name: 'checkout' };

export default function Store({ store }: { store: StoreData }) {
  const [round, setRound] = useState(0);
  return <StoreSession key={`${store.id}-${round}`} store={store} onShopAgain={() => setRound((r) => r + 1)} />;
}

function StoreSession({ store, onShopAgain }: { store: StoreData; onShopAgain: () => void }) {
  const { settings } = useSettings();
  const [cfg] = useState(() => ({
    level: settings.priceLevel as PriceLevel,
    needs: settings.orderMode === 'task' ? makeShoppingList(store, settings.priceLevel) : null,
    orderNumber: randInt(100000, 999999),
  }));
  const [view, setView] = useState<View>({ name: 'browse', category: null, query: '' });
  const [cart, setCart] = useState<CartLine[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const price = (id: string) => shopPrice(findProduct(store, id), cfg.level);
  const wasPrice = (id: string) => {
    const p = findProduct(store, id);
    return p.wasPrice ? levelPrice(p.wasPrice, cfg.level) : undefined;
  };
  const go = (v: View) => {
    setView(v);
    setNotice(null);
    window.scrollTo(0, 0);
  };
  const add = (id: string, qty = 1) => {
    setCart((c) => addToCart(c, id, qty));
    setNotice(`Added to ${store.cartName.toLowerCase()}: ${qty > 1 ? `${qty} × ` : ''}${findProduct(store, id).name}`);
  };

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    go({ name: 'browse', category: null, query: searchText.trim() });
  };

  const proceed = () => {
    if (cfg.needs) {
      const result = checkList(store, cart, cfg.needs, cfg.level);
      if (!result.ok) {
        setNotice(result.message);
        return;
      }
    }
    go({ name: 'checkout' });
  };

  const count = cartCount(cart);
  const inCheckout = view.name === 'checkout';

  return (
    <div className={`store skin-${store.skin}`}>
      <header className="store-header">
        <button className="store-logo" onClick={() => go({ name: 'browse', category: null, query: '' })} disabled={inCheckout}>
          <span aria-hidden="true">{store.logo}</span> {store.name}
        </button>
        {!inCheckout && (
          <form className="store-search" onSubmit={submitSearch} role="search">
            <input
              aria-label={store.searchPlaceholder}
              placeholder={store.searchPlaceholder}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              🔍
            </button>
          </form>
        )}
        {!inCheckout && (
          <button className="store-cart-btn" onClick={() => go({ name: 'cart' })}>
            🛒 <span className="store-cart-count">{count}</span>
            <span className="store-cart-label">{store.cartName}</span>
          </button>
        )}
      </header>

      {!inCheckout && (
        <nav className="store-nav" aria-label="Departments">
          {store.categories.map((c) => (
            <button
              key={c.id}
              aria-pressed={view.name === 'browse' && view.category === c.id}
              onClick={() => {
                setSearchText('');
                go({ name: 'browse', category: c.id, query: '' });
              }}
            >
              {c.label}
            </button>
          ))}
        </nav>
      )}

      <div className="store-body">
        {view.name === 'cart' && <StepBar steps={CHECKOUT_STEPS} current={0} />}

        {cfg.needs && !inCheckout && <ShoppingList store={store} needs={cfg.needs} cart={cart} />}

        {notice && (
          <div className="notice" role="status">
            {notice}
            {view.name !== 'cart' && notice.startsWith('Added') && (
              <button className="link-btn" onClick={() => go({ name: 'cart' })}>
                Go to {store.cartName.toLowerCase()} →
              </button>
            )}
          </div>
        )}

        {view.name === 'browse' && (
          <Browse
            store={store}
            view={view}
            price={price}
            wasPrice={wasPrice}
            onOpen={(id) => go({ name: 'product', id })}
            onAdd={(id) => add(id)}
            onCategory={(id) => go({ name: 'browse', category: id, query: '' })}
          />
        )}

        {view.name === 'product' && (
          <ProductPage
            store={store}
            id={view.id}
            price={price(view.id)}
            wasPrice={wasPrice(view.id)}
            onAdd={(qty) => add(view.id, qty)}
            onBack={() => go({ name: 'browse', category: findProduct(store, view.id).category, query: '' })}
          />
        )}

        {view.name === 'cart' && (
          <section className="store-cart">
            <h1>Your {store.cartName.toLowerCase()}</h1>
            {cart.length === 0 ? (
              <p className="muted">Your {store.cartName.toLowerCase()} is empty. Search or pick a department to find things.</p>
            ) : (
              <ul className="cart-page-lines">
                {cart.map((l) => {
                  const p = findProduct(store, l.productId);
                  return (
                    <li key={l.productId}>
                      <span className="cart-page-img" aria-hidden="true">
                        {p.emoji}
                      </span>
                      <div className="cart-page-info">
                        <button className="link-btn cart-page-name" onClick={() => go({ name: 'product', id: p.id })}>
                          {p.name}
                        </button>
                        <PriceTag store={store} price={price(p.id)} />
                        <div className="qty-stepper" aria-label={`Quantity of ${p.name}`}>
                          <button aria-label="One less" onClick={() => setCart((c) => setQty(c, p.id, l.qty - 1))}>
                            −
                          </button>
                          <span aria-live="polite">{l.qty}</span>
                          <button aria-label="One more" onClick={() => setCart((c) => setQty(c, p.id, Math.min(10, l.qty + 1)))}>
                            +
                          </button>
                          <button className="link-btn" onClick={() => setCart((c) => setQty(c, p.id, 0))}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {cart.length > 0 && (
              <div className="cart-page-footer">
                <p>
                  {count} {count === 1 ? 'item' : 'items'}.{' '}
                  {settings.showRunningTotal
                    ? `Subtotal: ${formatMoney(cart.reduce((t, l) => t + price(l.productId) * l.qty, 0))}`
                    : "You'll work out the subtotal at checkout."}
                </p>
                <button className="store-checkout" onClick={proceed}>
                  Proceed to checkout
                </button>
              </div>
            )}
            <button className="link-btn" onClick={() => go({ name: 'browse', category: null, query: '' })}>
              ← Keep shopping
            </button>
          </section>
        )}

        {inCheckout && (
          <Checkout
            store={store}
            cart={cart}
            level={cfg.level}
            orderNumber={cfg.orderNumber}
            onBackToCart={() => go({ name: 'cart' })}
            onShopAgain={onShopAgain}
          />
        )}
      </div>
    </div>
  );
}

function Browse({
  store, view, price, wasPrice, onOpen, onAdd, onCategory,
}: {
  store: StoreData;
  view: { category: string | null; query: string };
  price: (id: string) => number;
  wasPrice: (id: string) => number | undefined;
  onOpen: (id: string) => void;
  onAdd: (id: string) => void;
  onCategory: (id: string) => void;
}) {
  const grid = (products: StoreData['products']) => (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} store={store} product={p} price={price(p.id)} wasPrice={wasPrice(p.id)} onOpen={() => onOpen(p.id)} onAdd={() => onAdd(p.id)} />
      ))}
    </div>
  );

  if (view.query) {
    const results = search(store, view.query);
    return (
      <section>
        <h1 className="browse-title">
          {results.length} {results.length === 1 ? 'result' : 'results'} for “{view.query}”
        </h1>
        {results.length === 0 ? <p className="muted">Try a different word, or pick a department above.</p> : grid(results)}
      </section>
    );
  }

  if (view.category) {
    const label = store.categories.find((c) => c.id === view.category)?.label;
    return (
      <section>
        <h1 className="browse-title">{label}</h1>
        {grid(store.products.filter((p) => p.category === view.category))}
      </section>
    );
  }

  const deals = store.products.filter((p) => p.wasPrice);
  return (
    <section>
      <div className="store-hero">
        <h1>{store.tagline}</h1>
        <p>{store.blurb}</p>
      </div>
      <h2 className="browse-title">Shop by department</h2>
      <div className="dept-tiles">
        {store.categories.map((c) => (
          <button key={c.id} className="dept-tile" onClick={() => onCategory(c.id)}>
            <span aria-hidden="true">{store.products.find((p) => p.category === c.id)?.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>
      {deals.length > 0 && (
        <>
          <h2 className="browse-title">{store.skin === 'falmart' ? 'Fallback deals' : store.skin === 'amazoom' ? "Today's deals" : 'On sale'}</h2>
          {grid(deals)}
        </>
      )}
    </section>
  );
}

function ProductPage({
  store, id, price, wasPrice, onAdd, onBack,
}: {
  store: StoreData;
  id: string;
  price: number;
  wasPrice?: number;
  onAdd: (qty: number) => void;
  onBack: () => void;
}) {
  const p = findProduct(store, id);
  const [qty, setQtyState] = useState(1);
  const freeShip = store.delivery.find((d) => d.freeOver !== undefined);
  return (
    <section className="product-page">
      <button className="link-btn" onClick={onBack}>
        ← Back to {store.categories.find((c) => c.id === p.category)?.label}
      </button>
      <div className="product-page-grid">
        <div className="product-page-img" aria-hidden="true">
          {p.emoji}
        </div>
        <div className="product-page-info">
          <p className="product-brand">{p.brand}</p>
          <h1>{p.name}</h1>
          <Stars rating={p.rating} reviews={p.reviews} />
          <div className="product-page-price">
            <PriceTag store={store} price={price} wasPrice={wasPrice} size="big" />
          </div>
          {freeShip && <p className="product-ship">FREE shipping on orders {formatMoney(freeShip.freeOver!)} and up</p>}
          {(p.pieces || p.ages) && (
            <p className="product-specs">
              {p.pieces && <span>🧱 {p.pieces.toLocaleString('en-US')} pieces</span>}
              {p.ages && <span>Ages {p.ages}</span>}
            </p>
          )}
          <h2 className="product-about-title">About this item</h2>
          <ul className="product-about">
            {p.about.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="product-buy">
          <PriceTag store={store} price={price} />
          <label className="qty-select">
            Quantity
            <select value={qty} onChange={(e) => setQtyState(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button className="store-add" onClick={() => onAdd(qty)}>
            {store.addButton}
          </button>
        </div>
      </div>
    </section>
  );
}
