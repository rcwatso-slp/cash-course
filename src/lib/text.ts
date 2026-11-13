// Lenient checking for typed words. Spelling is not what's being tested in most tasks,
// so case, spacing, punctuation, "a/the", plurals and a small typo are all accepted.

const ARTICLES = /^(a|an|the|some|my|your)\s+/;

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(ARTICLES, '');
}

export const digitsOnly = (s: string): string => s.replace(/\D/g, '');

export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

const singular = (w: string) => w.replace(/(ies)$/, 'y').replace(/(ches|shes|sses|xes)$/, (m) => m.slice(0, -2)).replace(/s$/, '');

/** Typos allowed for a word this long. Short words must be exact. */
const allowedTypos = (len: number) => (len >= 8 ? 2 : len >= 5 ? 1 : 0);

export function matchesWord(input: string, accepted: readonly string[]): boolean {
  const said = normalize(input);
  if (!said) return false;
  return accepted.some((target) => {
    const t = normalize(target);
    if (said === t || singular(said) === singular(t)) return true;
    return editDistance(said, t) <= allowedTypos(t.length);
  });
}
