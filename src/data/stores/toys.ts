// LEGGO sets and Star Warz merchandise, shared by every store.
// Each store sets its own price (full price, a Fallback sale, an Amazoom discount).
// No toy weapons: no lightsabers or blasters.
import type { Product } from '../types';

export const toy = (id: string): Toy => [...LEGGO_SETS, ...STARWARZ_MERCH].find((t) => t.id === id)!;

export type Toy = Omit<Product, 'price' | 'wasPrice' | 'category'> & { msrp: number };

export const LEGGO_SETS: Toy[] = [
  {
    id: 'falcon', name: 'LEGGO Star Warz Millennium Fallcon', brand: 'LEGGO', emoji: '🚀', msrp: 16999, pieces: 1351, ages: '9+',
    tags: ['leggo', 'leggo-starwarz'], rating: 5, reviews: 4812,
    about: ['The fastest hunk of junk in the galaxy-ish', 'Opens up to show the inside', 'Comes with 7 minifigures, including Chewbucka'],
  },
  {
    id: 'x-wing', name: "LEGGO Star Warz Luke's X-Wingz Fighter", brand: 'LEGGO', emoji: '✈️', msrp: 5999, pieces: 474, ages: '9+',
    tags: ['leggo', 'leggo-starwarz'], rating: 4.5, reviews: 2210,
    about: ['Wings fold into attack position', 'Includes R2-D-Tooth figure'],
  },
  {
    id: 'yodel-hut', name: "LEGGO Star Warz Baby Yodel's Hut", brand: 'LEGGO', emoji: '🛖', msrp: 4999, pieces: 372, ages: '8+',
    tags: ['leggo', 'leggo-starwarz'], rating: 4.5, reviews: 1388,
    about: ['A cozy swamp hut', 'Includes Baby Yodel and a bowl of soup'],
  },
  {
    id: 'vapor-helmet', name: 'LEGGO Star Warz Darth Vapor Helmet', brand: 'LEGGO', emoji: '🦹', msrp: 7999, pieces: 834, ages: '18+',
    tags: ['leggo', 'leggo-starwarz'], rating: 5, reviews: 3015,
    about: ['A display model for your shelf', 'Heavy breathing not included'],
  },
  {
    id: 'at-at', name: 'LEGGO Star Warz AT-AT Walker-Stalker', brand: 'LEGGO', emoji: '🦿', msrp: 17999, pieces: 1267, ages: '10+',
    tags: ['leggo', 'leggo-starwarz'], rating: 4.5, reviews: 977,
    about: ['Legs really move', 'Big enough to hold 9 minifigures'],
  },
  {
    id: 'tie', name: 'LEGGO Star Warz TIE Fighter-ish', brand: 'LEGGO', emoji: '🛸', msrp: 3999, pieces: 432, ages: '8+',
    tags: ['leggo', 'leggo-starwarz'], rating: 4, reviews: 845,
    about: ['Classic Imperial design', 'Includes a pilot minifigure'],
  },
  {
    id: 'battle-pack', name: 'LEGGO Star Warz Trooper Battle Pack', brand: 'LEGGO', emoji: '🪖', msrp: 1999, pieces: 98, ages: '7+',
    tags: ['leggo', 'leggo-starwarz'], rating: 4, reviews: 3320,
    about: ['4 trooper minifigures', 'Great for building an army slowly'],
  },
  {
    id: 'city-truck', name: 'LEGGO City Fire Truck', brand: 'LEGGO', emoji: '🚒', msrp: 3999, pieces: 255, ages: '5+',
    tags: ['leggo'], rating: 4.5, reviews: 1902,
    about: ['Ladder goes up and down', 'Includes 2 firefighters'],
  },
  {
    id: 'techno-car', name: 'LEGGO Techno Race Car', brand: 'LEGGO', emoji: '🏎️', msrp: 4999, pieces: 642, ages: '10+',
    tags: ['leggo'], rating: 4.5, reviews: 711,
    about: ['Working steering and moving pistons', 'For builders who like gears'],
  },
  {
    id: 'cabin', name: 'LEGGO Creater 3-in-1 Hunting Cabin', brand: 'LEGGO', emoji: '🏕️', msrp: 3499, pieces: 410, ages: '8+',
    tags: ['leggo'], rating: 4.5, reviews: 534,
    about: ['Build a cabin, a deer stand lookout or a canoe', 'Includes a deer figure'],
  },
  {
    id: 'brick-box', name: 'LEGGO Classic Big Box of Bricks', brand: 'LEGGO', emoji: '🧱', msrp: 2999, pieces: 790, ages: '4+',
    tags: ['leggo'], rating: 5, reviews: 6120,
    about: ['790 bricks in 33 colors', 'Build anything'],
  },
];

export const STARWARZ_MERCH: Toy[] = [
  {
    id: 'yodel-plush', name: 'Star Warz Baby Yodel Plush (11 in)', brand: 'Star Warz', emoji: '🧸', msrp: 2499,
    tags: ['starwarz'], rating: 5, reviews: 9811, about: ['Very soft', 'Big ears', 'Does not use the Force (we checked)'],
  },
  {
    id: 'chewbucka', name: 'Star Warz Chewbucka Plush', brand: 'Star Warz', emoji: '🐻', msrp: 2999,
    tags: ['starwarz'], rating: 4.5, reviews: 2210, about: ['Makes a roaring sound when you squeeze it'],
  },
  {
    id: 'r2-toothbrush', name: 'R2-D-Tooth Electric Toothbrush', brand: 'Star Warz', emoji: '🪥', msrp: 1999,
    tags: ['starwarz', 'toothbrush'], rating: 4, reviews: 1532, about: ['Beeps when 2 minutes are up', 'Uses 2 AA batteries'],
  },
  {
    id: 'sw-tee', name: 'Star Warz Logo T-Shirt', brand: 'Star Warz', emoji: '👕', msrp: 1999,
    tags: ['starwarz', 'shirt'], rating: 4.5, reviews: 4410, about: ['100% cotton', 'Sizes S–XXL'],
  },
  {
    id: 'sw-mug', name: 'Star Warz Darth Vapor Mug', brand: 'Star Warz', emoji: '☕', msrp: 1499,
    tags: ['starwarz'], rating: 4.5, reviews: 862, about: ['Holds 16 oz', 'Dishwasher safe'],
  },
  {
    id: 'sw-hoodie', name: 'Star Warz Galaxy Hoodie', brand: 'Star Warz', emoji: '🧥', msrp: 3999,
    tags: ['starwarz', 'hoodie'], rating: 4.5, reviews: 1210, about: ['Soft fleece inside', 'Kangaroo pocket'],
  },
  {
    id: 'sw-book', name: 'Star Warz: The Big Book of Ships', brand: 'DK Bookz', emoji: '📘', msrp: 2999,
    tags: ['starwarz', 'book'], rating: 5, reviews: 640, about: ['200 pages of ships, droids and planets'],
  },
];
