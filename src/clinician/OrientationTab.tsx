import { useState } from 'react';
import {
  checksCSV, checksFor, deleteCheck, DOMAINS, domainStats, EMPTY_MARKS, getChecks, MARK_LABELS, MARK_SYMBOL, orientDetail, orientedCount, orientSummary,
  saveCheck, withCueCount, checkedCount, type OrientMark, type OrientMarks,
} from '../lib/orientation';
import { percent } from '../lib/log';
import { useSettings } from '../lib/settings';
import { download, today } from './download';

const MARKS: Exclude<OrientMark, null>[] = ['yes', 'cue', 'no'];

const when = (ms: number) =>
  new Date(ms).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** Orientation to person, place, time and situation for the current patient: a quick check and the history. */
export function OrientationTab() {
  const { settings, activeId } = useSettings();
  const [marks, setMarks] = useState<OrientMarks>(EMPTY_MARKS);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const [, refresh] = useState(0);
  const checks = checksFor(activeId);
  const newest = [...checks].reverse();
  const stats = domainStats(checks);
  const who = settings.nickname || 'this patient';
  const now = new Date();
  const todayText = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const partOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';

  const setMark = (d: keyof OrientMarks, m: OrientMark) => {
    setSaved(null);
    setMarks({ ...marks, [d]: marks[d] === m ? null : m });
  };

  function save() {
    const c = saveCheck(activeId, settings.nickname, marks, note);
    setSaved(`Saved for ${who}: ${orientSummary(c.marks)}`);
    setMarks(EMPTY_MARKS);
    setNote('');
  }

  return (
    <div className="orientation">
      <section>
        <h3>New orientation check{settings.nickname ? ` for ${settings.nickname}` : ''}</h3>
        <p className="muted">
          Ask, then mark each one. <b>Oriented</b> means they got it on their own. Tap a mark again to clear it. Leave a row blank if you
          didn’t check it.
        </p>
        <div className="orient-rows">
          {DOMAINS.map((d) => (
            <div key={d.id} className="orient-row">
              <div className="orient-label">
                <b>{d.label}</b>
                <span className="muted small">{d.ask.join(' · ')}</span>
                {d.id === 'time' && (
                  <span className="small orient-key">
                    Today is {todayText}, {partOfDay}.
                  </span>
                )}
              </div>
              <div className="mode-toggle orient-marks" role="group" aria-label={`Oriented to ${d.label.toLowerCase()}`}>
                {MARKS.map((m) => (
                  <button key={m} className={`mark-${m}`} aria-pressed={marks[d.id] === m} onClick={() => setMark(d.id, m)}>
                    {MARK_SYMBOL[m]} {MARK_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="orient-result" aria-live="polite">
          <span className="orient-x">Oriented ×{orientedCount(marks)}</span>
          {checkedCount(marks) > 0 && <span className="muted"> · {orientDetail(marks)}</span>}
        </p>
        <label className="orient-note">
          Note (optional, no names or identifying details)
          <input className="text-input" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Said 2019; corrected with the calendar" />
        </label>
        <div className="button-row">
          <button className="primary" disabled={checkedCount(marks) === 0} onClick={save}>
            Save check
          </button>
          {checkedCount(marks) > 0 && (
            <button className="button" onClick={() => setMarks(EMPTY_MARKS)}>
              Clear
            </button>
          )}
        </div>
        {saved && (
          <p className="feedback good" role="status">
            ✓ {saved}
          </p>
        )}
      </section>

      {checks.length > 0 && (
        <>
          <section>
            <h3>Latest</h3>
            <p className="orient-latest">
              <span className="orient-x">Oriented ×{orientedCount(newest[0].marks)}</span> <span className="muted">on {when(newest[0].at)}</span>
              <br />
              {orientDetail(newest[0].marks)}
            </p>
          </section>

          <section>
            <h3>Each area over time</h3>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Checks</th>
                    <th>Oriented</th>
                    <th>With cue</th>
                    <th>Not oriented</th>
                    <th>Last 10 (newest first)</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s) => (
                    <tr key={s.domain}>
                      <td>{DOMAINS.find((d) => d.id === s.domain)!.label}</td>
                      <td>{s.checked}</td>
                      <td>
                        {s.yes} ({percent(s.yes, s.checked)})
                      </td>
                      <td>{s.cue}</td>
                      <td>{s.no}</td>
                      <td className="orient-trend" aria-label={s.recent.map((m) => MARK_LABELS[m]).join(', ')}>
                        {s.recent.map((m, i) => (
                          <span key={i} className={`mark-dot mark-${m}`}>
                            {MARK_SYMBOL[m]}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted small">✓ oriented · ~ with a cue · ✗ not oriented</p>
          </section>

          <section>
            <h3>Every check</h3>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>When</th>
                    {DOMAINS.map((d) => (
                      <th key={d.id}>{d.label}</th>
                    ))}
                    <th>Oriented</th>
                    <th>Note</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {newest.map((c) => (
                    <tr key={c.id}>
                      <td>{when(c.at)}</td>
                      {DOMAINS.map((d) => {
                        const m = c.marks[d.id];
                        return (
                          <td key={d.id} className={m ? `mark-${m}` : 'muted'}>
                            {m ? `${MARK_SYMBOL[m]} ${MARK_LABELS[m]}` : '–'}
                          </td>
                        );
                      })}
                      <td>
                        <b>×{orientedCount(c.marks)}</b>
                        {withCueCount(c.marks) > orientedCount(c.marks) && <span className="muted small"> (×{withCueCount(c.marks)} with cues)</span>}
                      </td>
                      <td>{c.note}</td>
                      <td>
                        <button
                          className="button danger small-btn"
                          aria-label={`Delete the check from ${when(c.at)}`}
                          onClick={() => window.confirm(`Delete the orientation check from ${when(c.at)}? This can't be undone.`) && (deleteCheck(c.id), refresh((x) => x + 1))}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="button-row">
              <button className="button" onClick={() => download(`orientation-${settings.nickname || 'patient'}-${today()}.csv`, checksCSV(checks), 'text/csv')}>
                Export {settings.nickname || 'this patient'}’s checks (CSV)
              </button>
              <button className="button" onClick={() => download(`orientation-all-${today()}.csv`, checksCSV(getChecks()), 'text/csv')}>
                Every patient (CSV)
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
