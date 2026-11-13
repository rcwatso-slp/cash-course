// Help levels for hub tasks. Same three steps as Cash Course: hint → more help → answer.
import type { ReactNode } from 'react';
import type { ChoiceOption, Help } from '../components/Question';
import { pick, shuffle } from '../lib/random';

type Helps = [Help, Help, Help];

const say = (text: string, content?: ReactNode): Help => ({ content: content ?? <p>{text}</p>, say: text });

/** Options from a list of strings where the FIRST one is right. Returns them shuffled. */
export function makeOptions(labels: string[], pictures?: (string | undefined)[]): { options: ChoiceOption[]; answer: string } {
  const options = labels.map((label, i) => ({ id: `o${i}`, label, picture: pictures?.[i] }));
  return { options: shuffle(options), answer: 'o0' };
}

/** Multiple choice: hint, then narrow to two, then the answer (with the reason, if any). */
export function choiceHelps(opts: { hint: string; options: ChoiceOption[]; answer: string; why?: string }): Helps {
  const right = opts.options.find((o) => o.id === opts.answer)!;
  const wrong = pick(opts.options.filter((o) => o.id !== opts.answer));
  const two = shuffle([right, wrong]);
  const answerText = `The answer is ${right.label}.${opts.why ? ` ${opts.why}` : ''}`;
  return [
    say(opts.hint),
    say(`It is one of these two: ${two[0].label} or ${two[1].label}.`, (
      <p>
        It is one of these two: <b>{two[0].label}</b> or <b>{two[1].label}</b>.
      </p>
    )),
    say(`${answerText} Tap ${right.label} to finish.`, (
      <>
        <p>
          The answer is <b>{right.label}</b>.
        </p>
        {opts.why && <p>{opts.why}</p>}
        <p className="help-finish">Tap {right.label} to finish.</p>
      </>
    )),
  ];
}

/** Naming cueing hierarchy: meaning → first sound → model. */
export const NAMING_CUES: [string, string, string] = ['Meaning cue', 'First sound', 'Say it with me'];

export function namingHelps(word: string, cue: string, sound: string, finish: string): Helps {
  return [
    say(cue),
    say(`It starts with “${sound}…”`, (
      <p className="sound-cue">
        It starts with <b>“{sound}…”</b>
      </p>
    )),
    say(`It’s ${word}. Say it with me: ${word}.`, (
      <>
        <p className="model-word">{word}</p>
        <p className="help-finish">{finish}</p>
      </>
    )),
  ];
}
