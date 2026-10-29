import type { Product, Store } from '../../data/types';
import { formatMoney, type Cents } from '../../lib/money';
import { haveCount, needText, type CartLine, type Need } from '../../lib/shop';
import { ReadAloud } from '../../components/ReadAloud';

export function Stars({ rating, reviews }: { rating: number; reviews: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars, ${reviews.toLocaleString('en-US')} reviews`}>
      <span className="stars-icons" aria-hidden="true">
        {'★'.repeat(full)}
        {half && <span className="star-half">★</span>}
        <span className="star-empty">{'★'.repeat(5 - full - (half ? 1 : 0))}</span>
      </span>
      <span className="stars-count">{reviews.toLocaleString('en-US')}</span>
    </span>
  );
}

/** Each store shows prices its own way, like the real sites. */
export function PriceTag({ store, price, wasPrice, size = 'normal' }: { store: Store; price: Cents; wasPrice?: Cents; size?: 'normal' | 'big' }) {
  const dollars = Math.floor(price / 100).toLocaleString('en-US');
  const cents = String(price % 100).padStart(2, '0');
  if (store.skin === 'amazoom') {
    return (
      <span className={`price price-az price-${size}`} aria-label={formatMoney(price)}>
        <span className="price-az-main" aria-hidden="true">
          <sup>$</sup>
          {dollars}
          <sup>{cents}</sup>
        </span>
        {wasPrice && (
          <span className="price-was" aria-hidden="true">
            List: <s>{formatMoney(wasPrice)}</s>
          </span>
        )}
      </span>
    );
  }
  return (
    <span className={`price price-${store.skin} price-${size}`}>
      {wasPrice && store.skin === 'falmart' && <span className="badge-sale">Fallback</span>}
      {wasPrice && (store.skin === 'leggo' || store.skin === 'bassbro') && <span className="badge-sale">Sale</span>}
      <span className="price-main">
        {wasPrice && store.skin === 'falmart' ? 'Now ' : ''}
        {formatMoney(price)}
      </span>
      {wasPrice && (
        <span className="price-was">
          <s>{formatMoney(wasPrice)}</s>
        </span>
      )}
    </span>
  );
}

export function ProductCard({
  store, product, price, wasPrice, onOpen, onAdd,
}: {
  store: Store;
  product: Product;
  price: Cents;
  wasPrice?: Cents;
  onOpen: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="product-card">
      <button className="product-open" onClick={onOpen} aria-label={`${product.name}, ${formatMoney(price)}`}>
        <span className="product-img" aria-hidden="true">
          {product.emoji}
        </span>
        <PriceTag store={store} price={price} wasPrice={wasPrice} />
        <span className="product-name">{product.name}</span>
        <Stars rating={product.rating} reviews={product.reviews} />
      </button>
      <button className="store-add store-add-small" onClick={onAdd}>
        {store.skin === 'falmart' ? '+ Add' : store.addButton}
      </button>
    </div>
  );
}

export function ShoppingList({ store, needs, cart }: { store: Store; needs: Need[]; cart: CartLine[] }) {
  return (
    <div className="task-card shopping-list">
      <div className="task-card-head">
        <h2>🗒️ Shopping list</h2>
        <ReadAloud text={`Your shopping list: ${needs.map(needText).join(', ')}.`} />
      </div>
      <ul>
        {needs.map((n) => {
          const have = haveCount(store, cart, n) >= n.qty;
          return (
            <li key={n.tag} className={have ? 'have' : ''}>
              <span aria-hidden="true">{have ? '✓' : '○'}</span> {needText(n)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
