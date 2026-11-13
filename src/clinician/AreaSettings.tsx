import { useState } from 'react';
import { EXERCISES, STRATEGIES } from '../data/hub/swallow';
import { AREAS } from '../hub/areas';
import type { AreaId, ExerciseRx, Level, ResponseMode, SrtTarget } from '../hub/types';
import { useSettings, type Settings } from '../lib/settings';
import { Field, Select, Toggle } from './fields';

const LEVELS = (names: [string, string, string]): [Level, string][] => [
  [1, `1: ${names[0]}`],
  [2, `2: ${names[1]}`],
  [3, `3: ${names[2]}`],
];

const SRT_EXAMPLES: Omit<SrtTarget, 'id'>[] = [
  { question: 'What is your room number?', answer: 'Room 112' },
  { question: 'How do you call for help?', answer: 'Press the red call button' },
  { question: 'What do you do before you stand up?', answer: 'Lock my wheelchair brakes' },
  { question: 'What do you do before you swallow?', answer: 'Tuck my chin' },
  { question: 'What day does your family visit?', answer: 'Sunday' },
];

const newId = () => `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/** Settings for the hub areas, shown only for areas this patient uses. */
export function AreaSettings() {
  const { settings: s, update } = useSettings();
  const set = <K extends keyof Settings>(key: K) => (value: Settings[K]) => update({ [key]: value } as Partial<Settings>);
  const has = (a: AreaId) => s.areas.includes(a);

  function toggleArea(a: AreaId, on: boolean) {
    const next = on ? [...s.areas, a] : s.areas.filter((x) => x !== a);
    if (next.length) update({ areas: AREAS.map((x) => x.id).filter((id) => next.includes(id)) });
  }

  return (
    <>
      <section>
        <h3>Areas</h3>
        <Field label="Areas this patient sees" hint="With only one area, the app opens straight to it. Money only = the original Cash Course.">
          <div className="check-list">
            {AREAS.map((a) => (
              <label key={a.id}>
                <input type="checkbox" checked={has(a.id)} onChange={(e) => toggleArea(a.id, e.target.checked)} disabled={has(a.id) && s.areas.length === 1} />
                {a.emoji} {a.title} <span className="muted small">({a.targets})</span>
              </label>
            ))}
          </div>
        </Field>
        {(has('memory') || has('language') || has('swallow')) && (
          <Field label="How the patient answers" hint="Spoken: you mark each answer. Choose: they tap one of several. Typed: they type it (spelling is checked loosely).">
            <Select<ResponseMode>
              label="Response mode"
              value={s.responseMode}
              options={[
                ['spoken', 'Spoken (clinician marks it)'],
                ['choose', 'Choose from options'],
                ['typed', 'Typed'],
              ]}
              onChange={set('responseMode')}
            />
          </Field>
        )}
      </section>

      {has('memory') && (
        <section>
          <h3>🧠 Memory</h3>
          <Field label="Level" hint="Word List: pictures → words → heard only. Stories: short → long. Matching Pairs: 3, 6 or 8 pairs. Numbers: start at 3, 5 or 7 digits.">
            <Select<Level> label="Memory level" value={s.memoryLevel} options={LEVELS(['easier', 'middle', 'harder'])} onChange={set('memoryLevel')} />
          </Field>
          <Field label="Words in a Word List">
            <Select label="Words in list" value={s.wordListLength} options={[3, 4, 5, 6, 7, 8, 10].map((n) => [n, String(n)] as [number, string])} onChange={set('wordListLength')} />
          </Field>
          <Field label="Wait before recall" hint="Filler time between learning the list and saying it back.">
            <Select label="Recall delay" value={s.recallDelay} options={[[0, 'None'], [15, '15 seconds'], [30, '30 seconds'], [60, '1 minute'], [120, '2 minutes'], [300, '5 minutes']]} onChange={set('recallDelay')} />
          </Field>
          <Field label="Spaced retrieval targets" hint="One important fact per line: the question you ask, and the answer you want.">
            <SrtEditor targets={s.srtTargets} onChange={set('srtTargets')} />
          </Field>
        </section>
      )}

      {has('language') && (
        <section>
          <h3>💬 Language</h3>
          <Field label="Level" hint="Common words and short items → less common words and longer items.">
            <Select<Level> label="Language level" value={s.languageLevel} options={LEVELS(['common words, simple', 'everyday, two ideas', 'less common, complex'])} onChange={set('languageLevel')} />
          </Field>
          <Field label="Number of choices" hint="For picture and word choices.">
            <Select label="Number of choices" value={s.choiceCount} options={[[2, '2'], [3, '3'], [4, '4'], [6, '6']]} onChange={set('choiceCount')} />
          </Field>
        </section>
      )}

      {has('speech') && (
        <section>
          <h3>🗣️ Speech</h3>
          <Field label="Level" hint="Say It Clearly and the Pacing Board: words → phrases → sentences.">
            <Select<Level> label="Speech level" value={s.speechLevel} options={LEVELS(['words / short', 'phrases', 'sentences'])} onChange={set('speechLevel')} />
          </Field>
          <Field label="Microphone" hint="Turns on the loudness meter and record-and-listen-back. Sound is never saved or sent. The browser asks permission the first time.">
            <Toggle label="Microphone" checked={s.micOn} onChange={set('micOn')} />
          </Field>
          <Field label="Loudness line" hint="Where the target line sits on the meter (0–100). Easiest: press “set the line from this voice” on the Loud & Clear page.">
            <input type="range" min={20} max={95} value={s.loudTarget} onChange={(e) => update({ loudTarget: Number(e.target.value) })} aria-label="Loudness line" /> {s.loudTarget}
          </Field>
          <Field label="Pacing board speed" hint="How fast “Show me the pace” moves.">
            <Select label="Pace" value={s.paceMs} options={[[600, 'Faster (100 words/min)'], [900, 'Medium (about 65/min)'], [1200, 'Slow (50/min)'], [1500, 'Very slow (40/min)']]} onChange={set('paceMs')} />
          </Field>
        </section>
      )}

      {has('swallow') && (
        <section>
          <h3>🥄 Swallowing</h3>
          <Field label="Exercises" hint="Only the ones you check show for this patient. Set reps, hold time and sets.">
            <ExerciseEditor rx={s.exercises} onChange={set('exercises')} />
          </Field>
          <Field label="Strategies" hint="These go on the bedside card and in Remember My Strategies.">
            <div className="check-list">
              {STRATEGIES.map((st) => (
                <label key={st.id}>
                  <input
                    type="checkbox"
                    checked={s.strategies.includes(st.id)}
                    onChange={(e) => update({ strategies: e.target.checked ? [...s.strategies, st.id] : s.strategies.filter((x) => x !== st.id) })}
                  />
                  {st.emoji} {st.short}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Food (diet)" hint="As you want it printed, e.g. “Soft & bite-sized”.">
            <input className="text-input" maxLength={60} value={s.dietSolids} onChange={(e) => update({ dietSolids: e.target.value })} aria-label="Food diet" />
          </Field>
          <Field label="Drinks" hint="e.g. “Thin liquids” or “Mildly thick”.">
            <input className="text-input" maxLength={60} value={s.dietLiquids} onChange={(e) => update({ dietLiquids: e.target.value })} aria-label="Drinks" />
          </Field>
          <Field label="Other notes for the card" hint="No names or medical record numbers.">
            <textarea className="text-input" rows={2} maxLength={300} value={s.swallowNotes} onChange={(e) => update({ swallowNotes: e.target.value })} aria-label="Swallow notes" />
          </Field>
        </section>
      )}

      {has('reasoning') && (
        <section>
          <h3>🧩 Reasoning</h3>
          <Field label="Level">
            <Select<Level> label="Reasoning level" value={s.reasoningLevel} options={LEVELS(['concrete, everyday', 'two-step', 'abstract'])} onChange={set('reasoningLevel')} />
          </Field>
        </section>
      )}

      {has('executive') && (
        <section>
          <h3>📋 Thinking & Planning</h3>
          <Field label="Level" hint="Steps 3–4 → 4–5 → 5–7. Pill box 1 → 2 → 3 medicines. Bigger scanning pages and longer trails.">
            <Select<Level> label="Thinking level" value={s.executiveLevel} options={LEVELS(['fewer steps', 'more steps', 'most steps'])} onChange={set('executiveLevel')} />
          </Field>
        </section>
      )}
    </>
  );
}

function SrtEditor({ targets, onChange }: { targets: SrtTarget[]; onChange: (t: SrtTarget[]) => void }) {
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const edit = (id: string, patch: Partial<SrtTarget>) => onChange(targets.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const unused = SRT_EXAMPLES.filter((ex) => !targets.some((t) => t.question === ex.question));
  return (
    <div>
      {targets.map((t) => (
        <div key={t.id} className="srt-edit-row">
          <input className="text-input" value={t.question} onChange={(e) => edit(t.id, { question: e.target.value })} aria-label="Question" />
          <input className="text-input" value={t.answer} onChange={(e) => edit(t.id, { answer: e.target.value })} aria-label="Answer" />
          <button className="button" onClick={() => onChange(targets.filter((x) => x.id !== t.id))}>
            Remove
          </button>
        </div>
      ))}
      <div className="srt-edit-row">
        <input className="text-input" placeholder="Question, e.g. What is your room number?" value={q} onChange={(e) => setQ(e.target.value)} aria-label="New question" />
        <input className="text-input" placeholder="Answer, e.g. Room 112" value={a} onChange={(e) => setA(e.target.value)} aria-label="New answer" />
        <button
          className="primary"
          disabled={!q.trim() || !a.trim()}
          onClick={() => {
            onChange([...targets, { id: newId(), question: q.trim(), answer: a.trim() }]);
            setQ('');
            setA('');
          }}
        >
          Add
        </button>
      </div>
      {unused.length > 0 && (
        <p className="muted small">
          Examples:{' '}
          {unused.map((ex) => (
            <button key={ex.question} className="link-btn" onClick={() => (setQ(ex.question), setA(ex.answer))}>
              {ex.question}
            </button>
          ))}
        </p>
      )}
    </div>
  );
}

function ExerciseEditor({ rx, onChange }: { rx: ExerciseRx[]; onChange: (rx: ExerciseRx[]) => void }) {
  const num = (v: string, min: number, max: number) => Math.max(min, Math.min(max, Math.round(Number(v) || 0)));
  return (
    <div className="rx-edit">
      {EXERCISES.map((ex) => {
        const mine = rx.find((r) => r.id === ex.id);
        const patch = (p: Partial<ExerciseRx>) => onChange(rx.map((r) => (r.id === ex.id ? { ...r, ...p } : r)));
        return (
          <div key={ex.id} className="rx-edit-row">
            <label>
              <input
                type="checkbox"
                checked={!!mine}
                onChange={(e) =>
                  onChange(e.target.checked ? [...rx, { id: ex.id, reps: ex.reps, holdSec: ex.holdSec, sets: ex.sets }] : rx.filter((r) => r.id !== ex.id))
                }
              />
              <b>{ex.name}</b>
              {ex.aka && <span className="muted small">({ex.aka})</span>}
            </label>
            {mine && (
              <>
                <label>
                  Reps <input type="number" min={1} max={50} value={mine.reps} onChange={(e) => patch({ reps: num(e.target.value, 1, 50) })} />
                </label>
                <label>
                  Hold (s) <input type="number" min={0} max={120} value={mine.holdSec} onChange={(e) => patch({ holdSec: num(e.target.value, 0, 120) })} />
                </label>
                <label>
                  Sets <input type="number" min={1} max={10} value={mine.sets} onChange={(e) => patch({ sets: num(e.target.value, 1, 10) })} />
                </label>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
