import { useState } from 'react';
import { getTrials, SKILL_LABELS, type Skill, type Trial } from '../lib/log';
import { byDay, pctOf, skillProgress, type DaySummary, type MasteryRule } from '../lib/progress';
import { useSettings } from '../lib/settings';

const shortDate = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/** Progress across sessions (one session = one day) and the mastery check for each skill. */
export function ProgressTab() {
  const { settings } = useSettings();
  const [skill, setSkill] = useState<Skill | 'all'>('all');
  const trials = getTrials().filter((t) => t.nickname === settings.nickname);
  const rule: MasteryRule = { pct: settings.masteryPct, sessions: settings.masterySessions, min: settings.masteryMin };
  const skills = (Object.keys(SKILL_LABELS) as Skill[]).filter((s) => trials.some((t) => t.skill === s));
  const shown: Trial[] = skill === 'all' ? trials : trials.filter((t) => t.skill === skill);
  const days = byDay(shown).slice(-20);

  if (trials.length === 0) {
    return <p className="muted">No practice saved yet{settings.nickname ? ` for ${settings.nickname}` : ''}. Progress shows up here after a session.</p>;
  }

  return (
    <div className="progress-tab">
      <p className="muted">
        Each column is one day of practice. "On his own" = right on the first try with no help. Mastery rule: {rule.pct}% or higher on his own for{' '}
        {rule.sessions} sessions in a row, counting sessions with at least {rule.min} problems of that skill. Change it in Settings.
      </p>

      <div className="chart-filters" role="group" aria-label="Show skill">
        <button aria-pressed={skill === 'all'} onClick={() => setSkill('all')}>
          All skills
        </button>
        {skills.map((s) => (
          <button key={s} aria-pressed={skill === s} onClick={() => setSkill(s)}>
            {SKILL_LABELS[s]}
          </button>
        ))}
      </div>

      <h3>On his own, by day{skill !== 'all' ? `: ${SKILL_LABELS[skill]}` : ''}</h3>
      <IndependenceChart days={days} goal={rule.pct} />
      <details className="chart-table">
        <summary>Show as a table</summary>
        <table className="data-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Problems</th>
              <th>On his own</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {[...days].reverse().map((d) => (
              <tr key={d.date}>
                <td>{shortDate(d.date)}</td>
                <td>{d.total}</td>
                <td>{d.independent}</td>
                <td>{pctOf(d)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <h3>Mastery by skill</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Skill</th>
            <th>Last {rule.sessions} counted sessions</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((s) => {
            const p = skillProgress(trials, s, rule);
            return (
              <tr key={s}>
                <td>{SKILL_LABELS[s]}</td>
                <td>{p.counted.length ? p.counted.map((d) => `${pctOf(d)}%`).join(' · ') : <span className="muted">Not enough yet</span>}</td>
                <td>
                  {p.mastered ? (
                    <span className="mastery-yes">✓ Mastered. Consider moving up a level.</span>
                  ) : (
                    <span className="muted">
                      Not yet ({p.counted.length} of {rule.sessions} sessions counted)
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const W = 640;
const H = 220;
const PAD = { top: 16, right: 12, bottom: 34, left: 40 };

function IndependenceChart({ days, goal }: { days: DaySummary[]; goal: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const band = plotW / Math.max(days.length, 1);
  const barW = Math.min(24, band * 0.6);
  const y = (pct: number) => PAD.top + plotH - (pct / 100) * plotH;
  const last = days.length - 1;
  const h = hover !== null ? days[hover] : null;

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Percent of problems done on his own, by day. The table below has the same numbers.">
        {[0, 50, 100].map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="chart-grid" />
            <text x={PAD.left - 6} y={y(t)} className="chart-tick" textAnchor="end" dominantBaseline="middle">
              {t}%
            </text>
          </g>
        ))}
        <line x1={PAD.left} x2={W - PAD.right} y1={y(goal)} y2={y(goal)} className="chart-goal" />
        <text x={W - PAD.right} y={y(goal) - 5} className="chart-goal-label" textAnchor="end">
          Goal {goal}%
        </text>

        {days.map((d, i) => {
          const pct = pctOf(d);
          const cx = PAD.left + band * i + band / 2;
          const top = y(pct);
          const height = PAD.top + plotH - top;
          const r = Math.min(4, height / 2, barW / 2);
          // Rounded at the top (the data end), square at the baseline.
          const path =
            height <= 0
              ? ''
              : `M${cx - barW / 2},${top + height} V${top + r} Q${cx - barW / 2},${top} ${cx - barW / 2 + r},${top} H${cx + barW / 2 - r} Q${cx + barW / 2},${top} ${cx + barW / 2},${top + r} V${top + height} Z`;
          return (
            <g
              key={d.date}
              tabIndex={0}
              role="img"
              aria-label={`${shortDate(d.date)}: ${d.independent} of ${d.total} on his own, ${pct}%`}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="chart-col"
            >
              {/* Hit target is the whole column, bigger than the bar */}
              <rect x={cx - band / 2} y={PAD.top} width={band} height={plotH} fill="transparent" />
              {path && <path d={path} className={`chart-bar${hover === i ? ' active' : ''}`} />}
              {(i === last || days.length <= 8) && (
                <text x={cx} y={top - 6} className="chart-value" textAnchor="middle">
                  {pct}%
                </text>
              )}
              {(days.length <= 10 || i % Math.ceil(days.length / 10) === 0 || i === last) && (
                <text x={cx} y={H - PAD.bottom + 16} className="chart-tick" textAnchor="middle">
                  {shortDate(d.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {h && hover !== null && (
        <div className="chart-tooltip" style={{ left: `${((PAD.left + band * hover + band / 2) / W) * 100}%` }} role="status">
          <b>{pctOf(h)}%</b> on his own
          <span>
            {h.independent} of {h.total} problems · {shortDate(h.date)}
          </span>
        </div>
      )}
    </div>
  );
}
