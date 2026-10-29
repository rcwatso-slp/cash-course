// Printable homework: the same kinds of problems as the app, on paper, with an answer key.
import { RESTAURANTS } from '../data/restaurants';
import type { Restaurant } from '../data/types';
import { makeAffordProblem } from './budget';
import { makeDealProblem } from './deals';
import { formatMoney, sum } from './money';
import { levelPrice, makeChangeProblem, type ChangeLevel, type PriceLevel } from './problems';
import { randInt, shuffle } from './random';

export type WorksheetType = 'menu' | 'change' | 'afford' | 'deals';

export const WORKSHEET_TYPES: Record<WorksheetType, string> = {
  menu: 'Order from a menu (add up the total)',
  change: 'Make change',
  afford: 'Can I afford it?',
  deals: 'Which is the better deal?',
};

export interface WorksheetOptions {
  type: WorksheetType;
  count: number;
  restaurantId: string;
  answerKey: boolean;
}

export interface WorksheetProblem {
  text: string;
  /** The answer line under the problem, e.g. "Total: $________" */
  blank: string;
  answer: string;
}

export interface Worksheet {
  title: string;
  instructions: string;
  menu?: { restaurant: Restaurant; items: { name: string; price: string }[] };
  problems: WorksheetProblem[];
  /** An open-ended task at the end, with no single answer */
  challenge?: string;
}

const m = formatMoney;

export function makeWorksheet(opts: WorksheetOptions, level: PriceLevel, changeLevel: ChangeLevel): Worksheet {
  const n = opts.count;
  switch (opts.type) {
    case 'change':
      return {
        title: 'Make Change',
        instructions: 'Work out how much change you get back. Count up from the price to what you paid.',
        problems: Array.from({ length: n }, () => {
          const { price, paid } = makeChangeProblem(changeLevel);
          return { text: `The price is ${m(price)}. You pay with ${m(paid)}.`, blank: 'Change: $__________', answer: m(paid - price) };
        }),
      };
    case 'afford':
      return {
        title: 'Can I Afford It?',
        instructions: 'Circle Yes or No. If yes, write how much you have left. If no, write how much more you need.',
        problems: Array.from({ length: n }, () => {
          const p = makeAffordProblem(level);
          const what = p.items.map((i) => `${i.name} (${m(i.price)})`).join(' and ');
          return {
            text: `You have ${m(p.have)}. You want ${what}. Can you buy ${p.items.length > 1 ? 'both' : 'it'}?`,
            blank: 'Yes  /  No        Left over or need: $__________',
            answer: p.canBuy ? `Yes, ${m(p.have - p.cost)} left` : `No, need ${m(p.cost - p.have)} more`,
          };
        }),
      };
    case 'deals':
      return {
        title: 'Better Deal?',
        instructions: 'Work out what you would pay at each store. Write the store with the better deal and how much you save.',
        problems: Array.from({ length: n }, () => {
          const p = makeDealProblem(level);
          const signs = p.options.map((o) => `${o.store}: ${o.sign}${o.saleBadge ? ` (${o.saleBadge})` : ''}`).join('   vs   ');
          return {
            text: `${p.item.name}, you need ${p.need}.   ${signs}`,
            blank: 'Better deal: ________________     You save: $__________',
            answer: `${p.options[p.better].store}, save ${m(p.save)}`,
          };
        }),
      };
    case 'menu': {
      const restaurant = RESTAURANTS.find((r) => r.id === opts.restaurantId) ?? RESTAURANTS[0];
      // Single-price items, plus each size as its own line ("Medium Fries").
      const items = restaurant.menu.flatMap((it) =>
        it.sizes
          ? it.sizes.map((s) => ({ name: `${s.label.replace(/\s*\(.*\)$/, '')} ${it.name}`, cents: levelPrice(s.price, level) }))
          : it.price
            ? [{ name: it.name, cents: levelPrice(it.price, level) }]
            : [],
      );
      const perOrder = level <= 1 ? 2 : level === 2 ? 3 : randInt(3, 4);
      return {
        title: `${restaurant.name} Menu Math`,
        instructions: 'Find each item on the menu. Add up the prices and write the total.',
        menu: { restaurant, items: items.map((i) => ({ name: i.name, price: m(i.cents) })) },
        problems: Array.from({ length: n }, () => {
          const order = shuffle(items).slice(0, perOrder);
          return { text: order.map((o) => o.name).join(' + '), blank: 'Total: $__________', answer: m(sum(order.map((o) => o.cents))) };
        }),
        challenge: `You have $15.00. Pick items from the menu that cost $15.00 or less in all. Write them and the total. How much do you have left?`,
      };
    }
  }
}
