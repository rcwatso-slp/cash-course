/** Shows where he is in the activity, so the order of steps is always visible and predictable. */
export function StepBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="stepbar" aria-label="Steps">
      {steps.map((s, i) => (
        <li key={s} className={i < current ? 'done' : i === current ? 'current' : ''} aria-current={i === current ? 'step' : undefined}>
          <span className="stepbar-num">{i < current ? '✓' : i + 1}</span>
          {s}
        </li>
      ))}
    </ol>
  );
}
