// Bass Bro Shops: hunting and fishing gear, built around his deer-hunting interest.
// No weapons, ammo, bows, broadheads or knives.
import type { Store } from '../types';
import { product } from './build';

const p = product;

export const BASS_BRO: Store = {
  id: 'bassbro',
  name: 'Bass Bro Shops',
  tagline: 'Gear up for deer season',
  skin: 'bassbro',
  logo: '🦌',
  blurb: 'Camo, blaze orange, trail cameras, deer corn and fishing gear.',
  searchPlaceholder: 'Search Bass Bro Shops',
  addButton: 'Add to Cart',
  cartName: 'Cart',
  footer: 'Thanks for shopping Bass Bro Shops. Good luck this season!',
  categories: [
    { id: 'clothing', label: 'Hunting Clothes' },
    { id: 'boots', label: 'Boots' },
    { id: 'cameras', label: 'Trail Cameras & Optics' },
    { id: 'deer', label: 'Deer Feed & Scents' },
    { id: 'stands', label: 'Stands & Gear' },
    { id: 'fishing', label: 'Fishing' },
    { id: 'licenses', label: 'Licenses' },
  ],
  products: [
    p('blaze-vest', 'Blaze Orange Safety Vest', 'Red Head-ish', '🦺', 1499, 'clothing', ['blaze orange'], 4.5, 2310, ['Required in many states during deer season', 'One size fits most']),
    p('blaze-cap', 'Blaze Orange Hunting Cap', 'Red Head-ish', '🧢', 999, 'clothing', ['blaze orange', 'hat'], 4.5, 1890, ['So other hunters can see you']),
    p('blaze-jacket', 'Blaze Orange Insulated Jacket', 'Red Head-ish', '🧥', 7999, 'clothing', ['blaze orange', 'jacket'], 4.5, 640, ['Warm for cold mornings', 'Lots of pockets'], 9999),
    p('camo-hoodie', 'Camo Hoodie', 'Mossy Bark', '👕', 3999, 'clothing', ['camo', 'hoodie'], 4.5, 3402, ['Blends into the woods', 'Fleece lined']),
    p('camo-pants', 'Camo Cargo Pants', 'Mossy Bark', '👖', 4499, 'clothing', ['camo', 'pants'], 4, 1205, ['Quiet fabric', '6 pockets'], 4999),
    p('gloves', 'Insulated Hunting Gloves', 'Mossy Bark', '🧤', 2499, 'clothing', ['gloves'], 4.5, 980, ['Touchscreen fingertips']),
    p('wool-socks', 'Merino Wool Boot Socks, 2 pairs', 'Smart Woolly', '🧦', 2299, 'clothing', ['socks'], 5, 2120, ['Warm even when wet']),

    p('rubber-boots', 'Rubber Hunting Boots', 'Muck-ish', '🥾', 11999, 'boots', ['boots'], 4.5, 2780, ['Waterproof', 'Scent-free rubber'], 13999),
    p('insulated-boots', 'Insulated Hunting Boots, 800g', 'Rocky Road', '🥾', 12999, 'boots', ['boots'], 4.5, 1430, ['Warm to -20°F']),
    p('budget-boots', 'Bass Bro Basic Hunting Boots', 'Bass Bro', '🥾', 5999, 'boots', ['boots'], 4, 880, ['Waterproof', 'Good starter boot']),

    p('trail-cam', 'Bushwhack Trail Camera, 24MP', 'Bushwhack', '📷', 8999, 'cameras', ['trail camera'], 4.5, 5120, ['Night vision', 'See what walks past your stand']),
    p('trail-cam-basic', 'Bass Bro Basic Trail Camera', 'Bass Bro', '📷', 4999, 'cameras', ['trail camera'], 4, 1340, ['12MP', 'Takes AA batteries']),
    p('sd-card', 'Trail Camera SD Card, 32GB', 'SanDisky', '💾', 1299, 'cameras', ['sd card'], 5, 4410, ['Holds thousands of deer photos']),
    p('binoculars', 'Hunting Binoculars 10x42', 'Bushwhack', '🔭', 12999, 'cameras', ['binoculars'], 4.5, 2210, ['Waterproof', 'Fog proof'], 14999),
    p('aa-batteries', 'AA Lithium Batteries, 8 pack', 'Energizzz', '🔋', 1899, 'cameras', ['batteries'], 5, 3010, ['Lasts all season in a trail camera']),

    p('deer-corn', 'Whole Kernel Deer Corn, 40 lb', 'Bass Bro', '🌽', 1199, 'deer', ['deer corn'], 4.5, 6640, ['Deer love it']),
    p('mineral', 'Deer Mineral Lick Block', 'Big Buck', '🧱', 1499, 'deer', ['mineral'], 4, 1880, ['Brings deer back again and again']),
    p('scent-spray', 'Scent Eliminator Spray', 'Scent Away', '🧴', 1299, 'deer', ['scent spray'], 4, 2560, ['So deer can\'t smell you']),
    p('feeder', 'Gravity Deer Feeder', 'Big Buck', '🛢️', 5999, 'deer', ['feeder'], 4, 640, ['Holds 100 lb of corn']),

    p('ladder-stand', 'Ladder Tree Stand, 16 ft', 'Summit-ish', '🪜', 17999, 'stands', ['tree stand'], 4.5, 910, ['Includes safety harness', 'Padded seat']),
    p('harness', 'Tree Stand Safety Harness', 'Hunter Safe', '🪢', 7999, 'stands', ['harness'], 5, 1720, ['Always wear one in a tree stand']),
    p('seat', 'Cushion Seat', 'Bass Bro', '🪑', 1999, 'stands', ['seat'], 4.5, 1310, ['Sit comfy for hours']),
    p('hand-warmers', 'HotHandz Hand Warmers, 10 pairs', 'HotHandz', '🔥', 1299, 'stands', ['hand warmers'], 5, 7100, ['Up to 10 hours of heat']),
    p('headlamp', 'LED Headlamp', 'Black Diamond-ish', '🔦', 2999, 'stands', ['headlamp'], 4.5, 2405, ['Red light mode won\'t spook deer']),
    p('thermos', 'Insulated Thermos, 25 oz', 'Stanley-ish', '🫖', 3499, 'stands', ['thermos'], 5, 5020, ['Keeps cocoa hot all morning']),
    p('jerky', 'Jack Lynx Beef Jerky, 3.25 oz', 'Jack Lynx', '🥩', 699, 'stands', ['jerky'], 4.5, 1630, ['Good snack for the stand']),

    p('rod', 'Spinning Rod and Reel Combo', 'Ugly Stick-ish', '🎣', 5999, 'fishing', ['fishing rod'], 4.5, 4100, ['6 ft 6 in', 'Great for bass'], 6999),
    p('tackle-box', 'Tackle Box with 100 Lures', 'Bass Bro', '🧰', 2999, 'fishing', ['tackle box'], 4, 1880, ['Worms, spinners and bobbers']),
    p('worms', 'Night Crawlers, 2 dozen', 'Bait Shop', '🪱', 499, 'fishing', ['bait'], 4, 720, ['Keep refrigerated (ask first)']),
    p('cooler', 'Hard Cooler, 45 qt', 'Yeti-ish', '🧊', 24999, 'fishing', ['cooler'], 5, 3330, ['Keeps ice for days']),

    p('deer-license', 'Resident Deer License', 'State DNR', '🦌', 3300, 'licenses', ['license'], 5, 210, ['Required to hunt deer', 'Good for the whole season']),
    p('deer-tag', 'Extra Deer Tag', 'State DNR', '🏷️', 1500, 'licenses', ['tag'], 5, 120, ['One tag per deer']),
    p('fishing-license', 'Resident Fishing License', 'State DNR', '🐟', 2000, 'licenses', ['license', 'fishing license'], 5, 340, ['Good for one year']),
  ],
  delivery: [
    { id: 'standard', label: 'Standard Shipping (4–6 days)', detail: '$8.99, FREE on orders $50 and up', price: 899, freeOver: 5000, days: 5 },
    { id: 'pickup', label: 'Pick up in store', detail: 'FREE', price: 0, days: 1 },
  ],
  listItems: [
    { tag: 'blaze orange', label: 'something blaze orange', cheapest: 'the cheapest blaze orange item' },
    { tag: 'deer corn', label: 'deer corn' },
    { tag: 'hand warmers', label: 'hand warmers' },
    { tag: 'trail camera', label: 'a trail camera', cheapest: 'the cheapest trail camera' },
    { tag: 'sd card', label: 'an SD card' },
    { tag: 'boots', label: 'hunting boots', cheapest: 'the cheapest hunting boots' },
    { tag: 'gloves', label: 'gloves' },
    { tag: 'scent spray', label: 'scent spray' },
    { tag: 'jerky', label: 'jerky' },
    { tag: 'tag', label: 'an extra deer tag' },
    { tag: 'bait', label: 'worms' },
    { tag: 'headlamp', label: 'a headlamp' },
  ],
};
