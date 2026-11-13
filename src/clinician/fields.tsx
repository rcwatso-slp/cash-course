import type { ReactNode } from 'react';

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="field">
      <div className="field-label">
        <span>{label}</span>
        {hint && <span className="field-hint">{hint}</span>}
      </div>
      <div className="field-control">{children}</div>
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" aria-label={label} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{checked ? 'On' : 'Off'}</span>
    </label>
  );
}

export function Select<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <select
      aria-label={label}
      value={String(value)}
      onChange={(e) => {
        const found = options.find(([v]) => String(v) === e.target.value);
        if (found) onChange(found[0]);
      }}
    >
      {options.map(([v, text]) => (
        <option key={String(v)} value={String(v)}>
          {text}
        </option>
      ))}
    </select>
  );
}
