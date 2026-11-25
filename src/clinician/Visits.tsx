import { useState, type FormEvent } from 'react';
import { startNewSession } from '../lib/log';
import { useSettings } from '../lib/settings';
import { useNow } from '../lib/timers';
import {
  addVisit, clockTime, dateAt, dayKey, dayTotals, deleteVisit, getVisits, minutesText, runningVisit, startVisit, stopVisit,
  timeInputValue, atTime, updateVisit, visitMinutes, visitsCSV, visitsOn, type Visit,
} from '../lib/visits';
import { download } from './download';

/** Start a visit for a patient. It also starts the practice numbers over, so "This visit" shows only this visit. */
export function beginVisit(profileId: string, nickname: string): void {
  startVisit(profileId, nickname);
  startNewSession();
}

/** Start/stop timer for the current patient, at the top of the "This visit" tab. */
export function VisitTimer({ onAllVisits }: { onAllVisits: () => void }) {
  const { settings, activeId } = useSettings();
  const [, refresh] = useState(0);
  const running = runningVisit(activeId);
  const now = useNow(!!running, 10000);
  const today = visitsOn(dayKey(Date.now())).filter((v) => v.profileId === activeId);
  const last = [...today].reverse().find((v) => v.end !== null);
  const todayMinutes = dayTotals(today, now).total;
  const who = settings.nickname || 'this patient';

  return (
    <section className={`visit-timer ${running ? 'running' : ''}`} aria-label="Visit timer">
      {running ? (
        <>
          <div>
            <p className="visit-big">
              ⏱ <b>{minutesText(visitMinutes(running, now))}</b> so far
            </p>
            <p>
              Visit with {who} started at{' '}
              <TimeEdit value={running.start} label="Start time" onChange={(t) => (updateVisit(running.id, { start: Math.min(t, Date.now()) }), refresh((x) => x + 1))} />
            </p>
          </div>
          <button className="primary" onClick={() => (stopVisit(activeId), refresh((x) => x + 1))}>
            Stop visit
          </button>
        </>
      ) : (
        <>
          <div>
            {last ? (
              <p>
                Last visit with {who}: <b>{clockTime(last.start)} – {clockTime(last.end!)}</b>, <b>{minutesText(visitMinutes(last))}</b>.
              </p>
            ) : (
              <p>No visit timed for {who} yet today.</p>
            )}
            {today.length > 1 && <p className="muted">Today in all: {minutesText(todayMinutes)} over {today.length} visits.</p>}
          </div>
          <button className="primary" onClick={() => (beginVisit(activeId, settings.nickname), refresh((x) => x + 1))}>
            Start visit
          </button>
        </>
      )}
      <button className="link-button" onClick={onAllVisits}>
        All visits today →
      </button>
    </section>
  );
}

/** A clock time that becomes a time input when tapped. */
function TimeEdit({ value, label, onChange }: { value: number; label: string; onChange: (ms: number) => void }) {
  const [editing, setEditing] = useState(false);
  if (!editing)
    return (
      <button className="link-button time-edit" onClick={() => setEditing(true)} aria-label={`${label}: ${clockTime(value)}. Change`}>
        <b>{clockTime(value)}</b> ✎
      </button>
    );
  return (
    <input
      type="time"
      aria-label={label}
      autoFocus
      defaultValue={timeInputValue(value)}
      onBlur={(e) => {
        const t = atTime(value, e.target.value);
        if (t !== null) onChange(t);
        setEditing(false);
      }}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
    />
  );
}

/** Small status for the patient list: running time or minutes today. */
export function useVisitStatus() {
  const visits = getVisits();
  const anyRunning = visits.some((v) => v.end === null);
  const now = useNow(anyRunning, 10000);
  const today = visitsOn(dayKey(now), visits);
  return {
    running: (profileId: string) => runningVisit(profileId, visits),
    minutesToday: (profileId: string) => dayTotals(today.filter((v) => v.profileId === profileId), now).total,
    now,
  };
}

/** Every visit on one day, for all patients, with times you can fix and a total. */
export function VisitsTab() {
  const { patients, settings } = useSettings();
  const [day, setDay] = useState(() => dayKey(Date.now()));
  const [, refresh] = useState(0);
  const all = getVisits();
  const anyRunning = all.some((v) => v.end === null);
  const now = useNow(anyRunning, 10000);
  const visits = visitsOn(day, all);
  const totals = dayTotals(visits, now);
  const isToday = day === dayKey(Date.now());
  const dayName = new Date(dateAt(day, '12:00') ?? Date.now()).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const nameFor = (profileId: string, saved: string) => {
    const p = patients.find((x) => x.id === profileId);
    return p ? p.nickname || '(no nickname)' : saved ? `${saved} (removed)` : '(removed patient)';
  };
  const nameOf = (v: Visit) => nameFor(v.profileId, v.nickname);
  const changed = () => refresh((x) => x + 1);

  return (
    <div className="visits">
      <div className="session-head">
        <div>
          <h3>Visits on {isToday ? `today, ${dayName}` : dayName}</h3>
          <p className="muted">Minutes are counted between the clock times shown (10:02 to 10:39 is 37 minutes). Tap a time to fix it.</p>
        </div>
        <label className="date-pick">
          Day{' '}
          <input type="date" value={day} max={dayKey(Date.now())} onChange={(e) => e.target.value && setDay(e.target.value)} />
        </label>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-value">{totals.total}</span>
          <span className="summary-label">Minutes in all</span>
        </div>
        <div className="summary-card">
          <span className="summary-value">{totals.byPatient.length}</span>
          <span className="summary-label">Patients seen</span>
        </div>
        <div className="summary-card">
          <span className="summary-value">{visits.length}</span>
          <span className="summary-label">Visits</span>
        </div>
      </div>

      {visits.length === 0 ? (
        <p className="muted">No visits on this day.</p>
      ) : (
        <>
          <h3>Minutes per patient</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Visits</th>
                <th>Minutes</th>
              </tr>
            </thead>
            <tbody>
              {totals.byPatient.map((r) => (
                <tr key={r.profileId}>
                  <td>{nameFor(r.profileId, r.nickname)}</td>
                  <td>{r.visits}</td>
                  <td>
                    <b>{r.minutes}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Every visit</h3>
          <div className="table-scroll">
            <table className="data-table visit-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Start</th>
                  <th>Stop</th>
                  <th>Minutes</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id} className={v.end === null ? 'row-running' : ''}>
                    <td>{nameOf(v)}</td>
                    <td>
                      <TimeEdit value={v.start} label={`Start time for ${nameOf(v)}`} onChange={(t) => (updateVisit(v.id, { start: v.end ? Math.min(t, v.end) : Math.min(t, Date.now()) }), changed())} />
                    </td>
                    <td>
                      {v.end === null ? (
                        <button className="button" onClick={() => (stopVisit(v.profileId), changed())}>
                          Stop now
                        </button>
                      ) : (
                        <TimeEdit value={v.end} label={`Stop time for ${nameOf(v)}`} onChange={(t) => (updateVisit(v.id, { end: Math.max(t, v.start) }), changed())} />
                      )}
                    </td>
                    <td>
                      <b>{visitMinutes(v, now)}</b>
                      {v.end === null && <span className="muted small"> so far</span>}
                    </td>
                    <td>
                      <button
                        className="button danger small-btn"
                        aria-label={`Delete visit for ${nameOf(v)} at ${clockTime(v.start)}`}
                        onClick={() => window.confirm(`Delete the ${clockTime(v.start)} visit for ${nameOf(v)}? This can't be undone.`) && (deleteVisit(v.id), changed())}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <AddVisit day={day} defaultPatient={patients.find((p) => p.nickname === settings.nickname)?.id ?? patients[0]?.id} onAdded={changed} />

      <h3>Export</h3>
      <div className="button-row">
        <button className="button" disabled={visits.length === 0} onClick={() => download(`visits-${day}.csv`, visitsCSV(visits, now), 'text/csv')}>
          This day (CSV)
        </button>
        <button className="button" disabled={all.length === 0} onClick={() => download(`visits-all-${dayKey(Date.now())}.csv`, visitsCSV(all, now), 'text/csv')}>
          Every visit (CSV)
        </button>
      </div>
    </div>
  );
}

/** For a visit you forgot to time. */
function AddVisit({ day, defaultPatient, onAdded }: { day: string; defaultPatient?: string; onAdded: () => void }) {
  const { patients } = useSettings();
  const [open, setOpen] = useState(false);
  const [who, setWho] = useState(defaultPatient ?? '');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!open)
    return (
      <p>
        <button className="button" onClick={() => setOpen(true)}>
          + Add a visit by hand
        </button>
      </p>
    );

  function submit(e: FormEvent) {
    e.preventDefault();
    const start = dateAt(day, from);
    const end = dateAt(day, to);
    const p = patients.find((x) => x.id === who);
    if (!p) return setError('Pick a patient.');
    if (start === null || end === null) return setError('Fill in both times.');
    if (end <= start) return setError('The stop time has to be after the start time.');
    if (end > Date.now()) return setError('That stop time hasn’t happened yet.');
    addVisit(p.id, p.nickname, start, end);
    setOpen(false);
    setFrom('');
    setTo('');
    setError(null);
    onAdded();
  }

  return (
    <form className="add-visit" onSubmit={submit}>
      <h3>Add a visit by hand</h3>
      <label>
        Patient
        <select value={who} onChange={(e) => setWho(e.target.value)}>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nickname || '(no nickname)'}
            </option>
          ))}
        </select>
      </label>
      <label>
        Start
        <input type="time" value={from} onChange={(e) => setFrom(e.target.value)} />
      </label>
      <label>
        Stop
        <input type="time" value={to} onChange={(e) => setTo(e.target.value)} />
      </label>
      {error && <p className="feedback bad">{error}</p>}
      <div className="button-row">
        <button className="primary" type="submit">
          Add visit
        </button>
        <button className="button" type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/** Shown at the bottom of the patient screens while a visit is running. */
export function FooterVisit() {
  const { activeId } = useSettings();
  const running = runningVisit(activeId);
  const now = useNow(!!running, 15000);
  if (!running) return null;
  return (
    <span className="footer-visit" title={`Visit started at ${clockTime(running.start)}`}>
      ⏱ {visitMinutes(running, now)} min
    </span>
  );
}

/**
 * On the main page: start and stop the visit for the current patient without opening the clinician panel,
 * and a shortcut to the orientation check (which asks for the PIN).
 */
export function VisitBar({ onOrientation }: { onOrientation: () => void }) {
  const { settings, activeId } = useSettings();
  const [, refresh] = useState(0);
  const running = runningVisit(activeId);
  const now = useNow(!!running, 10000);
  const today = visitsOn(dayKey(now)).filter((v) => v.profileId === activeId);
  const last = [...today].reverse().find((v) => v.end !== null);
  const who = settings.nickname || 'Patient';

  return (
    <div className={`visit-bar ${running ? 'running' : ''}`} role="region" aria-label="Visit">
      <span className="visit-bar-who">{who}</span>
      <span className="visit-bar-status" aria-live="polite">
        {running ? (
          <>
            ⏱ <b>{minutesText(visitMinutes(running, now))}</b> since {clockTime(running.start)}
          </>
        ) : last ? (
          <>
            Last visit {clockTime(last.start)} – {clockTime(last.end!)}, <b>{minutesText(visitMinutes(last))}</b>
            {today.length > 1 && <> · today {minutesText(dayTotals(today, now).total)}</>}
          </>
        ) : (
          <span className="muted">No visit started</span>
        )}
      </span>
      <span className="visit-bar-buttons">
        {running ? (
          <button className="primary" onClick={() => (stopVisit(activeId), refresh((x) => x + 1))}>
            ■ Stop visit
          </button>
        ) : (
          <button className="primary" onClick={() => (beginVisit(activeId, settings.nickname), refresh((x) => x + 1))}>
            ▶ Start visit
          </button>
        )}
        <button className="button" onClick={onOrientation}>
          🧭 Orientation
        </button>
      </span>
    </div>
  );
}
