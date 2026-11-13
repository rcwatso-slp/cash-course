import { useEffect, useState } from 'react';

/** Re-renders every `ms` while active and returns the current time. Timers compute from start times. */
export function useNow(active: boolean, ms = 250): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [active, ms]);
  return now;
}

/** "1:05", "0:30" */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** "30 seconds", "2 minutes", "1 min 30 sec" */
export function spokenDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (!s) return `${m} minute${m === 1 ? '' : 's'}`;
  return `${m} min ${s} sec`;
}
