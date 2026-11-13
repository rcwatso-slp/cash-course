import { useEffect, useState } from 'react';
import { ClinicianGate } from './clinician/ClinicianPanel';
import { Calculator } from './components/Calculator';
import { getSessionStart } from './lib/log';
import { SettingsProvider, useSettings } from './lib/settings';
import { RESTAURANTS } from './data/restaurants';
import { STORES } from './data/stores';
import AffordIt from './modules/AffordIt';
import BetterDeal from './modules/BetterDeal';
import ChaiseBank from './modules/ChaiseBank';
import CheckChange from './modules/CheckChange';
import DoorDosh from './modules/DoorDosh';
import QuickChange from './modules/QuickChange';
import ReadReceipt from './modules/ReadReceipt';
import Restaurant from './modules/restaurant/Restaurant';
import SavingUp from './modules/SavingUp';
import ScamCheck from './modules/ScamCheck';
import Store from './modules/store/Store';
import WorksheetPage from './modules/WorksheetPage';
import { areaById, HUB_NAME, taskById } from './hub/areas';
import { AreaPage, HubHome } from './hub/HubHome';
import { HUB_PAGES } from './hub/routes';
import type { AreaId } from './hub/types';
import { SrtBanner } from './modules/memory/SpacedRetrieval';

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
  'afford-it': AffordIt,
  'chaise-bank': ChaiseBank,
  doordosh: DoorDosh,
  'better-deal': BetterDeal,
  'read-receipt': ReadReceipt,
  'spot-the-scam': ScamCheck,
  worksheet: WorksheetPage,
};

/** #/mcdoogles, #/falmart, #/quick-change ... or null for Home. */
function pageFor(route: string): JSX.Element | null {
  const Drill = DRILLS[route];
  if (Drill) return <Drill />;
  const restaurant = RESTAURANTS.find((r) => r.id === route);
  if (restaurant) return <Restaurant restaurant={restaurant} />;
  const store = STORES.find((st) => st.id === route);
  if (store) return <Store store={store} />;
  const Task = HUB_PAGES[route];
  if (Task) return <Task />;
  return null;
}

/** Which area a route belongs to. Cash Course pages are all "money". */
function areaOf(route: string): AreaId | null {
  if (route.startsWith('area/')) return (areaById(route.slice(5))?.id ?? null) as AreaId | null;
  const task = taskById(route);
  if (task) return task.area;
  return pageFor(route) ? 'money' : null;
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

  const areas = settings.areas;
  const onlyArea = areas.length === 1 ? areas[0] : null;
  const area = areaOf(route);
  const isAreaPage = route.startsWith('area/') && area;
  const page = isAreaPage ? <AreaPage id={area} /> : pageFor(route);
  const home = onlyArea ? <AreaPage id={onlyArea} /> : <HubHome />;
  // Cash Course keeps its own name when the patient only uses money skills, or on its pages.
  const cashCourse = onlyArea === 'money' || (onlyArea === null && area === 'money');
  const areaDef = area ? areaById(area) : undefined;
  const showAreaBack = !!areaDef && !isAreaPage && !onlyArea;

  useEffect(() => {
    document.title = cashCourse ? 'Cash Course' : HUB_NAME;
  }, [cashCourse]);

  return (
    <div className="app">
      <header className="app-header">
        <a href="#/" className="app-name">
          {cashCourse ? '💵 Cash Course' : `🧩 ${HUB_NAME}`}
        </a>
        {page && (
          <nav className="header-nav">
            {showAreaBack && (
              <a href={`#/area/${areaDef.id}`} className="button home-btn">
                ← {areaDef.title}
              </a>
            )}
            <a href="#/" className="button home-btn">
              {showAreaBack ? 'Home' : '← Home'}
            </a>
          </nav>
        )}
      </header>
      <SrtBanner onPage={route === 'spaced-retrieval'} />
      <main className="app-main">
        {page ?? home}
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
