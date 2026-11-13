import { Question } from '../../components/Question';
import { CATEGORY_NAMES, picturesUpTo, PICTURES, type PictureWord } from '../../data/hub/pictures';
import { SetFrame, TaskPage, useDeck, useSet } from '../../hub/Drill';
import { makeOptions, NAMING_CUES, namingHelps } from '../../hub/helps';
import { shuffle } from '../../lib/random';
import { useSettings } from '../../lib/settings';

/** Wrong choices: same category first (harder), then anything else. */
export function pictureFoils(target: PictureWord, n: number, sameCategory = true): PictureWord[] {
  const same = shuffle(PICTURES.filter((p) => p.category === target.category && p.word !== target.word));
  const other = shuffle(PICTURES.filter((p) => p.category !== target.category));
  return (sameCategory ? [...same, ...other] : [...other]).slice(0, n);
}

export default function NameIt() {
  const { settings } = useSettings();
  const draw = useDeck(picturesUpTo(settings.languageLevel));
  const set = useSet(() => {
    const target = draw();
    const foils = pictureFoils(target, settings.choiceCount - 1, settings.languageLevel > 1);
    return { target, ...makeOptions([target.word, ...foils.map((f) => f.word)]) };
  });
  const { target, options, answer } = set.item;
  const mode = settings.responseMode;
  const instruction = mode === 'choose' ? 'What is this? Tap the word.' : mode === 'typed' ? 'What is this? Type the word.' : 'What is this? Say the word.';

  return (
    <TaskPage id="name-it">
      <SetFrame set={set} noun="pictures">
        <Question
          key={set.n}
          module="name-it"
          skill="naming"
          level={`L${settings.languageLevel} ${mode}`}
          prompt={
            <div className="picture-prompt">
              <span className="big-picture" role="img" aria-label="Picture to name">
                {target.emoji}
              </span>
              <p className="q-text">{instruction}</p>
            </div>
          }
          say={instruction}
          logText={`Name: ${target.word} (${CATEGORY_NAMES[target.category]})`}
          answerLabel={target.word}
          helpNames={NAMING_CUES}
          helps={namingHelps(target.word, target.cue, target.sound, mode === 'spoken' ? 'Say it, then mark it.' : mode === 'typed' ? `Type “${target.word}” to finish.` : `Tap “${target.word}” to finish.`)}
          {...(mode === 'spoken'
            ? { kind: 'scored' as const }
            : mode === 'typed'
              ? { kind: 'text' as const, accepted: [target.word, ...(target.also ?? [])], inputLabel: 'The word' }
              : { kind: 'choice' as const, options, answer })}
          onLogged={set.onLogged}
          onNext={set.next}
        />
      </SetFrame>
    </TaskPage>
  );
}
