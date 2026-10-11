import type { OptionGroup, Restaurant, Size } from '../types';

// The protein sets the price, like the real thing.
const proteins: Size[] = [
  { label: 'Chicken', price: 1025 },
  { label: 'Sofritas', price: 1025 },
  { label: 'Veggie', price: 1025 },
  { label: 'Carnitas', price: 1075 },
  { label: 'Barbacoa', price: 1195 },
  { label: 'Steak', price: 1195 },
];

const fillings: OptionGroup[] = [
  { label: 'Rice', pick: 'one', choices: [{ label: 'White rice', price: 0 }, { label: 'Brown rice', price: 0 }, { label: 'No rice', price: 0 }] },
  { label: 'Beans', pick: 'one', choices: [{ label: 'Black beans', price: 0 }, { label: 'Pinto beans', price: 0 }, { label: 'No beans', price: 0 }] },
  {
    label: 'Toppings (free)',
    pick: 'many',
    choices: ['Mild salsa', 'Hot salsa', 'Corn salsa', 'Cheese', 'Sour cream', 'Lettuce', 'Fajita veggies'].map((label) => ({ label, price: 0 })),
  },
  { label: 'Extras', pick: 'many', choices: [{ label: 'Guac', price: 295 }, { label: 'Queso', price: 185 }] },
];

export const CHIPOODLE: Restaurant = {
  id: 'chipoodle',
  name: 'Chipoodle',
  tagline: 'Mexican Grill · Food with integrity-ish',
  emoji: '🐩',
  colors: { brand: '#451400', logo: '#ffffff', accent: '#ac2318', accentText: '#ffffff' },
  footer: 'Thanks for eating at Chipoodle! Yes, guac is extra.',
  blurb: 'Build your own burrito or bowl. Guac is extra.',
  categories: [
    { id: 'entrees', label: 'Build Your Own' },
    { id: 'sides', label: 'Sides' },
    { id: 'drinks', label: 'Drinks' },
    { id: 'kids', label: 'Kids' },
  ],
  menu: [
    { id: 'burrito', name: 'Burrito', emoji: '🌯', category: 'entrees', sizes: proteins, sizePrompt: 'Pick a protein', options: fillings, note: 'Wrapped in a flour tortilla' },
    { id: 'bowl', name: 'Burrito Bowl', emoji: '🥣', category: 'entrees', sizes: proteins, sizePrompt: 'Pick a protein', options: fillings, note: 'Everything in a bowl. No tortilla.' },
    { id: 'tacos', name: 'Tacos (3)', emoji: '🌮', category: 'entrees', sizes: proteins, sizePrompt: 'Pick a protein', options: fillings },
    { id: 'salad', name: 'Salad', emoji: '🥗', category: 'entrees', sizes: proteins, sizePrompt: 'Pick a protein', options: fillings },
    { id: 'quesadilla', name: 'Quesadilla', emoji: '🫓', category: 'entrees', sizes: proteins.map((p) => ({ ...p, price: p.price + 100 })), sizePrompt: 'Pick a protein', note: 'Cheese and your protein, grilled' },

    { id: 'chips', name: 'Chips', emoji: '🌽', category: 'sides', price: 215 },
    { id: 'chips-guac', name: 'Chips & Guac', emoji: '🥑', category: 'sides', price: 510 },
    { id: 'chips-queso', name: 'Chips & Queso', emoji: '🧀', category: 'sides', price: 460 },
    { id: 'side-guac', name: 'Side of Guac', emoji: '🥑', category: 'sides', price: 295 },

    { id: 'fountain', name: 'Fountain Drink', emoji: '🥤', category: 'drinks', sizes: [{ label: 'Regular', price: 295 }, { label: 'Large', price: 345 }] },
    { id: 'mex-cola', name: 'Mexican Cola (glass bottle)', emoji: '🍾', category: 'drinks', price: 325 },
    { id: 'lemonade', name: 'Lemonade', emoji: '🍋', category: 'drinks', price: 345 },
    { id: 'water', name: 'Bottled Water', emoji: '💧', category: 'drinks', price: 295 },

    { id: 'kids-quesadilla', name: "Kid's Quesadilla", emoji: '🧒', category: 'kids', price: 575, note: 'With 2 sides and a juice' },
    { id: 'kids-tacos', name: "Kid's Build-Your-Own Tacos", emoji: '🧒', category: 'kids', price: 575 },
  ],
};
