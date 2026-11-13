import { useState } from 'react';
import { TaskPage } from '../../hub/Drill';
import { makeScanGrid, scanResult, type ScanResult } from '../../lib/executive';
import { logChoice } from '../../lib/log';
import { useSettings } from '../../lib/settings';

const SETUPS = {
  1: { cols: 6, rows: 5, perHalf: 4, target: '★', distractors: ['●', '■', '▲'], name: 'star' },
  2: { cols: 8, rows: 6, perHalf: 6, target: 'E', distractors: ['F', 'H', 'L', 'T'], name: 'letter E' },
  3: { cols: 10, rows: 8, perHalf: 8, target: 'b', distractors: ['d', 'p', 'q', 'h'], name: 'letter b' },
} as const;

export default function FindThemAll() {
  const { settings } = useSettings();
  const setup = SETUPS[settings.executiveLevel];
  const deal = () => makeScanGrid(setup.cols, setup.rows, setup.target, [...setup.distractors], setup.perHalf);
  const [grid, setGrid] = useState(deal);
  const [tapped, setTapped] = useState<number[]>([]);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [result, setResult] = useState<(ScanResult & { seconds: number }) | null>(null);

  function tap(id: number) {
    if (result) return;
    if (startAt === null) setStartAt(Date.now());
    setTapped(tapped.includes(id) ? tapped.filter((x) => x !== id) : [...tapped, id]);
  }

  function done() {
    const r = scanResult(grid, tapped, setup.cols);
    const seconds = Math.round((Date.now() - (startAt ?? Date.now())) / 1000);
    setResult({ ...r, seconds });
    logChoice({
      nickname: settings.nickname,
      module: 'find-them-all',
      skill: 'scanning',
      level: `L${settings.executiveLevel} (${setup.cols}×${setup.rows})`,
      question: `Find every ${setup.name}`,
      answer: `Found ${r.found} of ${r.total}. Missed left ${r.missedLeft}, right ${r.missedRight}. Extra taps ${r.extra}.`,
      correct: r.found === r.total && r.extra === 0,
      seconds,
    });
  }

  function again() {
    setGrid(deal());
    setTapped([]);
    setStartAt(null);
    setResult(null);
  }

  return (
    <TaskPage id="find-them-all" wide intro={`Find and tap every ${setup.name}. Look carefully from left to right, row by row. Press Done when you have found them all.`}>
      <div className="scan-target">
        Find every: <span className="scan-symbol big">{setup.target}</span>
      </div>
      <div className="scan-grid" style={{ gridTemplateColumns: `repeat(${setup.cols}, 1fr)` }}>
        {grid.map((c) => {
          const on = tapped.includes(c.id);
          const missed = result && c.target && !on;
          const extra = result && !c.target && on;
          return (
            <button key={c.id} className={`scan-cell ${on ? 'on' : ''} ${missed ? 'missed' : ''} ${extra ? 'extra' : ''}`} onClick={() => tap(c.id)} aria-pressed={on} aria-label={c.symbol}>
              {c.symbol}
            </button>
          );
        })}
      </div>
      {!result ? (
        <div className="button-row">
          <button className="primary" onClick={done}>
            Done
          </button>
        </div>
      ) : (
        <div className="question">
          <p className={`feedback ${result.found === result.total && !result.extra ? 'good' : 'info'}`}>
            Found {result.found} of {result.total} in {result.seconds} seconds.
            {result.extra ? ` ${result.extra} extra ${result.extra === 1 ? 'tap' : 'taps'}.` : ''}
          </p>
          <table className="data-table scan-table">
            <thead>
              <tr>
                <th>Missed on the left</th>
                <th>Missed on the right</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{result.missedLeft}</td>
                <td>{result.missedRight}</td>
              </tr>
            </tbody>
          </table>
          <p className="muted small">Missed ones are circled in orange. Many more misses on one side can be a sign of neglect and is worth noting.</p>
          <button className="primary next-btn" onClick={again} autoFocus>
            New page →
          </button>
        </div>
      )}
    </TaskPage>
  );
}
