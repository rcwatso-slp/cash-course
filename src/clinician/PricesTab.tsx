import { useState } from 'react';
import { RESTAURANTS } from '../data/restaurants';
import { STORES } from '../data/stores';
import { formatMoney, parseMoney } from '../lib/money';
import { editables, resetOverrides, setOverride, type Editable } from '../lib/overrides';

const PLACES = [...RESTAURANTS.map((r) => ({ id: r.id, name: r.name })), ...STORES.map((s) => ({ id: s.id, name: s.name }))];

/** Change prices and names to match your area. Saved on this device. */
export function PricesTab() {
  const [placeId, setPlaceId] = useState(PLACES[0].id);
  const [, refresh] = useState(0);
  const rows = editables(placeId);
  const changed = rows.filter((r) => r.price !== r.original.price || (r.nameEditable && r.name !== r.original.name)).length;

  return (
    <div className="prices">
      <p className="muted">
        Change prices (or names) so they match your area. Edits apply to the next new order and are saved on this device only, so make them on each
        device you use, or move them with the backup in the Data tab.
      </p>
      <div className="prices-head">
        <select aria-label="Restaurant or store" value={placeId} onChange={(e) => setPlaceId(e.target.value)}>
          <optgroup label="Restaurants">
            {RESTAURANTS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Stores">
            {STORES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </optgroup>
        </select>
        <span className="muted">{changed > 0 ? `${changed} changed` : 'No changes'}</span>
        {changed > 0 && (
          <button
            className="button"
            onClick={() => {
              resetOverrides(placeId);
              refresh((x) => x + 1);
            }}
          >
            Reset all for {PLACES.find((p) => p.id === placeId)?.name}
          </button>
        )}
      </div>
      <table className="data-table prices-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Size</th>
            <th>Price</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <PriceRow key={`${placeId}-${row.key}`} row={row} onChange={() => refresh((x) => x + 1)} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PriceRow({ row, onChange }: { row: Editable; onChange: () => void }) {
  const [name, setName] = useState(row.name);
  const [price, setPrice] = useState((row.price / 100).toFixed(2));
  const [error, setError] = useState(false);
  const isChanged = row.price !== row.original.price || (row.nameEditable && row.name !== row.original.name);

  const savePrice = () => {
    const r = parseMoney(price);
    if (!r.ok || r.cents <= 0) {
      setError(true);
      return;
    }
    setError(false);
    setOverride(row.key, { price: r.cents });
    setPrice((r.cents / 100).toFixed(2));
    onChange();
  };

  return (
    <tr className={isChanged ? 'row-changed' : ''}>
      <td>
        <span aria-hidden="true">{row.emoji}</span>{' '}
        {row.nameEditable ? (
          <input
            aria-label={`Name of ${row.original.name}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (name.trim()) setOverride(row.key, { name: name.trim() });
              onChange();
            }}
          />
        ) : (
          row.name
        )}
      </td>
      <td>{row.size ?? ''}</td>
      <td>
        <span className="price-input">
          $
          <input
            aria-label={`Price of ${row.original.name}${row.size ? `, ${row.size}` : ''}`}
            inputMode="decimal"
            value={price}
            aria-invalid={error}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={savePrice}
            onKeyDown={(e) => e.key === 'Enter' && savePrice()}
          />
        </span>
        {error && <span className="price-error">Use a price like 4.99</span>}
      </td>
      <td>
        {isChanged && (
          <button
            className="link-btn"
            onClick={() => {
              setOverride(row.key, { price: row.original.price, name: row.original.name });
              setName(row.original.name);
              setPrice((row.original.price / 100).toFixed(2));
              onChange();
            }}
          >
            Reset ({formatMoney(row.original.price)})
          </button>
        )}
      </td>
    </tr>
  );
}
