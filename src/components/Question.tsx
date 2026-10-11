import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { formatMoney, parseMoney, type Cents } from '../lib/money';
import { addTrial, type ModuleId, type Skill, type Trial } from '../lib/log';
import { calculatorUsedSince } from '../lib/speech';
import { useSettings } from '../lib/settings';
import { ReadAloud } from './ReadAloud';

export interface Help {
  content: ReactNode;
  say: string;
}

export type CheckResult = { ok: true; label?: string } | { ok: false; message?: string };

interface BaseProps {
  module: ModuleId;
  skill: Skill;
  level: string;
  prompt: ReactNode;
  say: string;
  /** Plain-text version of the question for the data log. */
  logText: string;
  /** Three levels: hint, more help, answer. */
  helps: [Help, Help, Help];
  answerLabel: string;
  onNext: () => void;
  nextLabel?: string;
  /** Extra content shown once the answer is right. */
  solvedExtra?: ReactNode;
  onLogged?: (trial: Trial) => void;
}

type Props = BaseProps &
  (
    | { kind: 'money'; answer: Cents; inputLabel?: string }
    | { kind: 'number'; answer: number; inputLabel: string; unit: string }
    | { kind: 'yesno'; answer: boolean; yesLabel?: string; noLabel?: string }
    | {
        kind: 'custom';
        check: (value: unknown) => CheckResult;
        render: (submit: (value: unknown) => void, solved: boolean) => ReactNode;
      }
  );

const HELP_TITLES = ['Hint', 'More help', 'Answer'];
const HELP_BUTTONS = ['Hint', 'More help', 'Show answer'];

export function Question(props: Props) {
  const { settings } = useSettings();
  const maxHelp = settings.maxHelp;
  const [help, setHelp] = useState(() => Math.min(settings.startHelp, maxHelp));
  const [attempts, setAttempts] = useState(0);
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'good' | 'bad' | 'info'; msg: string } | null>(null);
  const [solved, setSolved] = useState(false);
  const [helpReady, setHelpReady] = useState(settings.helpDelay === 0);
  const startedAt = useRef(Date.now());
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (helpReady) return;
    const t = setTimeout(() => setHelpReady(true), settings.helpDelay * 1000);
    return () => clearTimeout(t);
  }, [helpReady, settings.helpDelay]);

  // Move focus to Next so Enter continues. Deferred so it runs after the browser settles focus.
  useEffect(() => {
    if (!solved) return;
    const t = setTimeout(() => nextRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [solved]);

  function grade(ok: boolean, message?: string, label = props.answerLabel) {
    const n = attempts + 1;
    setAttempts(n);
    if (ok) {
      setSolved(true);
      setFeedback({ tone: 'good', msg: `Correct. ${label}.` });
      const trial: Trial = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        at: new Date().toISOString(),
        nickname: settings.nickname,
        module: props.module,
        skill: props.skill,
        level: props.level,
        question: props.logText,
        answer: label,
        attempts: n,
        helpLevel: help as 0 | 1 | 2 | 3,
        seconds: Math.round((Date.now() - startedAt.current) / 1000),
        calculator: calculatorUsedSince(startedAt.current),
        independent: n === 1 && help === 0,
      };
      addTrial(trial);
      props.onLogged?.(trial);
      return;
    }
    let msg = message ?? 'Not quite. Try again.';
    if (settings.autoHintOnWrong && help === 0 && maxHelp >= 1) {
      setHelp(1);
      msg += ' Here is a hint.';
    }
    setFeedback({ tone: 'bad', msg });
  }

  function submitText(e: FormEvent) {
    e.preventDefault();
    if (solved) return;
    if (props.kind === 'number') {
      if (!/^\s*\d+\s*$/.test(text)) {
        setFeedback({ tone: 'info', msg: text.trim() ? 'Type a whole number, like 6.' : 'Type your answer first.' });
        return;
      }
      grade(Number(text) === props.answer);
      return;
    }
    if (props.kind !== 'money') return;
    const r = parseMoney(text);
    if (!r.ok) {
      const msg =
        r.reason === 'oneDecimal'
          ? `Money uses 2 numbers after the dot. Did you mean ${formatMoney(r.suggestion)}?`
          : r.reason === 'empty'
            ? 'Type your answer first.'
            : r.reason === 'tooManyDecimals'
              ? 'Money only has 2 numbers after the dot.'
              : 'Type a money amount, like 12.50.';
      setFeedback({ tone: 'info', msg });
      return;
    }
    grade(r.cents === props.answer);
  }

  function submitCustom(value: unknown) {
    if (props.kind !== 'custom' || solved) return;
    const r = props.check(value);
    if (r.ok) grade(true, undefined, r.label);
    else grade(false, r.message);
  }

  return (
    <section className="question">
      <div className="q-prompt">
        <div className="q-prompt-body">{props.prompt}</div>
        <ReadAloud text={props.say} />
      </div>

      {(props.kind === 'money' || props.kind === 'number') && (
        <form className="answer-row" onSubmit={submitText}>
          <label htmlFor="answer">{props.inputLabel ?? 'Your answer'}</label>
          <div className="money-input">
            {props.kind === 'money' && <span aria-hidden="true">$</span>}
            <input
              id="answer"
              inputMode={props.kind === 'money' ? 'decimal' : 'numeric'}
              autoComplete="off"
              autoFocus
              value={text}
              readOnly={solved}
              onChange={(e) => setText(e.target.value)}
            />
            {props.kind === 'number' && <span className="input-unit">{props.unit}</span>}
          </div>
          <button type="submit" className="primary" disabled={solved}>
            Check
          </button>
        </form>
      )}

      {props.kind === 'yesno' && (
        <div className="yesno">
          <button type="button" className="big-choice" disabled={solved} onClick={() => grade(props.answer, 'Not quite. Look again.')}>
            {props.yesLabel ?? "Yes, it's right"}
          </button>
          <button type="button" className="big-choice" disabled={solved} onClick={() => grade(!props.answer, 'Not quite. Look again.')}>
            {props.noLabel ?? "No, it's wrong"}
          </button>
        </div>
      )}

      {props.kind === 'custom' && props.render(submitCustom, solved)}

      {feedback && (
        <p className={`feedback ${feedback.tone}`} role="status">
          {feedback.tone === 'good' ? '✓ ' : ''}
          {feedback.msg}
        </p>
      )}

      {solved && props.solvedExtra}

      {(help > 0 || (!solved && maxHelp > 0)) && (
        <div className="help-area">
          {props.helps.slice(0, help).map((h, i) => (
            <div key={i} className={`help-card level-${i + 1}`}>
              <div className="help-card-head">
                <h3>{HELP_TITLES[i]}</h3>
                <ReadAloud text={h.say} />
              </div>
              {h.content}
            </div>
          ))}
          {!solved && help < maxHelp && (
            <button type="button" className="help-btn" disabled={!helpReady} onClick={() => setHelp(help + 1)}>
              {helpReady ? `${HELP_BUTTONS[help]} (${help + 1} of ${maxHelp})` : 'Help (try it first)'}
            </button>
          )}
        </div>
      )}

      {solved && (
        <button ref={nextRef} type="button" className="primary next-btn" onClick={props.onNext}>
          {props.nextLabel ?? 'Next'} →
        </button>
      )}
    </section>
  );
}
