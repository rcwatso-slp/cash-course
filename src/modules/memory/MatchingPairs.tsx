import { useEffect, useState } from 'react';
import { PICTURES } from '../../data/hub/pictures';
import { TaskPage } from '../../hub/Drill';
import { logChoice } from '../../lib/log';
import { shuffle } from '../../lib/random';
import { useSettings } from '../../lib/settings';

interface Card {
  key: number;
  word: string;
  emoji: string;
}

const PAIRS = { 1: 3, 2: 6, 3: 8 } as const;

function deal(pairs: number): Card[] {
  const picks = shuffle(PICTURES.filter((p) => p.level <= 2)).slice(0, pairs);
  return shuffle(picks.flatMap((p, i) => [0, 1].map((k) => ({ key: i * 2 + k, word: p.word, emoji: p.emoji }))));
}

export default function MatchingPairs() {
  const { settings } = useSettings();
  const pairs = PAIRS[settings.memoryLevel];
  const [cards, setCards] = useState(() => deal(pairs));
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [startAt, setStartAt] = useState(Date.now());
  const done = matched.length === pairs;

  // A pair that doesn't match stays face up for a moment, then turns back over.
  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open.map((k) => cards.find((c) => c.key === k)!);
    if (a.word === b.word) {
      setMatched((m) => [...m, a.word]);
      setOpen([]);
      return;
    }
    const t = setTimeout(() => setOpen([]), 1300);
    return () => clearTimeout(t);
  }, [open, cards]);

  useEffect(() => {
    if (!done) return;
    logChoice({
      nickname: settings.nickname,
      module: 'matching-pairs',
      skill: 'pairs',
      level: `${pairs} pairs`,
      question: `Find ${pairs} pairs`,
      answer: `${moves} turns`,
      correct: true,
      independent: moves <= pairs * 2,
      seconds: Math.round((Date.now() - startAt) / 1000),
    });
    // Log once when the board is finished.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function flip(card: Card) {
    if (open.length >= 2 || open.includes(card.key) || matched.includes(card.word)) return;
    const next = [...open, card.key];
    setOpen(next);
    if (next.length === 2) setMoves((m) => m + 1);
  }

  function again() {
    setCards(deal(pairs));
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setStartAt(Date.now());
  }

  return (
    <TaskPage id="matching-pairs" intro="Tap two cards to turn them over. Find the pairs that match.">
      <p className="set-progress">
        Pairs found: {matched.length} of {pairs} · Turns: {moves}
      </p>
      <div className={`pairs-grid n-${cards.length}`}>
        {cards.map((c) => {
          const up = open.includes(c.key) || matched.includes(c.word);
          return (
            <button
              key={c.key}
              className={`pair-card ${up ? 'up' : ''} ${matched.includes(c.word) ? 'matched' : ''}`}
              onClick={() => flip(c)}
              aria-label={up ? c.word : 'Face-down card'}
              disabled={matched.includes(c.word)}
            >
              {up ? <span className="pair-emoji">{c.emoji}</span> : <span className="pair-back" aria-hidden="true">?</span>}
            </button>
          );
        })}
      </div>
      {done && (
        <div className="question">
          <p className="feedback good">
            ✓ All {pairs} pairs found in {moves} turns.
          </p>
          <button className="primary next-btn" onClick={again} autoFocus>
            Play again →
          </button>
        </div>
      )}
    </TaskPage>
  );
}
