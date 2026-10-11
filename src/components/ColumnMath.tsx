import { plainDigits, regroup, type Cents } from '../lib/money';

interface Props {
  op: '+' | '−';
  rows: Cents[];
  /** For subtraction: cross out digits and show the borrowed value above. */
  showRegroup?: boolean;
}

/** Numbers lined up on the decimal point, the way you'd write them on paper. */
export function ColumnMath({ op, rows, showRegroup = false }: Props) {
  const strs = rows.map(plainDigits);
  const width = Math.max(...strs.map((s) => s.length));
  const padded = strs.map((s) => s.padStart(width, ' '));

  // Regrouping marks for the top row (subtraction of two numbers only).
  let topMarks: (number | null)[] = Array(width).fill(null);
  if (showRegroup && op === '−' && padded.length === 2) {
    const positions = [...padded[0]].map((ch, i) => (ch === '.' ? -1 : i)).filter((i) => i >= 0);
    const toDigit = (ch: string) => (ch === ' ' ? 0 : Number(ch));
    const top = positions.map((i) => toDigit(padded[0][i]));
    const bottom = positions.map((i) => toDigit(padded[1][i]));
    const after = regroup(top, bottom);
    topMarks = Array(width).fill(null);
    positions.forEach((pos, k) => {
      if (after[k] !== top[k]) topMarks[pos] = after[k];
    });
  }

  const label = `${padded.map((s) => s.trim()).join(` ${op === '+' ? 'plus' : 'minus'} `)}`;

  return (
    <div className="colmath" role="img" aria-label={label} style={{ gridTemplateColumns: `1.4em 0.8em repeat(${width}, 0.85em)` }}>
      {padded.map((s, r) => (
        <Row key={r} op={r === padded.length - 1 ? op : ''} chars={s} marks={r === 0 ? topMarks : null} />
      ))}
      <div className="colmath-line" />
      <span className="colmath-op" />
      <span>$</span>
      <span className="colmath-answer" style={{ gridColumn: `span ${width}` }}>
        ?
      </span>
    </div>
  );
}

function Row({ op, chars, marks }: { op: string; chars: string; marks: (number | null)[] | null }) {
  return (
    <>
      <span className="colmath-op">{op}</span>
      <span>$</span>
      {[...chars].map((ch, i) => {
        const mark = marks?.[i];
        if (mark !== null && mark !== undefined) {
          return (
            <span key={i} className="colmath-digit regrouped">
              <span className="regroup-new">{mark}</span>
              <s>{ch === ' ' ? '0' : ch}</s>
            </span>
          );
        }
        return (
          <span key={i} className="colmath-digit">
            {ch === ' ' ? '' : ch}
          </span>
        );
      })}
    </>
  );
}
