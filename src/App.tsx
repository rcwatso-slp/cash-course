import { useEffect, useState } from 'react';
import { ClinicianGate } from './clinician/ClinicianPanel';
import { Calculator } from './components/Calculator';
import { getSessionStart } from './lib/log';
import { SettingsProvider, useSettings } from './lib/settings';
import CheckChange from './modules/CheckChange';
import Home from './modules/Home';
import McDoogles from './modules/McDoogles';
import QuickChange from './modules/QuickChange';

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

const ROUTES: Record<string, () => JSX.Element> = {
  mcdoogles: McDoogles,
  'quick-change': QuickChange,
  'check-change': CheckChange,
};

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

  const Page = ROUTES[route] ?? Home;

  return (
    <div className="app">
      <header className="app-header">
        <a href="#/" className="app-name">
          💵 Cash Course
        </a>
        {route && ROUTES[route] && (
          <a href="#/" className="button home-btn">
            ← Home
          </a>
        )}
      </header>
      <main className="app-main">
        <Page />
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
