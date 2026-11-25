// Writing dollar amounts in words, the way they go on a check: "Forty-two and 15/100".
import type { Cents } from './money';

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function under100(n: number): string {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
}

function under1000(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (!h) return under100(rest);
  return `${ONES[h]} hundred${rest ? ` ${under100(rest)}` : ''}`;
}

/** 0–999,999 in words, lowercase. */
export function numberWords(n: number): string {
  if (n < 1000) return under1000(n);
  const th = Math.floor(n / 1000);
  const rest = n % 1000;
  return `${under1000(th)} thousand${rest ? ` ${under1000(rest)}` : ''}`;
}

/** "Forty-two and 15/100" */
export function checkWords(cents: Cents): string {
  const dollars = Math.floor(cents / 100);
  const c = String(cents % 100).padStart(2, '0');
  const words = numberWords(dollars);
  return `${words[0].toUpperCase()}${words.slice(1)} and ${c}/100`;
}
