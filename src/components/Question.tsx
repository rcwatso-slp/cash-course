import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { formatMoney, parseMoney, type Cents } from '../lib/money';
import { addTrial, type ModuleId, type Skill, type Trial } from '../lib/log';
import { calculatorUsedSince } from '../lib/speech';
import { digitsOnly, matchesWord } from '../lib/text';
import { useSettings } from '../lib/settings';
import { ReadAloud } from './ReadAloud';

export interface Help {
  content: ReactNode;
  say: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  /** A big picture (emoji) shown above the label. */
  picture?: string;
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
  /** Names for the three help levels, e.g. a cueing hierarchy. Default: Hint, More help, Answer. */
  helpNames?: [string, string, string];
}

type Props = BaseProps &
  (
    | {
        kind: 'money';
        answer: Cents;
        inputLabel?: string;
        /** Accept answers this many cents off (rounding). His own answer is what counts. */
        tolerance?: Cents;
        onCorrect?: (cents: Cents) => void;
      }
    | { kind: 'number'; answer: number; inputLabel: string; unit: string }
    | { kind: 'yesno'; answer: boolean; yesLabel?: string; noLabel?: string }
    | {
        kind: 'choice';
        options: ChoiceOption[];
        answer: string;
        /** Hide the label under pictures (word-picture matching). */
        picturesOnly?: boolean;
      }
    | {
        /** A typed word or short phrase, checked leniently. */
        kind: 'text';
        accepted: string[];
        inputLabel?: string;
        /** Compare digits only (phone numbers, times). */
        digits?: boolean;
      }
    | {
        /** Spoken answers. The clinician marks it. */
        kind: 'scored';
        scoreLabels?: [string, string];
      }
    | {
        kind: 'custom';
        check: (value: unknown) => CheckResult;
        render: (submit: (value: unknown) => void, solved: boolean) => ReactNode;
      }
  );

const HELP_TITLES: [string, string, string] = ['Hint', 'More help', 'Answer'];
const HELP_BUTTONS: [string, string, string] = ['Hint', 'More help', 'Show answer'];

export function Question(props: Props) {
  const { settings } = useSettings();
  const maxHelp = settings.maxHelp;
  const [help, setHelp] = useState(() => Math.min(settings.startHelp, maxHelp));
  const [attempts, setAttempts] = useState(0);
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'good' | 'bad' | 'info'; msg: string } | null>(null);
  const [solved, setSolved] = useState(false);
  const [helpReady, setHelpReady] = useState(settings.helpDelay === 0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [gaveUp, setGaveUp] = useState(false);
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
      setFeedback({ tone: 'good', msg: props.kind === 'scored' ? `Marked correct. ${label}.` : `Correct. ${label}.` });
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
    let msg = message ?? (props.kind === 'scored' ? 'Not yet. Try a cue, or try again.' : 'Not quite. Try again.');
    if (settings.autoHintOnWrong && help === 0 && maxHelp >= 1) {
      setHelp(1);
      msg += ' Here is a hint.';
    }
    setFeedback({ tone: 'bad', msg });
  }

  /** End the item without a right answer (spoken tasks). Logged as not correct. */
  function moveOn() {
    if (solved) return;
    const trial: Trial = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: new Date().toISOString(),
      nickname: settings.nickname,
      module: props.module,
      skill: props.skill,
      level: props.level,
      question: props.logText,
      answer: `Not correct (answer: ${props.answerLabel})`,
      attempts: Math.max(attempts, 1),
      helpLevel: help as 0 | 1 | 2 | 3,
      seconds: Math.round((Date.now() - startedAt.current) / 1000),
      calculator: false,
      independent: false,
      correct: false,
    };
    addTrial(trial);
    props.onLogged?.(trial);
    setSolved(true);
    setGaveUp(true);
    setFeedback({ tone: 'info', msg: `Moved on. The answer was ${props.answerLabel}.` });
  }

  function submitText(e: FormEvent) {
    e.preventDefault();
    if (solved) return;
    if (props.kind === 'text') {
      if (!text.trim()) {
        setFeedback({ tone: 'info', msg: 'Type your answer first.' });
        return;
      }
      const ok = props.digits
        ? props.accepted.some((a) => digitsOnly(a) === digitsOnly(text))
        : matchesWord(text, props.accepted);
      grade(ok);
      return;
    }
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
    const ok = Math.abs(r.cents - props.answer) <= (props.tolerance ?? 0);
    if (ok) props.onCorrect?.(r.cents);
    grade(ok, undefined, ok && props.tolerance ? formatMoney(r.cents) : undefined);
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

      {(props.kind === 'money' || props.kind === 'number' || props.kind === 'text') && (
        <form className="answer-row" onSubmit={submitText}>
          <label htmlFor="answer">{props.inputLabel ?? 'Your answer'}</label>
          <div className="money-input">
            {props.kind === 'money' && <span aria-hidden="true">$</span>}
            <input
              id="answer"
              inputMode={props.kind === 'money' ? 'decimal' : props.kind === 'text' ? (props.digits ? 'numeric' : 'text') : 'numeric'}
              autoCapitalize="off"
              spellCheck={false}
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

      {props.kind === 'choice' && (
        <div className={`choice-grid ${props.options.some((o) => o.picture) ? 'with-pictures' : ''} n-${props.options.length}`}>
          {props.options.map((o) => {
            const wrong = wrongIds.includes(o.id);
            const right = solved && !gaveUp && o.id === props.answer;
            return (
              <button
                key={o.id}
                type="button"
                className={`choice-btn ${wrong ? 'tried' : ''} ${right ? 'right' : ''}`}
                disabled={solved || wrong}
                aria-label={o.label}
                onClick={() => {
                  if (o.id !== props.answer) setWrongIds([...wrongIds, o.id]);
                  grade(o.id === props.answer, wrong ? undefined : 'Not quite. Look again.');
                }}
              >
                {o.picture && (
                  <span className="choice-picture" aria-hidden="true">
                    {o.picture}
                  </span>
                )}
                {!(o.picture && props.picturesOnly) && <span className="choice-label">{o.label}</span>}
                {wrong && <span className="choice-mark" aria-hidden="true">✗</span>}
              </button>
            );
          })}
        </div>
      )}

      {props.kind === 'scored' && !solved && (
        <div className="scored">
          <p className="scored-label">Clinician: mark the answer</p>
          <div className="yesno">
            <button type="button" className="big-choice good-choice" onClick={() => grade(true)}>
              ✓ {props.scoreLabels?.[0] ?? 'Correct'}
            </button>
            <button type="button" className="big-choice" onClick={() => grade(false)}>
              ✗ {props.scoreLabels?.[1] ?? 'Not yet'}
            </button>
          </div>
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
                <h3>{(props.helpNames ?? HELP_TITLES)[i]}</h3>
                <ReadAloud text={h.say} />
              </div>
              {h.content}
            </div>
          ))}
          {!solved && help < maxHelp && (
            <button type="button" className="help-btn" disabled={!helpReady} onClick={() => setHelp(help + 1)}>
              {helpReady ? `${(props.helpNames ?? HELP_BUTTONS)[help]} (${help + 1} of ${maxHelp})` : 'Help (try it first)'}
            </button>
          )}
          {props.kind === 'scored' && !solved && (attempts > 0 || help > 0) && (
            <button type="button" className="button move-on-btn" onClick={moveOn}>
              Move on (mark not correct)
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
