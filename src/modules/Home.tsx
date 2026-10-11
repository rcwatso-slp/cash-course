import { useSettings } from '../lib/settings';

const ACTIVITIES = [
  { href: '#/mcdoogles', emoji: '🍔', title: 'McDoogles', desc: 'Order food, figure out the total, pay, and get your change.', className: 'tile-mcd' },
  { href: '#/quick-change', emoji: '💵', title: 'Quick Change', desc: 'How much change should you get back?', className: 'tile-change' },
  { href: '#/check-change', emoji: '🧾', title: 'Check the Change', desc: 'The cashier hands you change. Is it right?', className: 'tile-check' },
];

export default function Home() {
  const { settings } = useSettings();
  return (
    <div className="home">
      <h1>{settings.nickname ? `Hi, ${settings.nickname}.` : 'Hi.'} What do you want to practice?</h1>
      <div className="home-tiles">
        {ACTIVITIES.map((a) => (
          <a key={a.href} href={a.href} className={`home-tile ${a.className}`}>
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
