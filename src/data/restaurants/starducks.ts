import type { OptionGroup, Restaurant, Size } from '../types';

// Tall, Grande, Quacki
const sizes = (t: number, g: number, q: number): Size[] => [
  { label: 'Tall', price: t },
  { label: 'Grande', price: g },
  { label: 'Quacki', price: q },
];

const milk: OptionGroup = {
  label: 'Milk',
  pick: 'one',
  choices: [{ label: '2% milk', price: 0 }, { label: 'Whole milk', price: 0 }, { label: 'Oat milk', price: 70 }, { label: 'Almond milk', price: 70 }],
};

const addIns: OptionGroup = {
  label: 'Add-ins',
  pick: 'many',
  choices: [{ label: 'Extra shot', price: 125 }, { label: 'Vanilla syrup', price: 80 }, { label: 'Caramel drizzle', price: 80 }, { label: 'Cold foam', price: 125 }],
};

export const STARDUCKS: Restaurant = {
  id: 'starducks',
  name: 'Starducks',
  tagline: 'Coffee · Quack open a cold one',
  emoji: '🦆',
  colors: { brand: '#00704a', logo: '#ffffff', accent: '#1e3932', accentText: '#ffffff' },
  footer: 'Thanks for visiting Starducks! We spelled your name wrong on purpose.',
  blurb: 'Coffee, Frappuquackinos and cake pops. Sizes: Tall, Grande, Quacki.',
  categories: [
    { id: 'hot', label: 'Hot Drinks' },
    { id: 'cold', label: 'Cold Drinks' },
    { id: 'food', label: 'Bakery & Food' },
  ],
  menu: [
    { id: 'latte', name: 'Caffè Latte', emoji: '☕', category: 'hot', sizes: sizes(445, 515, 565), options: [milk, addIns] },
    { id: 'quackiato', name: 'Caramel Quackiato', emoji: '☕', category: 'hot', sizes: sizes(525, 595, 645), options: [milk, addIns] },
    { id: 'psl', name: 'Pumpkin Spice Quackuccino', emoji: '🎃', category: 'hot', sizes: sizes(595, 665, 715), options: [milk, addIns], note: "It's fall. You know the drill." },
    { id: 'hot-cocoa', name: 'Hot Chocolate', emoji: '🍫', category: 'hot', sizes: sizes(395, 455, 495), options: [milk] },
    { id: 'drip', name: 'Plain Coffee', emoji: '☕', category: 'hot', sizes: sizes(295, 345, 375), note: 'Just coffee. Bold move.' },

    { id: 'iced-coffee', name: 'Iced Coffee', emoji: '🧊', category: 'cold', sizes: sizes(395, 445, 495), options: [milk, addIns] },
    { id: 'frapp', name: 'Mocha Frappuquackino', emoji: '🥤', category: 'cold', sizes: sizes(545, 595, 645), options: [milk, addIns] },
    { id: 'pink', name: 'Pink Drink-ish', emoji: '🍓', category: 'cold', sizes: sizes(525, 575, 625) },
    { id: 'lemonade', name: 'Iced Lemonade', emoji: '🍋', category: 'cold', sizes: sizes(345, 395, 445) },

    { id: 'cake-pop', name: 'Cake Pop', emoji: '🍭', category: 'food', price: 325 },
    { id: 'croissant', name: 'Butter Croissant', emoji: '🥐', category: 'food', price: 375 },
    { id: 'muffin', name: 'Blueberry Muffin', emoji: '🫐', category: 'food', price: 345 },
    { id: 'cookie', name: 'Chocolate Chunk Cookie', emoji: '🍪', category: 'food', price: 295 },
    { id: 'sandwich', name: 'Bacon & Gouda Breakfast Sandwich', emoji: '🥪', category: 'food', price: 545 },
    { id: 'egg-bites', name: 'Egg Bites (2)', emoji: '🥚', category: 'food', price: 495 },
  ],
};
