import type { OptionGroup, Restaurant, Size } from '../types';

const pizzaSizes = (s: number, m: number, l: number): Size[] => [
  { label: 'Small (10")', price: s },
  { label: 'Medium (12")', price: m },
  { label: 'Large (14")', price: l },
];

const crust: OptionGroup = {
  label: 'Crust',
  pick: 'one',
  choices: [{ label: 'Hand tossed', price: 0 }, { label: 'Thin crust', price: 0 }, { label: 'Stuffed-ish crust', price: 200 }],
};

const toppings: OptionGroup = {
  label: 'Toppings',
  pick: 'many',
  choices: [
    'Pepperoni', 'Sausage', 'Bacon', 'Ham', 'Mushrooms', 'Onions', 'Green peppers', 'Black olives', 'Jalapeños', 'Pineapple (controversial)', 'Extra cheese',
  ].map((label) => ({ label, price: 175 })),
};

export const DOMIN_OOPS: Restaurant = {
  id: 'dominoops',
  name: 'Domin-Oops',
  tagline: 'Pizza · Oops! We made a pizza.',
  emoji: '🍕',
  colors: { brand: '#0b5f8a', logo: '#ffffff', accent: '#e31837', accentText: '#ffffff' },
  footer: 'Thanks for ordering from Domin-Oops! No oopses were made. Probably.',
  blurb: 'Build your own pizza. Every topping costs extra.',
  categories: [
    { id: 'build', label: 'Build Your Own' },
    { id: 'specialty', label: 'Specialty Pizzas' },
    { id: 'sides', label: 'Sides' },
    { id: 'desserts', label: 'Desserts' },
    { id: 'drinks', label: 'Drinks' },
  ],
  menu: [
    { id: 'byo', name: 'Build Your Own Pizza', emoji: '🍕', category: 'build', sizes: pizzaSizes(999, 1299, 1599), options: [crust, toppings], note: 'Cheese pizza. Add toppings for $1.75 each.' },

    { id: 'oops-cheese', name: 'Oops! All Cheese', emoji: '🧀', category: 'specialty', sizes: pizzaSizes(1199, 1499, 1799), note: 'Six cheeses. Zero regrets.' },
    { id: 'meatzzza', name: 'MeatZZZa', emoji: '🥓', category: 'specialty', sizes: pizzaSizes(1399, 1699, 1999), note: 'Pepperoni, ham, sausage, beef. A nap afterward.' },
    { id: 'veggie', name: 'Garden Party Veggie', emoji: '🫑', category: 'specialty', sizes: pizzaSizes(1299, 1599, 1899) },
    { id: 'hawaiian', name: 'Honolulu-ish Hawaiian', emoji: '🍍', category: 'specialty', sizes: pizzaSizes(1299, 1599, 1899), note: 'Ham and pineapple. Let the debate begin.' },

    { id: 'twists', name: 'Bread Twists (8)', emoji: '🥖', category: 'sides', price: 699 },
    { id: 'wings', name: 'Wings (8)', emoji: '🍗', category: 'sides', price: 999 },
    { id: 'cheesy-bread', name: 'Stuffed Cheesy Bread', emoji: '🧀', category: 'sides', price: 799 },
    { id: 'salad', name: 'Garden Salad', emoji: '🥗', category: 'sides', price: 649 },

    { id: 'lava-cake', name: 'Lava Crunch Cakes (2)', emoji: '🍫', category: 'desserts', price: 699 },
    { id: 'cinna-stix', name: 'Cinna-Stix (8)', emoji: '🥨', category: 'desserts', price: 699 },
    { id: 'brownie', name: 'Marbled Brownie (9 pieces)', emoji: '🟫', category: 'desserts', price: 799 },

    { id: 'two-liter', name: '2-Liter Soda', emoji: '🍾', category: 'drinks', price: 379 },
    { id: 'bottle', name: '20 oz Soda', emoji: '🥤', category: 'drinks', price: 249 },
    { id: 'water', name: 'Bottled Water', emoji: '💧', category: 'drinks', price: 219 },
  ],
};
