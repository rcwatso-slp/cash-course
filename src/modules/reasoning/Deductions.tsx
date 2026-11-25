import { Question } from '../../components/Question';
import { SetFrame, TaskPage, useSet } from '../../hub/Drill';
import { makeOptions } from '../../hub/helps';
import { pick, shuffle } from '../../lib/random';
import { useSettings } from '../../lib/settings';
import { makePuzzle, type Clue } from '../../lib/workout';

interface Theme {
  /** "Each have a different drink" */
  noun: string;
  things: string[];
  /** "Ann drinks coffee." */
  has: (person: string, thing: string) => string;
  not: (person: string, thing: string) => string;
  ask: (thing: string) => string;
}

const THEMES: Theme[] = [
  { noun: 'pet', things: ['dog', 'cat', 'bird', 'fish'], has: (p, t) => `${p} has the ${t}.`, not: (p, t) => `${p} does not have the ${t}.`, ask: (t) => `Who has the ${t}?` },
  { noun: 'drink', things: ['coffee', 'tea', 'milk', 'juice'], has: (p, t) => `${p} drinks ${t}.`, not: (p, t) => `${p} does not drink ${t}.`, ask: (t) => `Who drinks ${t}?` },
  { noun: 'game', things: ['golf', 'tennis', 'chess', 'cards'], has: (p, t) => `${p} plays ${t}.`, not: (p, t) => `${p} does not play ${t}.`, ask: (t) => `Who plays ${t}?` },
  { noun: 'car color', things: ['red', 'blue', 'white', 'green'], has: (p, t) => `${p} drives the ${t} car.`, not: (p, t) => `${p} does not drive the ${t} car.`, ask: (t) => `Who drives the ${t} car?` },
  { noun: 'job', things: ['nurse', 'teacher', 'cook', 'pilot'], has: (p, t) => `${p} is the ${t}.`, not: (p, t) => `${p} is not the ${t}.`, ask: (t) => `Who is the ${t}?` },
  { noun: 'workday', things: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], has: (p, t) => `${p} works on ${t}.`, not: (p, t) => `${p} does not work on ${t}.`, ask: (t) => `Who works on ${t}?` },
];

const andList = (xs: string[]) => (xs.length <= 2 ? xs.join(' and ') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const orList = (xs: string[]) => (xs.length <= 2 ? xs.join(' or ') : `${xs.slice(0, -1).join(', ')} or ${xs[xs.length - 1]}`);

const NAMES = ['Ann', 'Bob', 'Carla', 'Dev', 'Eve', 'Frank', 'Gina', 'Hank', 'Iris', 'Jose', 'Kay', 'Leo'];
const PEOPLE_FOR = { 1: 2, 2: 3, 3: 4 } as const;

function makeItem(level: 1 | 2 | 3) {
  const n = PEOPLE_FOR[level];
  const theme = pick(THEMES);
  const things = shuffle(theme.things).slice(0, n);
  const people = shuffle(NAMES).slice(0, n);
  const puzzle = makePuzzle(n);
  const text = (c: Clue) => (c.has ? theme.has : theme.not)(people[c.person], things[c.thing]);
  return { people, things, puzzle, theme, clues: puzzle.clues.map(text), answer: people[puzzle.solution.indexOf(puzzle.askThing)], options: makeOptions((() => {
    const owner = people[puzzle.solution.indexOf(puzzle.askThing)];
    return [owner, ...people.filter((p) => p !== owner)];
  })()) };
}

/** A small yes/no grid filled in from the clues, used as the second help level. */
function ClueGrid({ people, things, clues }: { people: string[]; things: string[]; clues: Clue[] }) {
  const mark = (p: number, t: number) => {
    const c = clues.find((x) => x.person === p && x.thing === t);
    if (c) return c.has ? '✓' : '✗';
    // A "has" clue rules out the rest of that row and column.
    if (clues.some((x) => x.has && ((x.person === p && x.thing !== t) || (x.thing === t && x.person !== p)))) return '✗';
    return '';
  };
  return (
    <table className="data-table clue-grid">
      <thead>
        <tr>
          <th />
          {things.map((t) => (
            <th key={t}>{t}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {people.map((p, pi) => (
          <tr key={p}>
            <th>{p}</th>
            {things.map((t, ti) => (
              <td key={t}>{mark(pi, ti)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Deductions() {
  const { settings } = useSettings();
  const set = useSet(() => makeItem(settings.reasoningLevel));
  const { people, things, puzzle, theme, clues, answer, options } = set.item;
  const question = theme.ask(things[puzzle.askThing]);
  const setup = `${andList(people)} each have a different ${theme.noun}: ${orList(things)}.`;

  return (
    <TaskPage id="deductions" intro="Read every clue. Cross out who it can’t be. The one left is the answer.">
      <SetFrame set={set} noun="puzzles">
        <Question
          key={set.n}
          module="deductions"
          skill="deduction"
          level={`${people.length} people, ${clues.length} clues`}
          prompt={
            <div>
              <p className="muted">
                {setup}
              </p>
              <ul className="clue-list">
                {clues.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="q-text big-q">{question}</p>
            </div>
          }
          say={`${setup} ${clues.join(' ')} ${question}`}
          logText={`${clues.join(' ')} ${question}`}
          answerLabel={answer}
          helpNames={['Hint', 'Clue grid', 'Answer']}
          helps={[
            { content: <p>Go through the clues one at a time. Who can’t it be?</p>, say: 'Go through the clues one at a time. Who can not it be?' },
            { content: <><p>Here are the clues in a grid. ✓ = yes, ✗ = no.</p><ClueGrid people={people} things={things} clues={puzzle.clues} /></>, say: 'Here are the clues in a grid. Look for the only person who is not crossed out.' },
            { content: <p>It’s <b>{answer}</b>. Everyone else was ruled out by the clues.</p>, say: `It's ${answer}. Everyone else was ruled out by the clues.` },
          ]}
          kind="choice"
          options={options.options}
          answer={options.answer}
          onLogged={set.onLogged}
          onNext={set.next}
        />
      </SetFrame>
    </TaskPage>
  );
}
