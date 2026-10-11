import { useEffect, useState } from 'react';
import type { MenuItem, Size } from '../../data/types';
import { formatMoney, type Cents } from '../../lib/money';
import { defaultChosen, type Chosen } from '../../lib/order';

interface Props {
  item: MenuItem;
  price: (c: Cents) => Cents;
  onAdd: (size: Size | undefined, chosen: Chosen) => void;
  onClose: () => void;
}

/**
 * Size-only items: tap a size and it's added (fast, like fries).
 * Build-your-own items: pick a size/protein, then options, then "Add to order".
 * The item's total is never shown, so he still has to add it up.
 */
export function ItemPicker({ item, price, onAdd, onClose }: Props) {
  const [size, setSize] = useState<Size | undefined>(item.sizes?.[0]);
  const [chosen, setChosen] = useState<Chosen>(() => defaultChosen(item));
  const builder = (item.options?.length ?? 0) > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggle = (group: string, label: string, one: boolean) =>
    setChosen((prev) => {
      const current = prev[group] ?? [];
      if (one) return { ...prev, [group]: [label] };
      return { ...prev, [group]: current.includes(label) ? current.filter((l) => l !== label) : [...current, label] };
    });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal${builder ? ' modal-builder' : ''}`} role="dialog" aria-modal="true" aria-labelledby="picker-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="picker-title">
          {item.emoji} {item.name}
        </h2>

        {item.sizes && (
          <>
            <p className="picker-step">{item.sizePrompt ?? 'Pick a size'}.</p>
            <div className={`size-options${item.sizes.length > 3 ? ' size-options-many' : ''}`}>
              {item.sizes.map((s, i) => (
                <button
                  key={s.label}
                  className="size-btn"
                  aria-pressed={builder ? size?.label === s.label : undefined}
                  onClick={() => (builder ? setSize(s) : onAdd(s, chosen))}
                  autoFocus={!builder && i === Math.min(1, item.sizes!.length - 1)}
                >
                  {item.sizes!.length <= 3 && !item.sizePrompt && (
                    <span className={`size-icon size-${i}`} aria-hidden="true">
                      {item.emoji}
                    </span>
                  )}
                  <span>{s.label}</span>
                  <b>{formatMoney(price(s.price))}</b>
                </button>
              ))}
            </div>
          </>
        )}

        {builder &&
          item.options!.map((g) => (
            <fieldset key={g.label} className="option-group">
              <legend>
                {g.label}
                <span className="muted"> · {g.pick === 'one' ? 'pick one' : 'pick any'}</span>
              </legend>
              <div className="option-choices">
                {g.choices.map((c) => {
                  const on = (chosen[g.label] ?? []).includes(c.label);
                  return (
                    <label key={c.label} className={`option-choice${on ? ' on' : ''}`}>
                      <input
                        type={g.pick === 'one' ? 'radio' : 'checkbox'}
                        name={g.label}
                        checked={on}
                        onChange={() => toggle(g.label, c.label, g.pick === 'one')}
                      />
                      <span>{c.label}</span>
                      {c.price > 0 && <b className="option-price">+{formatMoney(price(c.price))}</b>}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}

        <div className="button-row">
          {builder && (
            <button className="primary" onClick={() => onAdd(size, chosen)}>
              Add to order
            </button>
          )}
          <button className="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
