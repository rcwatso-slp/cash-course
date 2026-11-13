import { useEffect, useState } from 'react';
import { Question } from '../../components/Question';
import { SetFrame, TaskPage, useSet } from '../../hub/Drill';
import { cell, DAYS, expectedBox, makePillTask, SLOT_NAMES, wrongCells, type Box, type Med, type Slot } from '../../lib/executive';
import { useSettings } from '../../lib/settings';

const ERASE = 'erase';

function Pill({ med }: { med: Med }) {
  return <span className="pill-dot" style={{ background: med.color }} aria-hidden="true" />;
}

function BoxGrid({ meds, slots, box, onTap, wrong, disabled }: { meds: Med[]; slots: Slot[]; box: Box; onTap?: (key: string) => void; wrong?: string[]; disabled?: boolean }) {
  return (
    <div className="pillbox" style={{ gridTemplateColumns: `auto repeat(7, minmax(0, 1fr))` }}>
      <span />
      {DAYS.map((d) => (
        <span key={d} className="pillbox-day">
          {d}
        </span>
      ))}
      {slots.map((s) => (
        <div key={s} className="pillbox-row" style={{ display: 'contents' }}>
          <span className="pillbox-slot">{SLOT_NAMES[s]}</span>
          {DAYS.map((d, di) => {
            const key = cell(di, s);
            const here = box[key] ?? {};
            const label = `${d} ${SLOT_NAMES[s]}: ${meds.map((m) => (here[m.id] ? `${here[m.id]} ${m.name}` : '')).filter(Boolean).join(', ') || 'empty'}`;
            return (
              <button key={key} className={`pillbox-cell ${wrong?.includes(key) ? 'wrong' : ''}`} onClick={() => onTap?.(key)} disabled={disabled || !onTap} aria-label={label}>
                {meds.flatMap((m) => Array.from({ length: here[m.id] ?? 0 }, (_, i) => <Pill key={`${m.id}${i}`} med={m} />))}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function PillOrganizer() {
  const { settings } = useSettings();
  const set = useSet(() => {
    const task = makePillTask(settings.executiveLevel);
    return { ...task, expected: expectedBox(task.meds, task.slots) };
  });
  const { meds, slots, expected } = set.item;
  const [box, setBox] = useState<Box>({});
  const [tool, setTool] = useState(meds[0].id);
  const [wrong, setWrong] = useState<string[]>([]);

  useEffect(() => {
    setBox({});
    setTool(meds[0].id);
    setWrong([]);
  }, [set.n, meds]);

  function tap(key: string) {
    setWrong([]);
    const here = { ...(box[key] ?? {}) };
    if (tool === ERASE) setBox({ ...box, [key]: {} });
    else {
      here[tool] = Math.min((here[tool] ?? 0) + 1, 3);
      setBox({ ...box, [key]: here });
    }
  }

  const firstMed = meds[0];
  const firstCells = Object.keys(expected).filter((k) => expected[k][firstMed.id]);

  return (
    <TaskPage id="pill-organizer" wide>
      <SetFrame set={set} noun="pill boxes">
        <Question
          key={set.n}
          module="pill-organizer"
          skill="pillBox"
          level={`${meds.length} medicine${meds.length > 1 ? 's' : ''}`}
          prompt={
            <div>
              <p className="q-text">Read the labels. Fill the pill box for the whole week.</p>
              <ul className="rx-labels">
                {meds.map((m) => (
                  <li key={m.id}>
                    <Pill med={m} /> <b>{m.name}</b>: {m.label}
                  </li>
                ))}
              </ul>
            </div>
          }
          say={`Read the labels. Fill the pill box for the whole week. ${meds.map((m) => `${m.name}: ${m.label}`).join(' ')}`}
          logText={meds.map((m) => `${m.name}: ${m.label}`).join(' | ')}
          answerLabel="The pill box is right"
          kind="custom"
          check={(v) => {
            const bad = wrongCells(v as Box, expected);
            setWrong(bad);
            return bad.length === 0 ? { ok: true } : { ok: false, message: bad.length === 1 ? '1 box is not right yet. It is outlined in red.' : `${bad.length} boxes are not right yet. They are outlined in red.` };
          }}
          render={(submit, solved) => (
            <div className="pill-work">
              {!solved && (
                <div className="pill-tools" role="group" aria-label="Pick a pill to put in">
                  {meds.map((m) => (
                    <button key={m.id} aria-pressed={tool === m.id} onClick={() => setTool(m.id)}>
                      <Pill med={m} /> {m.name}
                    </button>
                  ))}
                  <button aria-pressed={tool === ERASE} onClick={() => setTool(ERASE)}>
                    🧽 Empty a box
                  </button>
                </div>
              )}
              <BoxGrid meds={meds} slots={slots} box={box} onTap={tap} wrong={wrong} disabled={solved} />
              {!solved && (
                <div className="button-row">
                  <button className="button" onClick={() => setBox({})}>
                    Empty all
                  </button>
                  <button className="primary" onClick={() => submit(box)}>
                    Check
                  </button>
                </div>
              )}
            </div>
          )}
          helps={[
            {
              content: (
                <p>
                  Start with one label. <b>{firstMed.name}</b>: {firstMed.label} Which boxes need it?
                </p>
              ),
              say: `Start with one label. ${firstMed.name}: ${firstMed.label} Which boxes need it?`,
            },
            {
              content: (
                <p>
                  The {firstMed.name} goes in {firstCells.length} boxes:{' '}
                  {firstCells.map((k) => {
                    const [d, s] = k.split('-');
                    return `${DAYS[Number(d)]} ${SLOT_NAMES[s as Slot].toLowerCase()}`;
                  }).join(', ')}
                  .
                </p>
              ),
              say: `The ${firstMed.name} goes in ${firstCells.length} boxes.`,
            },
            {
              content: (
                <>
                  <p>This is how the box should look:</p>
                  <BoxGrid meds={meds} slots={slots} box={expected} />
                </>
              ),
              say: 'This is how the box should look. Copy it into your box.',
            },
          ]}
          onLogged={set.onLogged}
          onNext={set.next}
        />
      </SetFrame>
    </TaskPage>
  );
}
