import { ReadAloud } from '../../components/ReadAloud';
import { strategyById, type Strategy } from '../../data/hub/swallow';
import { TaskPage } from '../../hub/Drill';
import { useSettings } from '../../lib/settings';

export default function SwallowPlan() {
  const { settings } = useSettings();
  const strategies = settings.strategies.map(strategyById).filter((s): s is Strategy => !!s);
  const empty = strategies.length === 0 && !settings.dietSolids && !settings.dietLiquids;
  const text = [
    settings.dietSolids && `Food: ${settings.dietSolids}.`,
    settings.dietLiquids && `Drinks: ${settings.dietLiquids}.`,
    ...strategies.map((s) => `${s.short}.`),
    settings.swallowNotes,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <TaskPage id="swallow-plan">
      {empty ? (
        <div className="question">
          <p className="q-text">No swallow plan is set for {settings.nickname || 'this patient'} yet.</p>
          <p>Your speech therapist fills it in under 🔒 Clinician → Settings → Swallowing.</p>
        </div>
      ) : (
        <>
          <div className="swallow-card print-card">
            <div className="swallow-card-head">
              <h2>🍽️ My Swallow Plan{settings.nickname ? `: ${settings.nickname}` : ''}</h2>
              <ReadAloud text={`My swallow plan. ${text}`} />
            </div>
            {(settings.dietSolids || settings.dietLiquids) && (
              <dl className="diet">
                {settings.dietSolids && (
                  <div>
                    <dt>Food</dt>
                    <dd>{settings.dietSolids}</dd>
                  </div>
                )}
                {settings.dietLiquids && (
                  <div>
                    <dt>Drinks</dt>
                    <dd>{settings.dietLiquids}</dd>
                  </div>
                )}
              </dl>
            )}
            <ul className="strategy-list">
              {strategies.map((s) => (
                <li key={s.id}>
                  <span className="strategy-emoji" aria-hidden="true">
                    {s.emoji}
                  </span>
                  {s.short}
                </li>
              ))}
            </ul>
            {settings.swallowNotes && <p className="swallow-notes">{settings.swallowNotes}</p>}
            <p className="swallow-card-foot">Questions? Ask your speech therapist or nurse. Printed {new Date().toLocaleDateString('en-US')}.</p>
          </div>
          <div className="button-row no-print">
            <button className="primary" onClick={() => window.print()}>
              🖨️ Print bedside card
            </button>
          </div>
        </>
      )}
    </TaskPage>
  );
}
