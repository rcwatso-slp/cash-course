import { useRef, useState, type ReactNode } from 'react';
import { ReadAloud } from '../components/ReadAloud';
import { SetDone, SetProgress } from '../components/SetDone';
import type { Trial } from '../lib/log';
import { countNew, getSeen, itemKey, markSeen, pickNext } from '../lib/seen';
import { useSettings } from '../lib/settings';
import { areaById, taskById } from './areas';

/**
 * Draws the next item for this patient: never-used items first, then the ones used longest ago.
 * What each patient has had is remembered on the device per task, so a new visit or a new
 * session doesn't start over. Items asked in the last few turns are not repeated.
 */
export function useDeck<T>(items: readonly T[], task: string) {
  const { activeId } = useSettings();
  const recent = useRef<string[]>([]);
  return () => {
    const item = pickNext(items, getSeen(activeId, task), new Set(recent.current));
    const key = itemKey(item);
    markSeen(activeId, task, key);
    const keep = Math.min(8, Math.max(0, items.length - 1));
    recent.current = keep ? [...recent.current.filter((k) => k !== key), key].slice(-keep) : [];
    return item;
  };
}

/** Shown once every item at this level has been used for this patient. */
export function BankNote({ items, task }: { items: readonly unknown[]; task: string }) {
  const { activeId, settings } = useSettings();
  if (items.length === 0 || countNew(items, getSeen(activeId, task)) > 0) return null;
  return (
    <p className="notice bank-note">
      {settings.nickname || 'This patient'} has now had every question here at this level ({items.length}). The ones from longest ago
      come back first. To start fresh or see what’s left, open 🔒 Clinician → Progress → Question bank, or change the level.
    </p>
  );
}

/** A practice set: item number, independent count, and the end-of-set screen. */
export function useSet<T>(make: () => T) {
  const { settings } = useSettings();
  const setLength = settings.setLength;
  const [n, setN] = useState(1);
  const [independent, setIndependent] = useState(0);
  const [item, setItem] = useState<T>(make);
  return {
    n,
    item,
    setLength,
    independent,
    done: setLength > 0 && n > setLength,
    next: () => {
      // After the last item the set is done: don't draw (and use up) another question.
      if (!(setLength > 0 && n >= setLength)) setItem(make());
      setN((x) => x + 1);
    },
    again: () => {
      setN(1);
      setIndependent(0);
      setItem(make());
    },
    onLogged: (t: Trial) => {
      if (t.independent) setIndependent((x) => x + 1);
    },
  };
}

export function areaHref(taskId: string): string {
  const t = taskById(taskId);
  return t ? `#/area/${t.area}` : '#/';
}

/** Page frame for a hub task: title, one-line instructions with read-aloud, then the work. */
export function TaskPage({ id, intro, children, wide }: { id: string; intro?: string; children: ReactNode; wide?: boolean }) {
  const task = taskById(id);
  const area = task ? areaById(task.area) : undefined;
  return (
    <div className={`drill hub-task ${wide ? 'wide' : ''}`} style={area ? ({ '--area': area.color } as React.CSSProperties) : undefined}>
      <h1 className="drill-title">
        {task?.emoji} {task?.title}
      </h1>
      {intro && (
        <div className="task-intro">
          <p>{intro}</p>
          <ReadAloud text={intro} />
        </div>
      )}
      {children}
    </div>
  );
}

/** Renders the set (progress line + item) or the end-of-set screen. */
export function SetFrame<T>({
  set,
  noun = 'items',
  bank,
  children,
}: {
  set: ReturnType<typeof useSet<T>>;
  noun?: string;
  /** The items and task name, to say when they have all been used. */
  bank?: { items: readonly unknown[]; task: string };
  children: ReactNode;
}) {
  if (set.done) return <SetDone count={set.setLength} independent={set.independent} onAgain={set.again} noun={noun} />;
  return (
    <>
      {bank && <BankNote items={bank.items} task={bank.task} />}
      <SetProgress n={set.n} of={set.setLength} noun={noun} />
      {children}
    </>
  );
}

/** Small level picker shown on a task page, so the clinician can adjust without the panel. */
export function LevelNote({ level, names }: { level: number; names: [string, string, string] }) {
  return (
    <p className="level-note">
      Level {level}: {names[level - 1]}
    </p>
  );
}
