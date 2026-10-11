import { useState } from 'react';
import { markCalculatorUsed } from '../lib/speech';
import { useSettings } from '../lib/settings';

type Op = '+' | '−' | '×' | '÷';

const apply = (a: number, b: number, op: Op) =>
  op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : b === 0 ? NaN : a / b;

const show = (n: number) => (Number.isFinite(n) ? String(Number(n.toPrecision(12))) : 'Error');

/** Phone-style calculator, shown only when the clinician allows it. Use is recorded with each problem. */
export function Calculator() {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [fresh, setFresh] = useState(true);

  if (!settings.calculator) return null;

  const press = (fn: () => void) => () => {
    markCalculatorUsed();
    fn();
  };

  const digit = (d: string) => {
    if (fresh || display === 'Error') {
      setDisplay(d === '.' ? '0.' : d);
      setFresh(false);
    } else if (!(d === '.' && display.includes('.'))) {
      setDisplay(display === '0' && d !== '.' ? d : display + d);
    }
  };

  const operator = (next: Op) => {
    const value = Number(display);
    if (acc !== null && op && !fresh) {
      const result = apply(acc, value, op);
      setDisplay(show(result));
      setAcc(result);
    } else {
      setAcc(value);
    }
    setOp(next);
    setFresh(true);
  };

  const equals = () => {
    if (acc === null || !op) return;
    setDisplay(show(apply(acc, Number(display), op)));
    setAcc(null);
    setOp(null);
    setFresh(true);
  };

  const clear = () => {
    setDisplay('0');
    setAcc(null);
    setOp(null);
    setFresh(true);
  };

  const keys: (string | Op)[] = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '=', '+'];

  return (
    <div className="calc-wrap">
      {open && (
        <div className="calc" role="dialog" aria-label="Calculator">
          <div className="calc-display" aria-live="polite">
            {display}
          </div>
          <div className="calc-keys">
            <button className="calc-clear" onClick={press(clear)}>
              AC
            </button>
            {keys.map((k) => {
              const isOp = ['+', '−', '×', '÷'].includes(k);
              const onClick = k === '=' ? equals : isOp ? () => operator(k as Op) : () => digit(k);
              return (
                <button key={k} className={isOp || k === '=' ? 'calc-op' : ''} aria-pressed={isOp && op === k && fresh} onClick={press(onClick)}>
                  {k}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <button className="calc-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Hide calculator' : 'Calculator'}>
        🧮 <span className="calc-label">{open ? 'Hide calculator' : 'Calculator'}</span>
      </button>
    </div>
  );
}
