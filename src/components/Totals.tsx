/** Subtotal / tax / shipping rows, with "?" for the one he's working out. */
export function Totals({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="totals">
      {rows.map(([k, v]) => (
        <div key={k} className={v === '?' ? 'unknown' : ''}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
