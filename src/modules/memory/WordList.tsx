import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ReadAloud } from '../../components/ReadAloud';
import { CATEGORY_NAMES, PICTURES, type PictureWord } from '../../data/hub/pictures';
import { TaskPage } from '../../hub/Drill';
import { logChoice } from '../../lib/log';
import { pick, shuffle } from '../../lib/random';
import { useSettings } from '../../lib/settings';
import { speak } from '../../lib/speech';
import { matchesWord } from '../../lib/text';
import { clock, useNow } from '../../lib/timers';

type Phase = 'study' | 'delay' | 'free' | 'cued' | 'recog' | 'results';

/** The last list, kept for delayed recall while the app stays open. */
let lastList: { words: PictureWord[]; at: number } | null = null;

export function makeWordList(n: number): PictureWord[] {
  // Mix of categories, no repeated category until needed, so each word gets its own category cue.
  const byCat = shuffle([...new Set(PICTURES.map((p) => p.category))]);
  const out: PictureWord[] = [];
  let i = 0;
  while (out.length < n && i < 200) {
    const cat = byCat[i % byCat.length];
    const choices = PICTURES.filter((p) => p.category === cat && p.level <= 2 && !out.includes(p));
    if (choices.length) out.push(pick(choices));
    i++;
  }
  return out;
}

export function makeFoils(words: PictureWord[], n: number): PictureWord[] {
  const cats = new Set(words.map((w) => w.category));
  const same = shuffle(PICTURES.filter((p) => cats.has(p.category) && !words.includes(p) && p.level <= 2));
  const other = shuffle(PICTURES.filter((p) => !words.includes(p) && !same.includes(p)));
  return [...same, ...other].slice(0, n);
}

export default function WordList() {
  const { settings } = useSettings();
  const level = settings.memoryLevel;
  const [words, setWords] = useState(() => makeWordList(settings.wordListLength));
  const [delayed, setDelayed] = useState(false);
  const [phase, setPhase] = useState<Phase>('study');
  const [free, setFree] = useState<string[]>([]);
  const [cued, setCued] = useState<string[]>([]);
  const [recogPool, setRecogPool] = useState<PictureWord[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [typed, setTyped] = useState('');
  const [startAt, setStartAt] = useState(Date.now());
  const [delayEnd, setDelayEnd] = useState(0);
  const now = useNow(phase === 'delay', 500);
  const playing = useRef<number[]>([]);

  useEffect(() => () => playing.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (phase === 'delay' && now >= delayEnd) setPhase('free');
  }, [phase, now, delayEnd]);

  const missed = words.filter((w) => !free.includes(w.word));
  const levelName = `${words.length} words${delayed ? ', delayed' : ''}`;

  function newList(list = makeWordList(settings.wordListLength), isDelayed = false) {
    setWords(list);
    setDelayed(isDelayed);
    setFree([]);
    setCued([]);
    setPicked([]);
    setTyped('');
    setStartAt(Date.now());
    setPhase(isDelayed ? 'free' : 'study');
  }

  function playList() {
    playing.current.forEach(clearTimeout);
    playing.current = words.map((w, i) => window.setTimeout(() => speak(w.word), i * 1800));
  }

  function startDelay() {
    lastList = { words, at: Date.now() };
    if (settings.recallDelay > 0) {
      setDelayEnd(Date.now() + settings.recallDelay * 1000);
      setPhase('delay');
    } else setPhase('free');
  }

  function finishFree() {
    log('wordRecall', free.length, words.length, 'Said the words without help');
    if (missed.length && settings.maxHelp > 0) setPhase('cued');
    else startRecog();
  }

  function finishCued() {
    log('wordCued', cued.length, missed.length, 'Remembered with a category cue');
    startRecog();
  }

  function startRecog() {
    setRecogPool(shuffle([...words, ...makeFoils(words, words.length)]));
    setPhase('recog');
  }

  function finishRecog() {
    const hits = picked.filter((p) => words.some((w) => w.word === p)).length;
    const falseAlarms = picked.length - hits;
    logChoice({
      nickname: settings.nickname,
      module: 'word-list',
      skill: 'wordRecog',
      level: levelName,
      question: `Pick the ${words.length} words from ${words.length * 2}`,
      answer: `${hits} of ${words.length} found, ${falseAlarms} extra`,
      correct: hits === words.length && falseAlarms === 0,
      seconds: Math.round((Date.now() - startAt) / 1000),
    });
    setPhase('results');
  }

  function log(skill: 'wordRecall' | 'wordCued', got: number, of: number, what: string) {
    logChoice({
      nickname: settings.nickname,
      module: 'word-list',
      skill,
      level: levelName,
      question: `${what}: ${words.map((w) => w.word).join(', ')}`,
      answer: `${got} of ${of}`,
      correct: got === of,
      seconds: Math.round((Date.now() - startAt) / 1000),
    });
  }

  function submitTyped(e: FormEvent) {
    e.preventDefault();
    const hit = words.find((w) => matchesWord(typed, [w.word, ...(w.also ?? [])]));
    if (hit && !free.includes(hit.word)) setFree([...free, hit.word]);
    setTyped('');
  }

  const toggle = (list: string[], set: (l: string[]) => void, word: string) =>
    set(list.includes(word) ? list.filter((x) => x !== word) : [...list, word]);

  return (
    <TaskPage id="word-list">
      {phase === 'study' && (
        <div className="question">
          <div className="q-prompt">
            <p className="q-text">
              {level === 3 ? 'Listen to the words. Try to remember all of them.' : 'Read these words out loud. Try to remember all of them.'}
            </p>
            <ReadAloud text={level === 3 ? 'Listen to the words. Try to remember all of them.' : 'Read these words out loud. Try to remember all of them.'} />
          </div>
          {level === 3 ? (
            <button className="primary wide" onClick={playList}>
              🔊 Play the list
            </button>
          ) : (
            <ul className={`word-cards ${level === 1 ? 'with-pictures' : ''}`}>
              {words.map((w) => (
                <li key={w.word}>
                  {level === 1 && <span className="word-pic">{w.emoji}</span>}
                  <span>{w.word}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="button-row">
            {level !== 3 && (
              <button className="button" onClick={playList}>
                🔊 Read the list to me
              </button>
            )}
            <button className="primary" onClick={startDelay}>
              I’m ready →
            </button>
          </div>
        </div>
      )}

      {phase === 'delay' && (
        <div className="question srt-card">
          <p className="q-text">The words are hidden now. Let’s wait a little.</p>
          <p className="big-timer">{clock((delayEnd - now) / 1000)}</p>
          <p>While you wait: count backward from 20. Or tell me what you had for breakfast.</p>
          <button className="button" onClick={() => setPhase('free')}>
            Skip the wait
          </button>
        </div>
      )}

      {phase === 'free' && (
        <div className="question">
          <div className="q-prompt">
            <p className="q-text">{delayed ? 'Earlier you learned some words.' : ''} Say all the words you remember. Any order.</p>
            <ReadAloud text={`${delayed ? 'Earlier you learned some words. ' : ''}Say all the words you remember, in any order.`} />
          </div>
          {settings.responseMode === 'typed' && (
            <form className="answer-row" onSubmit={submitTyped}>
              <label htmlFor="typed-word">Type a word, then press Enter</label>
              <div className="money-input">
                <input id="typed-word" autoComplete="off" autoCapitalize="off" autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} />
              </div>
              <button className="primary" type="submit">
                Add
              </button>
            </form>
          )}
          <p className="recall-count">
            Remembered: <b>{free.length}</b> of {words.length}
          </p>
          <ClinicianChecklist words={words} checked={free} onToggle={(w) => toggle(free, setFree, w)} />
          <button className="primary next-btn" onClick={finishFree}>
            That’s all I remember →
          </button>
        </div>
      )}

      {phase === 'cued' && (
        <div className="question">
          <div className="q-prompt">
            <p className="q-text">Here are some clues for the ones you missed.</p>
            <ReadAloud text={`Here are some clues. ${missed.map((w) => `One was a kind of ${CATEGORY_NAMES[w.category]}.`).join(' ')}`} />
          </div>
          <ul className="cue-list">
            {missed.map((w) => (
              <li key={w.word}>
                One was a kind of <b>{CATEGORY_NAMES[w.category]}</b>.
              </li>
            ))}
          </ul>
          <ClinicianChecklist words={missed} checked={cued} onToggle={(w) => toggle(cued, setCued, w)} />
          <button className="primary next-btn" onClick={finishCued}>
            Next →
          </button>
        </div>
      )}

      {phase === 'recog' && (
        <div className="question">
          <div className="q-prompt">
            <p className="q-text">Tap the words that were on the list. Then press Check.</p>
            <ReadAloud text="Tap the words that were on the list. Then press Check." />
          </div>
          <div className="choice-grid">
            {recogPool.map((w) => (
              <button key={w.word} className={`choice-btn ${picked.includes(w.word) ? 'selected' : ''}`} aria-pressed={picked.includes(w.word)} onClick={() => toggle(picked, setPicked, w.word)}>
                {level === 1 && <span className="choice-picture">{w.emoji}</span>}
                <span className="choice-label">{w.word}</span>
              </button>
            ))}
          </div>
          <button className="primary next-btn" onClick={finishRecog} disabled={picked.length === 0}>
            Check
          </button>
        </div>
      )}

      {phase === 'results' && (
        <div className="question">
          <h2>Results</h2>
          <ul className="steps-list">
            <li>
              Remembered on your own: <b>{free.length}</b> of {words.length}
            </li>
            {missed.length > 0 && (
              <li>
                With a clue: <b>{cued.length}</b> of {missed.length}
              </li>
            )}
            <li>
              Picked out of a list: <b>{picked.filter((p) => words.some((w) => w.word === p)).length}</b> of {words.length}
              {picked.some((p) => !words.some((w) => w.word === p)) && ` (plus ${picked.filter((p) => !words.some((w) => w.word === p)).length} that were not on the list)`}
            </li>
          </ul>
          <p>The list was: {words.map((w) => w.word).join(', ')}.</p>
          <div className="button-row">
            <button className="primary" onClick={() => newList()} autoFocus>
              New list
            </button>
          </div>
        </div>
      )}

      {phase === 'study' && lastList && !delayed && (
        <DelayedButton onStart={() => lastList && newList(lastList.words, true)} at={lastList.at} />
      )}
    </TaskPage>
  );
}

function DelayedButton({ at, onStart }: { at: number; onStart: () => void }) {
  const mins = Math.max(1, Math.round((Date.now() - at) / 60000));
  return (
    <div className="delayed-box">
      <p>
        <b>Delayed recall:</b> ask for the last list again ({mins} min ago).
      </p>
      <button className="button" onClick={onStart}>
        Start delayed recall
      </button>
    </div>
  );
}

/** Words the clinician checks off as the patient says them. Closed by default so the patient can't read them. */
export function ClinicianChecklist({ words, checked, onToggle }: { words: PictureWord[]; checked: string[]; onToggle: (w: string) => void }) {
  return (
    <details className="clinician-check">
      <summary>Clinician: check off words as they are said</summary>
      <div className="check-grid">
        {words.map((w) => (
          <button key={w.word} className={`check-btn ${checked.includes(w.word) ? 'on' : ''}`} aria-pressed={checked.includes(w.word)} onClick={() => onToggle(w.word)}>
            {checked.includes(w.word) ? '✓ ' : ''}
            {w.word}
          </button>
        ))}
      </div>
    </details>
  );
}
