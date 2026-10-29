import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { applyOverrides } from './lib/overrides';
import './styles.css';

// Clinician price edits, before anything renders.
applyOverrides();

// Offline support on the real site (not during development).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Offline mode is a bonus; the app works without it.
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
