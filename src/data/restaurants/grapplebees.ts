import type { Restaurant } from '../types';

export const GRAPPLEBEES: Restaurant = {
  id: 'grapplebees',
  name: "Grapplebee's",
  tagline: "Eatin' good in the neighborhood-ish",
  emoji: '🍎',
  colors: { brand: '#a3192e', logo: '#ffffff', accent: '#2f6f3e', accentText: '#ffffff' },
  footer: "Thanks for dining at Grapplebee's! Your server was Tyler.",
  blurb: 'Sit-down restaurant. The server brings the check and you leave a tip.',
  tableService: true,
  categories: [
    { id: 'apps', label: 'Appetizers' },
    { id: 'burgers', label: 'Burgers' },
    { id: 'entrees', label: 'Entrées' },
    { id: 'desserts', label: 'Desserts' },
    { id: 'drinks', label: 'Drinks' },
  ],
  menu: [
    { id: 'wings', name: 'Boneless Wings', emoji: '🍗', category: 'apps', price: 1399, note: 'Honey BBQ or Buffalo' },
    { id: 'mozz', name: 'Mozzarella Sticks', emoji: '🧀', category: 'apps', price: 1049, note: 'With marinara' },
    { id: 'dip', name: 'Spinach Artichoke Dip', emoji: '🥬', category: 'apps', price: 1199 },
    { id: 'fries-basket', name: 'Basket of Fries', emoji: '🍟', category: 'apps', price: 699 },

    { id: 'cheeseburger', name: 'Classic Cheeseburger', emoji: '🍔', category: 'burgers', price: 1399, note: 'Comes with fries' },
    { id: 'bacon-burger', name: 'Bacon Cheeseburger', emoji: '🥓', category: 'burgers', price: 1499, note: 'Comes with fries' },
    { id: 'quesadilla-burger', name: 'Quesadilla Burger-ish', emoji: '🍔', category: 'burgers', price: 1599, note: 'Half quesadilla, half burger, all confusing' },

    { id: 'tenders', name: 'Chicken Tenders Platter', emoji: '🍗', category: 'entrees', price: 1499, note: 'With fries and coleslaw' },
    { id: 'riblets', name: 'Riblets Platter', emoji: '🍖', category: 'entrees', price: 1699 },
    { id: 'sirloin', name: '8 oz Top Sirloin', emoji: '🥩', category: 'entrees', price: 2099, note: 'With 2 sides' },
    { id: 'alfredo', name: 'Chicken Alfredo', emoji: '🍝', category: 'entrees', price: 1749 },
    { id: 'shrimp', name: "Shrimp 'N Parm", emoji: '🍤', category: 'entrees', price: 1799 },
    { id: 'lime-chicken', name: 'Fiesta Lime Chicken-ish', emoji: '🍋', category: 'entrees', price: 1649 },

    { id: 'meltdown', name: 'Triple Chocolate Meltdown', emoji: '🍫', category: 'desserts', price: 999 },
    { id: 'brownie', name: 'Brownie Bite', emoji: '🟫', category: 'desserts', price: 349 },
    { id: 'cheesecake', name: 'Cheesecake', emoji: '🍰', category: 'desserts', price: 799 },

    { id: 'soda', name: 'Soda (free refills)', emoji: '🥤', category: 'drinks', price: 349 },
    { id: 'lemonade', name: 'Lemonade', emoji: '🍋', category: 'drinks', price: 399 },
    { id: 'shake', name: 'Milkshake', emoji: '🥛', category: 'drinks', price: 599 },
    { id: 'water', name: 'Water', emoji: '💧', category: 'drinks', price: 0, note: 'Free!' },
  ],
};
