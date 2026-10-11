// McDoogles menu. Prices are in cents and roughly match real 2026 fast-food prices.
// Edit names and prices here; the app picks up changes automatically.
import type { Restaurant, Size } from '../types';

const sml = (s: number, m: number, l: number): Size[] => [
  { label: 'Small', price: s },
  { label: 'Medium', price: m },
  { label: 'Large', price: l },
];

export const MCDOOGLES: Restaurant = {
  id: 'mcdoogles',
  name: 'McDoogles',
  tagline: "i'm tolerating it",
  emoji: '🍔',
  colors: { brand: '#c8281b', logo: '#ffbd2e', accent: '#ffbd2e', accentText: '#3a2a00' },
  footer: 'Thanks for eating at McDoogles!',
  blurb: 'Burgers, McNuggies and fries.',
  categories: [
    { id: 'meals', label: 'Meals' },
    { id: 'burgers', label: 'Burgers' },
    { id: 'chicken', label: 'Chicken' },
    { id: 'sides', label: 'Sides' },
    { id: 'drinks', label: 'Drinks' },
    { id: 'desserts', label: 'Desserts' },
  ],
  menu: [
    { id: 'big-snack-meal', name: 'Big Snack Meal', emoji: '🍔', category: 'meals', price: 1099, note: 'Big Snack, medium fries and a medium drink' },
    { id: 'ponder-meal', name: 'Quarter Ponder Meal', emoji: '🍔', category: 'meals', price: 1149, note: 'Quarter Ponder, medium fries and a medium drink' },
    { id: 'nuggies-meal', name: '10 pc McNuggies Meal', emoji: '🍗', category: 'meals', price: 1079, note: '10 McNuggies, medium fries and a medium drink' },
    { id: 'chickin-meal', name: 'McChickin Meal', emoji: '🐔', category: 'meals', price: 899, note: 'McChickin, medium fries and a medium drink' },
    { id: 'happyish', name: 'Happy-ish Meal', emoji: '🎁', category: 'meals', price: 499, note: 'For the kid in you. Comes with a mystery toy.' },

    { id: 'big-snack', name: 'Big Snack', emoji: '🍔', category: 'burgers', price: 599, note: 'Two patties, special sauce, a suspicious amount of lettuce' },
    { id: 'quarter-ponder', name: 'Quarter Ponder', emoji: '🍔', category: 'burgers', price: 649, note: 'A burger for deep thinkers' },
    { id: 'double-trouble', name: 'McDouble Trouble', emoji: '🍔', category: 'burgers', price: 329 },
    { id: 'cheesy', name: 'Cheesy Burger', emoji: '🧀', category: 'burgers', price: 249 },
    { id: 'hamburger', name: 'Just a Hamburger', emoji: '🍔', category: 'burgers', price: 199, note: 'Nothing fancy.' },

    { id: 'nuggies-10', name: '10 pc McNuggies', emoji: '🍗', category: 'chicken', price: 579 },
    { id: 'nuggies-6', name: '6 pc McNuggies', emoji: '🍗', category: 'chicken', price: 429 },
    { id: 'chickin', name: 'McChickin', emoji: '🐔', category: 'chicken', price: 289 },
    { id: 'crispy', name: 'Crispy Chicken Sammich', emoji: '🥪', category: 'chicken', price: 549 },

    { id: 'fries', name: 'World Famous-ish Fries', emoji: '🍟', category: 'sides', sizes: sml(229, 349, 419) },
    { id: 'apple', name: 'Apple Slices', emoji: '🍎', category: 'sides', price: 129 },
    { id: 'salad', name: 'Side Salad', emoji: '🥗', category: 'sides', price: 299, note: 'Nobody orders this.' },

    { id: 'soda', name: 'Fountain Drink', emoji: '🥤', category: 'drinks', sizes: sml(149, 189, 229) },
    { id: 'tea', name: 'Sweet Tea', emoji: '🧊', category: 'drinks', sizes: sml(149, 189, 229) },
    { id: 'shake', name: 'Shaky Shake', emoji: '🥛', category: 'drinks', sizes: sml(349, 399, 469), note: 'Chocolate, vanilla or strawberry' },
    { id: 'oj', name: 'Orange Juice', emoji: '🍊', category: 'drinks', price: 279 },
    { id: 'water', name: 'Bottled Water', emoji: '💧', category: 'drinks', price: 179 },

    { id: 'mcflurrie', name: 'McFlurrie', emoji: '🍦', category: 'desserts', price: 429, note: 'The machine is working today!' },
    { id: 'pie', name: 'Baked Apple Pie', emoji: '🥧', category: 'desserts', price: 199 },
    { id: 'cookies', name: 'Cookies (3)', emoji: '🍪', category: 'desserts', price: 149 },
    { id: 'cone', name: 'Vanilla Cone', emoji: '🍦', category: 'desserts', price: 179 },
  ],
};
