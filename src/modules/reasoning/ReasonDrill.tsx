import { Question } from '../../components/Question';
import { ANALOGIES, INFERENCE, ODD_ONE_OUT, SAFETY, WHATS_WRONG, type ReasonItem } from '../../data/hub/reasoning';
import { SetFrame, TaskPage, useDeck, useSet } from '../../hub/Drill';
import { choiceHelps, makeOptions } from '../../hub/helps';
import type { Skill } from '../../lib/log';
import { useSettings } from '../../lib/settings';

interface Props {
  id: string;
  skill: Skill;
  items: ReasonItem[];
  intro?: string;
  /** Shown above the prompt, e.g. "What's wrong with this sentence?" */
  lead?: string;
}

/** Every Reasoning task works the same way: read, pick the best answer, see why. */
function ReasonDrill({ id, skill, items, intro, lead }: Props) {
  const { settings } = useSettings();
  const pool = items.filter((i) => i.level === settings.reasoningLevel);
  const draw = useDeck(pool.length ? pool : items);
  const set = useSet(() => {
    const item = draw();
    return { item, ...makeOptions(item.options) };
  });
  const { item, options, answer } = set.item;
  const spoken = `${lead ? `${lead} ` : ''}${item.prompt.replace('___', 'blank')}`;

  return (
    <TaskPage id={id} intro={intro}>
      <SetFrame set={set} noun="questions">
        <Question
          key={set.n}
          module={id}
          skill={skill}
          level={`L${item.level}`}
          prompt={
            <>
              {lead && <p className="muted">{lead}</p>}
              <p className="q-text big-q">{item.prompt}</p>
            </>
          }
          say={`${spoken} ${options.map((o) => o.label).join('? ')}?`}
          logText={item.prompt}
          answerLabel={item.options[0]}
          kind="choice"
          options={options}
          answer={answer}
          helps={choiceHelps({ hint: item.hint, options, answer, why: item.why })}
          solvedExtra={<p className="why">{item.why}</p>}
          onLogged={set.onLogged}
          onNext={set.next}
        />
      </SetFrame>
    </TaskPage>
  );
}

export const OddOneOut = () => <ReasonDrill id="odd-one-out" skill="oddOneOut" items={ODD_ONE_OUT} intro="Three of these go together. Find the one that does not belong." />;
export const Analogies = () => <ReasonDrill id="analogies" skill="analogy" items={ANALOGIES} intro="Figure out how the first two go together. Then finish the second pair the same way." />;
export const Safety = () => <ReasonDrill id="safety" skill="safety" items={SAFETY} intro="Read the problem. Pick the best and safest thing to do." />;
export const Inference = () => <ReasonDrill id="inference" skill="inference" items={INFERENCE} intro="The answer is not said out loud. Use the clues." />;
export const WhatsWrong = () => <ReasonDrill id="whats-wrong" skill="absurdity" items={WHATS_WRONG} lead="What’s wrong with this?" intro="Something in each sentence does not make sense. Find it." />;
