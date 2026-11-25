import { useMemo } from 'react';
import { Question } from '../../components/Question';
import { strategyById, SWALLOW_SCENARIOS, type Strategy } from '../../data/hub/swallow';
import { SetFrame, TaskPage, useDeck, useSet } from '../../hub/Drill';
import { choiceHelps, makeOptions } from '../../hub/helps';
import { useSettings } from '../../lib/settings';

interface Item {
  q: string;
  options: string[];
  why: string;
  hint: string;
}

export default function SwallowStrategies() {
  const { settings } = useSettings();
  const key = settings.strategies.join(',');
  const mine = useMemo(() => key.split(',').map(strategyById).filter((s): s is Strategy => !!s), [key]);
  const items: Item[] = useMemo(
    () => [
      ...mine.map((s) => ({ q: s.ask, options: [s.short, ...s.foils], why: 'That is on your swallow plan.', hint: `Think about your swallow plan. ${s.emoji}` })),
      ...SWALLOW_SCENARIOS.map((s) => ({ q: s.q, options: s.options, why: s.why, hint: 'What is the safest thing to do?' })),
    ],
    [mine],
  );
  const draw = useDeck(items, 'swallow-strategies');
  const set = useSet(() => {
    const item = draw();
    return { item, ...makeOptions(item.options) };
  });
  const { item, options, answer } = set.item;
  const spoken = settings.responseMode === 'spoken';

  return (
    <TaskPage id="swallow-strategies" intro={mine.length ? 'Answer from your own swallow plan.' : undefined}>
      {mine.length === 0 && (
        <p className="notice">No personal strategies are set yet, so these are general safety questions. Your therapist can add yours in 🔒 Clinician → Settings → Swallowing.</p>
      )}
      <SetFrame set={set} noun="questions" bank={{ items, task: 'swallow-strategies' }}>
        <Question
          key={set.n}
          module="swallow-strategies"
          skill="swallowStrat"
          level={mine.length ? 'Own plan' : 'General'}
          prompt={<p className="q-text big-q">{item.q}</p>}
          say={spoken ? item.q : `${item.q} ${options.map((o) => o.label).join('? ')}?`}
          logText={item.q}
          answerLabel={item.options[0]}
          {...(spoken ? { kind: 'scored' as const } : { kind: 'choice' as const, options, answer })}
          helps={choiceHelps({ hint: item.hint, options, answer, why: item.why })}
          solvedExtra={<p className="why">{item.why}</p>}
          onLogged={set.onLogged}
          onNext={set.next}
        />
      </SetFrame>
    </TaskPage>
  );
}
