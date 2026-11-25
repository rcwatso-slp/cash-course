import { useState, type FormEvent } from 'react';
import { getTrials } from '../lib/log';
import { useSettings } from '../lib/settings';
import { stopVisit } from '../lib/visits';
import { beginVisit, useVisitStatus } from './Visits';

/** Several patients on one device, each with their own settings. Data is kept apart by nickname. */
export function PatientsTab({ onPicked, onVisit }: { onPicked: () => void; onVisit: () => void }) {
  const { patients, activeId, switchPatient, addPatient, removePatient } = useSettings();
  const [name, setName] = useState('');
  const [copy, setCopy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trials = getTrials();
  const count = (nick: string) => trials.filter((t) => t.nickname === nick).length;
  const visit = useVisitStatus();
  const [, refresh] = useState(0);

  function add(e: FormEvent) {
    e.preventDefault();
    const nick = name.trim();
    if (!nick) return setError('Type initials or a nickname.');
    if (patients.some((p) => p.nickname.toLowerCase() === nick.toLowerCase())) return setError('That nickname is already used. Data is kept apart by nickname, so pick a different one (add a number, like JD2).');
    addPatient(nick, copy ? activeId : undefined);
    setName('');
    setError(null);
    onPicked();
  }

  return (
    <div className="settings">
      <section>
        <h3>Patients on this device</h3>
        <p className="muted">
          Tap <b>Use</b> to switch, or <b>Start visit</b> to switch and start timing. Each patient has their own settings, areas, targets and data. Use initials or a nickname, never a full name.
        </p>
        <ul className="patient-list">
          {patients.map((p) => (
            <li key={p.id} className={`patient-row ${p.id === activeId ? 'active' : ''}`}>
              <span className="patient-name">{p.nickname || '(no nickname yet)'}</span>
              <span className="muted small">{count(p.nickname)} problems saved</span>
              <span className="patient-visit small">
                {visit.running(p.id) ? (
                  <b className="visit-on">⏱ Visit running</b>
                ) : visit.minutesToday(p.id) > 0 ? (
                  <>Today: {visit.minutesToday(p.id)} min</>
                ) : null}
              </span>
              {visit.running(p.id) ? (
                <button className="button" onClick={() => (stopVisit(p.id), refresh((x) => x + 1))}>
                  Stop visit
                </button>
              ) : (
                <button
                  className="button"
                  onClick={() => {
                    if (p.id !== activeId) switchPatient(p.id);
                    beginVisit(p.id, p.nickname);
                    onVisit();
                  }}
                >
                  Start visit
                </button>
              )}
              {p.id === activeId ? (
                <b>✓ Current</b>
              ) : (
                <button
                  className="primary"
                  onClick={() => {
                    switchPatient(p.id);
                    onPicked();
                  }}
                >
                  Use
                </button>
              )}
              {patients.length > 1 && (
                <button
                  className="button danger"
                  onClick={() => {
                    if (window.confirm(`Remove ${p.nickname || 'this patient'} from this device? Their settings are deleted. Their saved practice data stays until you delete it in the Data tab.`))
                      removePatient(p.id);
                  }}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Add a patient</h3>
        <form className="pin-form" onSubmit={add}>
          <label htmlFor="new-patient">Initials or nickname</label>
          <input id="new-patient" className="text-input" maxLength={20} autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="inline-check">
            <input type="checkbox" checked={copy} onChange={(e) => setCopy(e.target.checked)} /> Copy settings from the current patient
          </label>
          {error && <p className="feedback bad">{error}</p>}
          <button className="primary" type="submit">
            Add and switch to them
          </button>
        </form>
      </section>
    </div>
  );
}
