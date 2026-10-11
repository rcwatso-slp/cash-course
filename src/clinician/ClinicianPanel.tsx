import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  SKILL_LABELS, clearTrials, getTrials, percent, replaceTrials, sessionTrials, startNewSession,
  moduleLabel, summarize, toCSV, type Skill, type Trial,
} from '../lib/log';
import { CHANGE_LEVELS, PRICE_LEVELS, type ChangeLevel, type PriceLevel } from '../lib/problems';
import { DEFAULT_SETTINGS, useSettings, type HelpLevel, type PayWith, type Settings } from '../lib/settings';

export function ClinicianGate({ onClose }: { onClose: () => void }) {
  const { settings, update } = useSettings();
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (unlocked) return <ClinicianPanel onClose={onClose} />;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal pin-modal" role="dialog" aria-modal="true" aria-labelledby="pin-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="pin-title">🔒 Clinician settings</h2>
        {settings.pin ? (
          <PinForm
            label="Enter your 4-digit PIN"
            submitLabel="Unlock"
            onSubmit={(pin) => (pin === settings.pin ? (setUnlocked(true), null) : "That PIN isn't right.")}
          />
        ) : (
          <>
            <p>Create a 4-digit PIN. Your client won't be able to change settings without it.</p>
            <PinForm
              label="New PIN"
              submitLabel="Create PIN"
              onSubmit={(pin) => {
                update({ pin });
                setUnlocked(true);
                return null;
              }}
            />
          </>
        )}
        <button className="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function PinForm({ label, submitLabel, onSubmit }: { label: string; submitLabel: string; onSubmit: (pin: string) => string | null }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) return setError('Use exactly 4 numbers.');
    setError(onSubmit(pin));
    setPin('');
  };
  return (
    <form onSubmit={submit} className="pin-form">
      <label htmlFor="pin">{label}</label>
      <input id="pin" type="password" inputMode="numeric" autoComplete="off" maxLength={4} autoFocus value={pin} onChange={(e) => setPin(e.target.value)} />
      {error && <p className="feedback bad">{error}</p>}
      <button type="submit" className="primary">
        {submitLabel}
      </button>
    </form>
  );
}

type Tab = 'settings' | 'session' | 'data';

function ClinicianPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('settings');
  return (
    <div className="panel" role="dialog" aria-modal="true" aria-label="Clinician settings">
      <header className="panel-head">
        <h2>Clinician</h2>
        <nav className="panel-tabs">
          {(['settings', 'session', 'data'] as Tab[]).map((t) => (
            <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
              {t === 'settings' ? 'Settings' : t === 'session' ? 'This session' : 'Data'}
            </button>
          ))}
        </nav>
        <button className="primary" onClick={onClose}>
          Done
        </button>
      </header>
      <div className="panel-body">
        {tab === 'settings' && <SettingsTab />}
        {tab === 'session' && <SessionTab />}
        {tab === 'data' && <DataTab />}
      </div>
    </div>
  );
}

// ---------- Settings ----------

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" aria-label={label} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{checked ? 'On' : 'Off'}</span>
    </label>
  );
}

function Select<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
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

function SettingsTab() {
  const { settings: s, update } = useSettings();
  const set = <K extends keyof Settings>(key: K) => (value: Settings[K]) => update({ [key]: value } as Partial<Settings>);
  const [changingPin, setChangingPin] = useState(false);

  return (
    <div className="settings">
      <section>
        <h3>Client</h3>
        <Field label="Nickname" hint="Initials or a nickname only. No full names.">
          <input aria-label="Nickname" value={s.nickname} maxLength={20} onChange={(e) => update({ nickname: e.target.value })} />
        </Field>
      </section>

      <section>
        <h3>Ordering, shopping and totals</h3>
        <Field label="Price difficulty" hint="Applies to the next new order.">
          <Select<PriceLevel>
            label="Price difficulty"
            value={s.priceLevel}
            options={([1, 2, 3, 4] as PriceLevel[]).map((l) => [l, PRICE_LEVELS[l].label])}
            onChange={set('priceLevel')}
          />
        </Field>
        <Field label="Order type" hint="Restaurants use an order card. Stores use a shopping list.">
          <Select
            label="Order type"
            value={s.orderMode}
            options={[['free', 'Free choice: he picks what to buy'], ['task', 'Task: order card / shopping list']]}
            onChange={set('orderMode')}
          />
        </Field>
        <Field label="Restaurant menu style" hint="A menu board is text only and harder to scan, like a real counter.">
          <Select label="Restaurant menu style" value={s.menuStyle} options={[['kiosk', 'Kiosk with pictures'], ['board', 'Menu board (text only)']]} onChange={set('menuStyle')} />
        </Field>
        <Field label="Show running total" hint="Off means he works out the total himself.">
          <Toggle label="Show running total" checked={s.showRunningTotal} onChange={set('showRunningTotal')} />
        </Field>
        <Field label="Sales tax">
          <Toggle label="Sales tax" checked={s.taxOn} onChange={set('taxOn')} />
        </Field>
        {s.taxOn && (
          <>
            <Field label="Tax rate (%)">
              <input
                aria-label="Tax rate percent"
                type="number"
                min={0}
                max={20}
                step={0.01}
                value={s.taxRate}
                onChange={(e) => update({ taxRate: Math.max(0, Math.min(20, Number(e.target.value) || 0)) })}
              />
            </Field>
            <Field label="Who figures out the tax?">
              <Select label="Who figures out the tax" value={s.taxMode} options={[['app', 'The app shows the tax; he adds it'], ['client', 'He calculates the tax himself']]} onChange={set('taxMode')} />
            </Field>
          </>
        )}
        <Field label="Calculator" hint="Shows a phone-style calculator. Its use is recorded with each problem.">
          <Toggle label="Calculator" checked={s.calculator} onChange={set('calculator')} />
        </Field>
      </section>

      <section>
        <h3>Paying and change</h3>
        <Field label="How he pays at restaurants" hint="Applies to the next new order.">
          <Select<PayWith>
            label="How he pays"
            value={s.payWith}
            options={[
              ['nextBill', 'App picks the next bill up ($10 for $7.39)'],
              ['twenty', 'App pays with a $20'],
              ['nextDollar', 'He pays the next dollar up ($8 for $7.39)'],
              ['choose', 'He picks bills from his wallet'],
            ]}
            onChange={set('payWith')}
          />
        </Field>
        <Field label="Change help (level 2)">
          <Select label="Change help style" value={s.changeHelpStyle} options={[['countUp', 'Count up like a cashier (number line)'], ['column', 'Column subtraction with borrowing shown']]} onChange={set('changeHelpStyle')} />
        </Field>
        <Field label="Quick Change and Check the Change level">
          <Select<ChangeLevel>
            label="Change level"
            value={s.changeLevel}
            options={([1, 2, 3, 4] as ChangeLevel[]).map((l) => [l, CHANGE_LEVELS[l]])}
            onChange={set('changeLevel')}
          />
        </Field>
        <Field label="How often the cashier makes a mistake" hint="Check the Change only.">
          <Select label="Cashier mistake rate" value={s.wrongChangeRate} options={[[0, 'Never'], [0.25, '1 in 4'], [0.5, 'Half the time'], [0.75, '3 in 4']]} onChange={set('wrongChangeRate')} />
        </Field>
        <Field label="Problems per set" hint="Quick Change, Check the Change and Saving Up.">
          <Select label="Problems per set" value={s.setLength} options={[[5, '5'], [10, '10'], [15, '15'], [20, '20'], [0, 'No limit']]} onChange={set('setLength')} />
        </Field>
        <Field label="Gift card for online stores" hint="If an order costs more, the card is bumped up to the next $25.">
          <Select label="Gift card amount" value={s.giftCard} options={[[2500, '$25'], [5000, '$50'], [7500, '$75'], [10000, '$100'], [20000, '$200']]} onChange={set('giftCard')} />
        </Field>
        <Field label="Wallet" hint="Used when he picks bills himself. Extra $20s are added if needed.">
          <div className="wallet-edit">
            {[100, 500, 1000, 2000].map((bill) => (
              <label key={bill}>
                ${bill / 100}s
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={s.wallet[bill] ?? 0}
                  onChange={(e) => update({ wallet: { ...s.wallet, [bill]: Math.max(0, Math.min(20, Number(e.target.value) || 0)) } })}
                />
              </label>
            ))}
          </div>
        </Field>
      </section>

      <section>
        <h3>Help</h3>
        <Field label="Help levels available">
          <Select<HelpLevel>
            label="Help levels available"
            value={s.maxHelp}
            options={[[0, 'Off: no help button'], [1, 'Hint only'], [2, 'Hint and more help'], [3, 'All 3 (hint, more help, answer)']]}
            onChange={set('maxHelp')}
          />
        </Field>
        <Field label="Start with help showing" hint="For errorless teaching. Fade back to None across sessions.">
          <Select<HelpLevel> label="Start with help showing" value={s.startHelp} options={[[0, 'None (he tries first)'], [1, 'Hint'], [2, 'More help'], [3, 'Answer']]} onChange={set('startHelp')} />
        </Field>
        <Field label="Wait before help" hint="The help button unlocks after this many seconds, so he tries first.">
          <Select label="Wait before help" value={s.helpDelay} options={[[0, 'No wait'], [5, '5 seconds'], [10, '10 seconds'], [20, '20 seconds'], [30, '30 seconds']]} onChange={set('helpDelay')} />
        </Field>
        <Field label="Show a hint after a wrong answer">
          <Toggle label="Hint after wrong answer" checked={s.autoHintOnWrong} onChange={set('autoHintOnWrong')} />
        </Field>
      </section>

      <section>
        <h3>Display</h3>
        <Field label="Read-aloud buttons">
          <Toggle label="Read-aloud buttons" checked={s.readAloud} onChange={set('readAloud')} />
        </Field>
        <Field label="Large text">
          <Toggle label="Large text" checked={s.largeText} onChange={set('largeText')} />
        </Field>
        <Field label="High contrast">
          <Toggle label="High contrast" checked={s.highContrast} onChange={set('highContrast')} />
        </Field>
      </section>

      <section>
        <h3>Security</h3>
        <Field label="Clinician PIN" hint="This keeps settings away from your client. It is not a password for sensitive data.">
          {changingPin ? (
            <PinForm
              label="New PIN"
              submitLabel="Save PIN"
              onSubmit={(pin) => {
                update({ pin });
                setChangingPin(false);
                return null;
              }}
            />
          ) : (
            <button className="button" onClick={() => setChangingPin(true)}>
              Change PIN
            </button>
          )}
        </Field>
        <Field label="Reset settings" hint="Puts every setting back to the default. Keeps your data and PIN.">
          <button className="button" onClick={() => update({ ...DEFAULT_SETTINGS, pin: s.pin, nickname: s.nickname })}>
            Reset to defaults
          </button>
        </Field>
      </section>
    </div>
  );
}

// ---------- Session ----------

const HELP_NAMES = ['None', 'Hint', 'More help', 'Answer'];

function SummaryCards({ trials }: { trials: Trial[] }) {
  const s = summarize(trials);
  const cards: [string, number | string, string?][] = [
    ['Problems', s.total],
    ['On his own', s.independent, percent(s.independent, s.total)],
    ['No help, 2+ tries', s.noHelpMoreTries, percent(s.noHelpMoreTries, s.total)],
    ['Used a hint', s.byHelp[1], percent(s.byHelp[1], s.total)],
    ['Used more help', s.byHelp[2], percent(s.byHelp[2], s.total)],
    ['Answer shown', s.byHelp[3], percent(s.byHelp[3], s.total)],
  ];
  return (
    <div className="summary-cards">
      {cards.map(([label, value, pct]) => (
        <div key={label} className="summary-card">
          <span className="summary-value">{value}</span>
          <span className="summary-label">{label}</span>
          {pct && <span className="summary-pct">{pct}</span>}
        </div>
      ))}
    </div>
  );
}

function SessionTab() {
  const { settings } = useSettings();
  const [, refresh] = useState(0);
  const trials = sessionTrials(settings.nickname);
  const skills = [...new Set(trials.map((t) => t.skill))] as Skill[];

  return (
    <div className="session">
      <div className="session-head">
        <p>
          Showing today's session{settings.nickname ? ` for ${settings.nickname}` : ''}. "On his own" means right on the first try with no help.
        </p>
        <button
          className="button"
          onClick={() => {
            startNewSession();
            refresh((x) => x + 1);
          }}
        >
          Start a new session
        </button>
      </div>

      {trials.length === 0 ? (
        <p className="muted">No problems yet this session.</p>
      ) : (
        <>
          <SummaryCards trials={trials} />

          <h3>By skill</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Problems</th>
                <th>On his own</th>
                <th>Hint</th>
                <th>More help</th>
                <th>Answer</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => {
                const s = summarize(trials.filter((t) => t.skill === skill));
                return (
                  <tr key={skill}>
                    <td>{SKILL_LABELS[skill]}</td>
                    <td>{s.total}</td>
                    <td>
                      {s.independent} ({percent(s.independent, s.total)})
                    </td>
                    <td>{s.byHelp[1]}</td>
                    <td>{s.byHelp[2]}</td>
                    <td>{s.byHelp[3]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h3>Every problem</h3>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Activity</th>
                  <th>Skill</th>
                  <th>Level</th>
                  <th>Question</th>
                  <th>Tries</th>
                  <th>Help</th>
                  <th>Secs</th>
                  <th>Calc</th>
                </tr>
              </thead>
              <tbody>
                {[...trials].reverse().map((t) => (
                  <tr key={t.id} className={t.independent ? 'row-independent' : ''}>
                    <td>{new Date(t.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</td>
                    <td>{moduleLabel(t.module)}</td>
                    <td>{SKILL_LABELS[t.skill]}</td>
                    <td>{t.level}</td>
                    <td>{t.question}</td>
                    <td>{t.attempts}</td>
                    <td>{HELP_NAMES[t.helpLevel]}</td>
                    <td>{t.seconds}</td>
                    <td>{t.calculator ? 'Yes' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Data ----------

function download(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const today = () => new Date().toISOString().slice(0, 10);

function DataTab() {
  const { settings, update } = useSettings();
  const [message, setMessage] = useState<string | null>(null);
  const [, refresh] = useState(0);
  const all = getTrials();
  const mine = all.filter((t) => t.nickname === settings.nickname);
  const who = settings.nickname || 'client';

  async function importBackup(file: File) {
    try {
      const data = JSON.parse(await file.text()) as { app?: string; trials?: Trial[]; settings?: Partial<Settings> };
      if (data.app !== 'cash-course' || !Array.isArray(data.trials)) throw new Error('not a backup');
      const known = new Set(all.map((t) => t.id));
      const added = data.trials.filter((t) => !known.has(t.id));
      replaceTrials([...all, ...added].sort((a, b) => a.at.localeCompare(b.at)));
      if (data.settings) update({ ...data.settings, pin: settings.pin });
      setMessage(`Imported ${added.length} new problems.`);
      refresh((x) => x + 1);
    } catch {
      setMessage("That file isn't a Cash Course backup.");
    }
  }

  return (
    <div className="data">
      <p>
        All data stays in this browser on this device. Nothing is sent anywhere. Export a copy for your notes, or a backup to move to another device.
      </p>
      <SummaryCards trials={mine} />
      <p className="muted">
        All-time totals{settings.nickname ? ` for ${settings.nickname}` : ''}. {all.length} problems saved on this device in total.
      </p>

      <div className="button-row">
        <button className="primary" disabled={mine.length === 0} onClick={() => download(`cash-course-${who}-${today()}.csv`, toCSV(mine), 'text/csv')}>
          Export {settings.nickname || 'this client'}'s data (CSV)
        </button>
        <button
          className="button"
          disabled={all.length === 0}
          onClick={() => {
            const { pin: _pin, ...rest } = settings;
            void _pin;
            download(`cash-course-backup-${today()}.json`, JSON.stringify({ app: 'cash-course', version: 1, settings: rest, trials: all }, null, 2), 'application/json');
          }}
        >
          Download full backup (JSON)
        </button>
        <label className="button file-button">
          Import backup
          <input type="file" accept="application/json,.json" onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])} />
        </label>
      </div>
      {message && <p className="feedback info">{message}</p>}

      <h3>Delete data</h3>
      <p className="muted">This can't be undone. Download a backup first.</p>
      <button
        className="button danger"
        disabled={all.length === 0}
        onClick={() => {
          if (window.confirm(`Delete all ${all.length} saved problems on this device? This can't be undone.`)) {
            clearTrials();
            setMessage('All data deleted.');
            refresh((x) => x + 1);
          }
        }}
      >
        Delete all data on this device
      </button>
    </div>
  );
}
