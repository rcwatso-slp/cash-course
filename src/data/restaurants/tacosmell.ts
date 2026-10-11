import type { Restaurant, Size } from '../types';

const sml = (s: number, m: number, l: number): Size[] => [
  { label: 'Small', price: s },
  { label: 'Medium', price: m },
  { label: 'Large', price: l },
];

export const TACO_SMELL: Restaurant = {
  id: 'tacosmell',
  name: 'Taco Smell',
  tagline: 'Live Más-ish',
  emoji: '🌮',
  colors: { brand: '#4b1f74', logo: '#ffffff', accent: '#e83e8c', accentText: '#ffffff' },
  footer: 'Thanks for eating at Taco Smell! Live Más-ish.',
  blurb: 'Tacos, Crunchwraps and Baja Blast-Off.',
  categories: [
    { id: 'combos', label: 'Combos' },
    { id: 'tacos', label: 'Tacos' },
    { id: 'burritos', label: 'Burritos' },
    { id: 'specialties', label: 'Specialties' },
    { id: 'sides', label: 'Sides & Sweets' },
    { id: 'drinks', label: 'Drinks' },
  ],
  menu: [
    { id: 'cravings-box', name: 'Cravings Box', emoji: '📦', category: 'combos', price: 699, note: 'Crunchwrap, a taco, nacho fries and a medium drink' },
    { id: 'taco-combo', name: '3 Crunchy Tacos Combo', emoji: '🌮', category: 'combos', price: 799, note: '3 Crunchy Tacos and a large drink' },
    { id: 'burrito-combo', name: 'Burrito Supreme-o Combo', emoji: '🌯', category: 'combos', price: 849, note: 'Burrito Supreme-o, a Crunchy Taco and a large drink' },

    { id: 'crunchy-taco', name: 'Crunchy Taco', emoji: '🌮', category: 'tacos', price: 189 },
    { id: 'soft-taco', name: 'Soft Taco', emoji: '🌮', category: 'tacos', price: 189 },
    { id: 'locos-taco', name: 'Cheesy Chip Locos Taco', emoji: '🧀', category: 'tacos', price: 249, note: 'The shell is made of chips. Somehow.' },
    { id: 'chalupa', name: 'Chalupa Supreme-ish', emoji: '🌮', category: 'tacos', price: 449 },

    { id: 'bean-burrito', name: 'Bean Burrito', emoji: '🌯', category: 'burritos', price: 179 },
    { id: 'burrito-supreme', name: 'Burrito Supreme-o', emoji: '🌯', category: 'burritos', price: 429 },
    { id: 'beefy-burrito', name: 'Beefy 5-Layer Burrito', emoji: '🌯', category: 'burritos', price: 389, note: 'Five layers. We counted.' },

    { id: 'crunchwrap', name: 'Crunchwrap Extreme-o', emoji: '🥙', category: 'specialties', price: 549 },
    { id: 'quesadilla', name: 'Chicken Quesadilla', emoji: '🫓', category: 'specialties', price: 529 },
    { id: 'mexican-pizza', name: 'Mexican Pizza-ish', emoji: '🍕', category: 'specialties', price: 599 },
    { id: 'nachos-grande', name: 'Nachos SmellGrande', emoji: '🧀', category: 'specialties', price: 549 },

    { id: 'nacho-fries', name: 'Nacho Fries', emoji: '🍟', category: 'sides', sizes: [{ label: 'Regular', price: 229 }, { label: 'Large', price: 379 }] },
    { id: 'chips-cheese', name: 'Chips & Nacho Cheese', emoji: '🥣', category: 'sides', price: 199 },
    { id: 'twists', name: 'Cinnamon Twists', emoji: '🥨', category: 'sides', price: 129 },
    { id: 'cinna-bites', name: 'Cinna-Bites (4)', emoji: '🍩', category: 'sides', price: 299 },

    { id: 'baja', name: 'Baja Blast-Off', emoji: '🥤', category: 'drinks', sizes: sml(219, 259, 289), note: 'Tastes like a teal crayon (in a good way)' },
    { id: 'soda', name: 'Fountain Drink', emoji: '🥤', category: 'drinks', sizes: sml(219, 259, 289) },
    { id: 'freeze', name: 'Wild Cherry Freeze-o', emoji: '🍒', category: 'drinks', sizes: sml(279, 329, 369) },
  ],
};
