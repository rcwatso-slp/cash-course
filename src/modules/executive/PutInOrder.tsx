import { useEffect, useMemo, useState } from 'react';
import { Question } from '../../components/Question';
import { sequencesFor } from '../../data/hub/sequences';
import { SetFrame, TaskPage, useDeck, useSet } from '../../hub/Drill';
import { firstWrongStep } from '../../lib/executive';
import { shuffle } from '../../lib/random';
import { useSettings } from '../../lib/settings';

export default function PutInOrder() {
  const { settings } = useSettings();
  const items = useMemo(() => sequencesFor(settings.executiveLevel), [settings.executiveLevel]);
  const draw = useDeck(items, 'put-in-order');
  const set = useSet(() => {
    const seq = draw();
    let mixed = shuffle(seq.steps);
    while (mixed.length > 1 && mixed.every((s, i) => s === seq.steps[i])) mixed = shuffle(seq.steps);
    return { seq, mixed };
  });
  const { seq, mixed } = set.item;
  const [placed, setPlaced] = useState<string[]>([]);

  useEffect(() => setPlaced([]), [set.n]);

  const left = mixed.filter((s) => !placed.includes(s));
  const half = seq.steps.slice(0, Math.ceil(seq.steps.length / 2));

  return (
    <TaskPage id="put-in-order">
      <SetFrame set={set} noun="tasks" bank={{ items, task: 'put-in-order' }}>
        <Question
          key={set.n}
          module="put-in-order"
          skill="sequencing"
          level={`${seq.steps.length} steps`}
          prompt={
            <p className="q-text">
              {seq.emoji} <b>{seq.title}</b>. Tap the steps in the order you would do them.
            </p>
          }
          say={`${seq.title}. Tap the steps in the order you would do them. The steps are: ${mixed.join('. ')}.`}
          logText={seq.title}
          answerLabel={`${seq.steps.length} steps in order`}
          kind="custom"
          check={(v) => {
            const wrong = firstWrongStep(v as string[], seq.steps);
            if (wrong === -1) return { ok: true };
            // Keep the steps that are right; send the rest back.
            setPlaced(seq.steps.slice(0, wrong));
            return { ok: false, message: wrong === 0 ? 'The first step is not right yet. Think about what you do first.' : `The first ${wrong} ${wrong === 1 ? 'step is' : 'steps are'} right. Step ${wrong + 1} is not. Try again from there.` };
          }}
          render={(submit, solved) => (
            <div className="sequence">
              <ol className="seq-placed">
                {seq.steps.map((_, i) => (
                  <li key={i} className={placed[i] ? 'filled' : ''}>
                    <span className="seq-num">{i + 1}</span>
                    {placed[i] ? (
                      <button className="seq-step placed" disabled={solved} onClick={() => setPlaced(placed.slice(0, i).concat(placed.slice(i + 1)))}>
                        {placed[i]}
                      </button>
                    ) : (
                      <span className="seq-empty">…</span>
                    )}
                  </li>
                ))}
              </ol>
              {!solved && left.length > 0 && (
                <div className="seq-pool">
                  {left.map((s) => (
                    <button key={s} className="seq-step" onClick={() => setPlaced([...placed, s])}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {!solved && (
                <div className="button-row">
                  <button className="button" onClick={() => setPlaced([])} disabled={placed.length === 0}>
                    Start over
                  </button>
                  <button className="primary" onClick={() => submit(placed)} disabled={left.length > 0}>
                    Check
                  </button>
                </div>
              )}
              <p className="muted small">Tap a step in the list to take it back out.</p>
            </div>
          )}
          helps={[
            { content: <p>What do you do first? Start with: <b>{seq.steps[0]}</b>.</p>, say: `What do you do first? Start with: ${seq.steps[0]}.` },
            {
              content: (
                <ol className="steps-list">
                  {half.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                  <li>…</li>
                </ol>
              ),
              say: `The first steps are: ${half.join('. ')}.`,
            },
            {
              content: (
                <ol className="steps-list">
                  {seq.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              ),
              say: `The steps in order are: ${seq.steps.join('. ')}.`,
            },
          ]}
          onLogged={set.onLogged}
          onNext={set.next}
        />
      </SetFrame>
    </TaskPage>
  );
}
