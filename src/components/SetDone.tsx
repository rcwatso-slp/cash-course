import { ReadAloud } from './ReadAloud';

/** End of a practice set, so the client knows exactly when they're finished. */
export function SetDone({ count, independent, onAgain, noun = 'problems' }: { count: number; independent: number; onAgain: () => void; noun?: string }) {
  const text = `All done. You finished ${count} ${noun}. ${independent} on your own.`;
  return (
    <section className="question set-done">
      <div className="q-prompt">
        <div className="q-prompt-body">
          <h2>All done ✓</h2>
          <p className="q-text">
            You finished <b>{count}</b> {noun}. <b>{independent}</b> on your own.
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

export function SetProgress({ n, of, noun = 'problems' }: { n: number; of: number; noun?: string }) {
  const one = noun === 'problems' ? 'Problem' : noun === 'items' ? 'Item' : noun.replace(/(x|ch|sh)es$/, '$1').replace(/s$/, '').replace(/^./, (c) => c.toUpperCase());
  return <p className="set-progress">{of > 0 ? `${one} ${n} of ${of}` : `${one} ${n}`}</p>;
}
