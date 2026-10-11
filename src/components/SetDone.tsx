import { ReadAloud } from './ReadAloud';

/** End of a practice set, so he knows exactly when he's finished. */
export function SetDone({ count, independent, onAgain }: { count: number; independent: number; onAgain: () => void }) {
  const text = `All done. You finished ${count} problems. ${independent} on your own.`;
  return (
    <section className="question set-done">
      <div className="q-prompt">
        <div className="q-prompt-body">
          <h2>All done ✓</h2>
          <p className="q-text">
            You finished <b>{count}</b> problems. <b>{independent}</b> on your own.
          </p>
        </div>
        <ReadAloud text={text} />
      </div>
      <div className="button-row">
        <button className="primary" onClick={onAgain} autoFocus>
          Do another set
        </button>
        <a className="button" href="#/">
          Home
        </a>
      </div>
    </section>
  );
}

export function SetProgress({ n, of }: { n: number; of: number }) {
  return <p className="set-progress">{of > 0 ? `Problem ${n} of ${of}` : `Problem ${n}`}</p>;
}
