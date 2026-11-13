import { Question } from '../../components/Question';
import { YES_NO } from '../../data/hub/language';
import { SetFrame, TaskPage, useDeck, useSet } from '../../hub/Drill';
import { useSettings } from '../../lib/settings';

export default function YesOrNo() {
  const { settings } = useSettings();
  const draw = useDeck(YES_NO.filter((q) => q.level === settings.languageLevel));
  const set = useSet(draw);
  const item = set.item;
  const answer = item.a ? 'Yes' : 'No';

  return (
    <TaskPage id="yes-or-no">
      <SetFrame set={set} noun="questions">
        <Question
          key={set.n}
          module="yes-or-no"
          skill="yesNo"
          level={`L${item.level}`}
          prompt={<p className="q-text big-q">{item.q}</p>}
          say={item.q}
          logText={item.q}
          answerLabel={answer}
          kind="yesno"
          answer={item.a}
          yesLabel="👍 Yes"
          noLabel="👎 No"
          helps={[
            { content: <p>Listen again, slowly. Picture it in your mind.</p>, say: `Listen again. ${item.q}` },
            { content: <p>Would that really happen? Is it true?</p>, say: 'Would that really happen? Is it true?' },
            { content: <p>The answer is <b>{answer}</b>.</p>, say: `The answer is ${answer}.` },
          ]}
          onLogged={set.onLogged}
          onNext={set.next}
        />
      </SetFrame>
    </TaskPage>
  );
}
