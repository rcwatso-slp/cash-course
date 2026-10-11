import { useEffect, useState } from 'react';
import { ClinicianGate } from './clinician/ClinicianPanel';
import { Calculator } from './components/Calculator';
import { getSessionStart } from './lib/log';
import { SettingsProvider, useSettings } from './lib/settings';
import { RESTAURANTS } from './data/restaurants';
import { STORES } from './data/stores';
import CheckChange from './modules/CheckChange';
import Home from './modules/Home';
import QuickChange from './modules/QuickChange';
import Restaurant from './modules/restaurant/Restaurant';
import SavingUp from './modules/SavingUp';
import Store from './modules/store/Store';

// Hash routes (#/mcdoogles) work on GitHub Pages without server configuration.
function useRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash.replace(/^#\/?/, '');
}

const DRILLS: Record<string, () => JSX.Element> = {
  'quick-change': QuickChange,
  'check-change': CheckChange,
  'saving-up': SavingUp,
};

/** #/mcdoogles, #/falmart, #/quick-change ... or null for Home. */
function pageFor(route: string): JSX.Element | null {
  const Drill = DRILLS[route];
  if (Drill) return <Drill />;
  const restaurant = RESTAURANTS.find((r) => r.id === route);
  if (restaurant) return <Restaurant restaurant={restaurant} />;
  const store = STORES.find((st) => st.id === route);
  if (store) return <Store store={store} />;
  return null;
}

function Shell() {
  const route = useRoute();
  const { settings } = useSettings();
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    getSessionStart(); // starts today's session on first use
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.text = settings.largeText ? 'large' : 'normal';
    root.dataset.contrast = settings.highContrast ? 'high' : 'normal';
  }, [settings.largeText, settings.highContrast]);

  const page = pageFor(route);

  return (
    <div className="app">
      <header className="app-header">
        <a href="#/" className="app-name">
          💵 Cash Course
        </a>
        {page && (
          <a href="#/" className="button home-btn">
            ← Home
          </a>
        )}
      </header>
      <main className="app-main">
        {page ?? <Home />}
      </main>
      <footer className="app-footer">
        <button className="clinician-btn" onClick={() => setPanelOpen(true)}>
          🔒 Clinician
        </button>
      </footer>
      <Calculator />
      {panelOpen && <ClinicianGate onClose={() => setPanelOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <Shell />
    </SettingsProvider>
  );
}
