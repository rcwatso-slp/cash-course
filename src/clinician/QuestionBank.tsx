import { useState } from 'react';
import { areaById, taskById } from '../hub/areas';
import { banksFor } from '../hub/banks';
import { countNew, getSeen, resetSeen } from '../lib/seen';
import { useSettings } from '../lib/settings';

/** For each task: how many questions this patient hasn't had yet, and a way to start over. */
export function QuestionBank() {
  const { settings, activeId } = useSettings();
  const [, refresh] = useState(0);
  const who = settings.nickname || 'this patient';
  const banks = banksFor(settings).filter((b) => settings.areas.includes(b.area));

  if (banks.length === 0) return null;

  return (
    <section className="question-bank">
      <h3>Question bank</h3>
      <p className="muted">
        The app remembers which questions {who} has had, on this device, and gives new ones first. When every question at their level has
        been used, the ones from longest ago come back. Reset a task to start it over.
      </p>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>New at their level</th>
              <th>Used, all levels</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {banks.map((b) => {
              const seen = getSeen(activeId, b.task);
              const newHere = countNew(b.current, seen);
              const usedAll = b.all.length - countNew(b.all, seen);
              const task = taskById(b.task) ?? taskById(b.task.split('-')[0]);
              return (
                <tr key={b.task}>
                  <td>
                    {task?.emoji} {b.title ?? task?.title} <span className="muted small">({areaById(b.area)?.title})</span>
                  </td>
                  <td className={newHere === 0 ? 'bank-empty' : ''}>
                    {newHere} of {b.current.length}
                    {newHere === 0 ? ' — all used' : ''}
                  </td>
                  <td>
                    {usedAll} of {b.all.length}
                  </td>
                  <td>
                    <button
                      className="button"
                      disabled={usedAll === 0}
                      onClick={() => {
                        resetSeen(activeId, b.task);
                        refresh((x) => x + 1);
                      }}
                    >
                      Reset
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button
        className="button"
        onClick={() => {
          if (window.confirm(`Start every question bank over for ${who}? Their practice data is kept.`)) {
            resetSeen(activeId);
            refresh((x) => x + 1);
          }
        }}
      >
        Reset all for {who}
      </button>
    </section>
  );
}
