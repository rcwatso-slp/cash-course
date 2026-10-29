import { useState } from 'react';
import { RED_FLAGS, SCAM_CASES, type ScamCase } from '../data/scams';
import { shuffle } from '../lib/random';
import { useSettings } from '../lib/settings';
import { Question } from '../components/Question';
import { SetDone, SetProgress } from '../components/SetDone';

/** Real or scam? Texts, emails, pop-ups and DMs, with the red flags explained after. */
export default function ScamCheck() {
  const { settings } = useSettings();
  const [deck, setDeck] = useState(() => shuffle(SCAM_CASES));
  const [n, setN] = useState(1);
  const [independent, setIndependent] = useState(0);
  const setLength = settings.setLength > 0 ? Math.min(settings.setLength, SCAM_CASES.length) : SCAM_CASES.length;
  const title = <h1 className="drill-title">🚩 Spot the Scam</h1>;

  if (n > setLength) {
    return (
      <div className="drill">
        {title}
        <SetDone
          count={setLength}
          independent={independent}
          onAgain={() => {
            setDeck(shuffle(SCAM_CASES));
            setN(1);
            setIndependent(0);
          }}
        />
      </div>
    );
  }

  const c = deck[n - 1];
  const flagsHelp = `Check for red flags: ${RED_FLAGS.join('. ')}.`;
  const askHelp = 'Ask yourself: Does it want money, a password, a PIN or a card number? Is it about something you really did? Is it rushing you?';
  const verdict = `${c.scam ? "It's a scam." : 'It looks real.'} ${c.reasons.join('. ')}.`;

  return (
    <div className="drill">
      {title}
      <SetProgress n={n} of={setLength} />
      <Question
        key={c.id}
        module="scams"
        skill="scam"
        level="all"
        kind="yesno"
        yesLabel="🚩 It's a scam"
        noLabel="✅ It looks real"
        answer={c.scam}
        answerLabel={c.scam ? "It's a scam" : 'It looks real'}
        prompt={
          <>
            <Message c={c} />
            <p className="q-text">Is this a scam?</p>
          </>
        }
        say={`${c.format === 'popup' ? 'A pop-up says' : `A message from ${c.from} says`}: ${c.body} Is this a scam?`}
        logText={c.id}
        helps={[
          {
            content: (
              <>
                <p>Check for red flags:</p>
                <ul className="steps-list">
                  {RED_FLAGS.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </>
            ),
            say: flagsHelp,
          },
          { content: <p>{askHelp}</p>, say: askHelp },
          { content: <p>{verdict}</p>, say: verdict },
        ]}
        solvedExtra={
          <div className="say-this">
            <p>
              <b>{c.scam ? '🚩 Red flags:' : '✅ Why it looks OK:'}</b>
            </p>
            <ul className="steps-list">
              {c.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p>
              {c.scam
                ? "What to do: don't click, don't reply, and don't send money or codes. Close it or delete it. If you're not sure, ask someone you trust."
                : 'Still: never share a password, PIN or card number, even when a message looks real.'}
            </p>
          </div>
        }
        onLogged={(t) => t.independent && setIndependent((x) => x + 1)}
        onNext={() => setN(n + 1)}
      />
    </div>
  );
}

/** Shows the message the way it would really look: a text, an email, a pop-up or a DM. */
export function Message({ c }: { c: ScamCase }) {
  if (c.format === 'popup') {
    return (
      <div className="msg-popup" role="img" aria-label={`Pop-up: ${c.body}`}>
        <span className="msg-popup-close" aria-hidden="true">
          ✕
        </span>
        <p className="msg-from">{c.from}</p>
        <p className="msg-popup-body">{c.body}</p>
        {c.action && <span className="msg-popup-action">{c.action}</span>}
      </div>
    );
  }
  if (c.format === 'email') {
    return (
      <div className="msg-email">
        <p className="msg-from">
          From: <b>{c.from}</b>
        </p>
        {c.subject && (
          <p className="msg-subject">
            Subject: <b>{c.subject}</b>
          </p>
        )}
        <p>{c.body}</p>
        {c.action && <span className="msg-link">{c.action}</span>}
      </div>
    );
  }
  return (
    <div className={`msg-phone msg-${c.format}`}>
      <p className="msg-from">{c.format === 'dm' ? `💬 ${c.from}` : `📱 ${c.from}`}</p>
      <p className="msg-bubble">{c.body}</p>
    </div>
  );
}
