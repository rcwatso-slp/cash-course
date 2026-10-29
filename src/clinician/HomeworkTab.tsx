import { useState } from 'react';
import { RESTAURANTS } from '../data/restaurants';
import { readJSON, writeJSON } from '../lib/storage';
import { WORKSHEET_TYPES, type WorksheetOptions, type WorksheetType } from '../lib/worksheets';
import { DEFAULT_WORKSHEET, WORKSHEET_KEY } from '../modules/WorksheetPage';

/** Pick a worksheet, then open it full-page to print. */
export function HomeworkTab({ onClose }: { onClose: () => void }) {
  const [opts, setOpts] = useState<WorksheetOptions>(() => ({ ...DEFAULT_WORKSHEET, ...readJSON<Partial<WorksheetOptions>>(WORKSHEET_KEY, {}) }));
  const set = (patch: Partial<WorksheetOptions>) => setOpts((o) => ({ ...o, ...patch }));

  return (
    <div className="settings">
      <section>
        <h3>Printable homework</h3>
        <p className="muted">
          Worksheets use the same difficulty as the app (price difficulty and change level in Settings). Each one prints with an answer key on its own page.
        </p>
        <div className="field">
          <div className="field-label">
            <span>Worksheet</span>
          </div>
          <div className="field-control">
            <select aria-label="Worksheet type" value={opts.type} onChange={(e) => set({ type: e.target.value as WorksheetType })}>
              {(Object.keys(WORKSHEET_TYPES) as WorksheetType[]).map((t) => (
                <option key={t} value={t}>
                  {WORKSHEET_TYPES[t]}
                </option>
              ))}
            </select>
          </div>
        </div>
        {opts.type === 'menu' && (
          <div className="field">
            <div className="field-label">
              <span>Restaurant</span>
            </div>
            <div className="field-control">
              <select aria-label="Restaurant" value={opts.restaurantId} onChange={(e) => set({ restaurantId: e.target.value })}>
                {RESTAURANTS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div className="field">
          <div className="field-label">
            <span>Number of problems</span>
          </div>
          <div className="field-control">
            <select aria-label="Number of problems" value={opts.count} onChange={(e) => set({ count: Number(e.target.value) })}>
              {[5, 8, 10, 15].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <div className="field-label">
            <span>Answer key</span>
          </div>
          <div className="field-control">
            <label className="toggle">
              <input type="checkbox" aria-label="Answer key" checked={opts.answerKey} onChange={(e) => set({ answerKey: e.target.checked })} />
              <span>{opts.answerKey ? 'On (prints on a separate page)' : 'Off'}</span>
            </label>
          </div>
        </div>
        <div className="button-row">
          <button
            className="primary"
            onClick={() => {
              writeJSON(WORKSHEET_KEY, opts);
              onClose();
              window.location.hash = '#/worksheet';
            }}
          >
            Make worksheet
          </button>
        </div>
      </section>
    </div>
  );
}
