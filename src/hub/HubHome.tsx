import type { CSSProperties } from 'react';
import Home from '../modules/Home';
import { useSettings } from '../lib/settings';
import { AREAS, areaById, tasksIn } from './areas';
import type { AreaId } from './types';

/** The hub's front page: one tile per area this patient uses. */
export function HubHome() {
  const { settings } = useSettings();
  const areas = AREAS.filter((a) => settings.areas.includes(a.id));
  return (
    <div className="home hub-home">
      <h1>{settings.nickname ? `Hi, ${settings.nickname}.` : 'Hi.'} What do you want to work on?</h1>
      <div className="home-tiles area-tiles">
        {areas.map((a) => (
          <a key={a.id} href={`#/area/${a.id}`} className="home-tile area-tile" style={{ '--tile': a.color } as CSSProperties}>
            <span className="tile-emoji" aria-hidden="true">
              {a.emoji}
            </span>
            <span className="tile-title">{a.title}</span>
            <span className="tile-desc">{a.desc}</span>
          </a>
        ))}
      </div>
      {areas.length === 0 && <p className="muted">No areas are turned on for this patient. Open Clinician → Settings → Areas.</p>}
    </div>
  );
}

/** One area's task tiles. Money is Cash Course's own home page. */
export function AreaPage({ id }: { id: AreaId }) {
  if (id === 'money') return <Home />;
  const area = areaById(id);
  if (!area) return null;
  return (
    <div className="home area-page">
      <h1>
        {area.emoji} {area.title}
      </h1>
      <p className="muted area-desc">{area.desc}</p>
      {id === 'swallow' && <SwallowNote />}
      <div className="home-tiles">
        {tasksIn(id).map((t) => (
          <a key={t.id} href={`#/${t.id}`} className="home-tile" style={{ '--tile': area.color } as CSSProperties}>
            <span className="tile-emoji" aria-hidden="true">
              {t.emoji}
            </span>
            <span className="tile-title">{t.title}</span>
            <span className="tile-desc">{t.desc}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function SwallowNote() {
  return (
    <p className="notice swallow-note">
      Only do the exercises and strategies your speech therapist gave you. If you cough or choke a lot, have pain, or have trouble breathing,
      stop and tell your nurse or caregiver.
    </p>
  );
}
