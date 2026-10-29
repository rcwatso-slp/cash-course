import { useState } from 'react';
import { readJSON } from '../lib/storage';
import { makeWorksheet, type WorksheetOptions } from '../lib/worksheets';
import { useSettings } from '../lib/settings';

export const WORKSHEET_KEY = 'cashcourse.worksheet.v1';

export const DEFAULT_WORKSHEET: WorksheetOptions = { type: 'change', count: 10, restaurantId: 'mcdoogles', answerKey: true };

/** A printable worksheet. Everything outside the sheet is hidden when printing. */
export default function WorksheetPage() {
  const { settings } = useSettings();
  const [opts] = useState(() => ({ ...DEFAULT_WORKSHEET, ...readJSON<Partial<WorksheetOptions>>(WORKSHEET_KEY, {}) }));
  const make = () => makeWorksheet(opts, settings.priceLevel, settings.changeLevel);
  const [sheet, setSheet] = useState(make);

  return (
    <div className="worksheet-page">
      <div className="no-print worksheet-tools">
        <button className="primary" onClick={() => window.print()}>
          🖨️ Print
        </button>
        <button className="button" onClick={() => setSheet(make())}>
          New problems
        </button>
        <span className="muted">Change the worksheet type in Clinician → Homework.</span>
      </div>

      <article className="worksheet">
        <header className="worksheet-head">
          <h1>{sheet.title}</h1>
          <p className="worksheet-name">
            Name: ______________________ &nbsp; Date: ____________
          </p>
        </header>
        <p className="worksheet-instructions">{sheet.instructions}</p>

        {sheet.menu && (
          <section className="worksheet-menu">
            <h2>
              {sheet.menu.restaurant.emoji} {sheet.menu.restaurant.name} Menu
            </h2>
            <ul>
              {sheet.menu.items.map((i) => (
                <li key={i.name}>
                  <span>{i.name}</span>
                  <span className="worksheet-dots" aria-hidden="true" />
                  <span>{i.price}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <ol className="worksheet-problems">
          {sheet.problems.map((p, i) => (
            <li key={i}>
              {p.text}
              <span className="worksheet-blank">{p.blank}</span>
            </li>
          ))}
        </ol>

        {sheet.challenge && (
          <section className="worksheet-challenge">
            <h2>Challenge</h2>
            <p>{sheet.challenge}</p>
            <div className="worksheet-lines" aria-hidden="true" />
          </section>
        )}
      </article>

      {opts.answerKey && (
        <article className="worksheet worksheet-key">
          <h2>Answer key: {sheet.title}</h2>
          <ol className="worksheet-answers">
            {sheet.problems.map((p, i) => (
              <li key={i}>{p.answer}</li>
            ))}
          </ol>
          {sheet.challenge && <p className="muted">The challenge has more than one right answer.</p>}
        </article>
      )}
    </div>
  );
}
