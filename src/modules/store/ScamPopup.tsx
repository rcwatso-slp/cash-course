import { useRef, useState } from 'react';
import { SCAM_CASES } from '../../data/scams';
import { logChoice } from '../../lib/log';
import { pick } from '../../lib/random';

const POPUPS = SCAM_CASES.filter((c) => c.format === 'popup');

/**
 * A fake pop-up that shows up while shopping. Closing it is right.
 * Clicking the big button explains why it was a scam. Both are logged.
 */
export function ScamPopup({ module, nickname, onClosed }: { module: string; nickname: string; onClosed: (wasRight: boolean) => void }) {
  const [c] = useState(() => pick(POPUPS));
  const [clicked, setClicked] = useState(false);
  const shownAt = useRef(Date.now());

  const log = (correct: boolean) =>
    logChoice({
      nickname,
      module,
      skill: 'scam',
      level: 'pop-up',
      question: `Pop-up while shopping: ${c.id}`,
      answer: correct ? 'Closed it' : `Clicked "${c.action}"`,
      correct,
      seconds: Math.round((Date.now() - shownAt.current) / 1000),
    });

  return (
    <div className="modal-backdrop">
      <div className="modal scam-modal" role="dialog" aria-modal="true" aria-label="Pop-up">
        {!clicked ? (
          <>
            <button
              className="scam-close"
              aria-label="Close pop-up"
              onClick={() => {
                log(true);
                onClosed(true);
              }}
            >
              ✕
            </button>
            <p className="scam-body">{c.body}</p>
            <button
              className="scam-action"
              onClick={() => {
                log(false);
                setClicked(true);
              }}
            >
              {c.action}
            </button>
          </>
        ) : (
          <>
            <h2>🚩 Stop! That was a scam.</h2>
            <ul className="steps-list">
              {c.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p>When a pop-up like this shows up, close it with the ✕. Never type your card number into a pop-up.</p>
            <button className="primary" onClick={() => onClosed(false)} autoFocus>
              Got it
            </button>
          </>
        )}
      </div>
    </div>
  );
}
