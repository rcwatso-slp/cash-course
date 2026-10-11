import type { CSSProperties } from 'react';
import { RESTAURANTS } from '../data/restaurants';
import { STORES } from '../data/stores';
import { useSettings } from '../lib/settings';

const SKILLS = [
  { href: '#/quick-change', emoji: '💵', title: 'Quick Change', desc: 'How much change should you get back?' },
  { href: '#/check-change', emoji: '🧾', title: 'Check the Change', desc: 'The cashier hands you change. Is it right?' },
  { href: '#/saving-up', emoji: '🐷', title: 'Saving Up', desc: 'How much more do you need? How many weeks?' },
];

const STORE_COLORS: Record<string, string> = { falmart: '#0071dc', amazoom: '#232f3e', leggo: '#e3000b' };

export default function Home() {
  const { settings } = useSettings();
  return (
    <div className="home">
      <h1>{settings.nickname ? `Hi, ${settings.nickname}.` : 'Hi.'} What do you want to practice?</h1>

      <h2 className="home-section">🍽️ Eat out</h2>
      <div className="home-tiles">
        {RESTAURANTS.map((r) => (
          <a key={r.id} href={`#/${r.id}`} className="home-tile" style={{ '--tile': r.colors.brand } as CSSProperties}>
            <span className="tile-emoji" aria-hidden="true">
              {r.emoji}
            </span>
            <span className="tile-title">{r.name}</span>
            <span className="tile-desc">{r.blurb}</span>
          </a>
        ))}
      </div>

      <h2 className="home-section">🛒 Shop online</h2>
      <div className="home-tiles">
        {STORES.map((st) => (
          <a key={st.id} href={`#/${st.id}`} className="home-tile" style={{ '--tile': STORE_COLORS[st.skin] } as CSSProperties}>
            <span className="tile-emoji" aria-hidden="true">
              {st.logo}
            </span>
            <span className="tile-title">{st.name}</span>
            <span className="tile-desc">{st.blurb}</span>
          </a>
        ))}
      </div>

      <h2 className="home-section">💪 Money skills</h2>
      <div className="home-tiles">
        {SKILLS.map((a) => (
          <a key={a.href} href={a.href} className="home-tile" style={{ '--tile': 'var(--accent)' } as CSSProperties}>
            <span className="tile-emoji" aria-hidden="true">
              {a.emoji}
            </span>
            <span className="tile-title">{a.title}</span>
            <span className="tile-desc">{a.desc}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
