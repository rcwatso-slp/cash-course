import { orderScript, type Line } from '../../lib/order';
import { speak } from '../../lib/speech';

/** Practice saying the order out loud before the math, the way you would at a real counter. */
export function SayOrder({ lines, tableService, onDone }: { lines: Line[]; tableService: boolean; onDone: () => void }) {
  const script = orderScript(lines, tableService);
  const followUp = tableService ? 'If they ask "Anything else?", you can say:' : 'If the cashier asks "Anything else?", you can say:';
  return (
    <section className="question say-order">
      <p className="q-text">{tableService ? 'Your server comes to the table. Tell them your order.' : "You're at the counter. Tell the cashier your order."}</p>
      <div className="speech-bubble">
        <p>“{script}”</p>
        <button type="button" className="button" onClick={() => speak(script)}>
          🔊 Hear it
        </button>
      </div>
      <p className="muted">{followUp}</p>
      <div className="speech-bubble small">
        <p>“No, that's all. Thank you.”</p>
        <button type="button" className="button" onClick={() => speak("No, that's all. Thank you.")}>
          🔊 Hear it
        </button>
      </div>
      <button className="primary next-btn" onClick={onDone} autoFocus>
        I said it →
      </button>
    </section>
  );
}
