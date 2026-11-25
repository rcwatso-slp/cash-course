// Original content for Mental Workout, Chunk It and Names and Faces.

/** Things with a clear size order. rank: bigger number = bigger thing. */
export const SIZE_ITEMS: { word: string; emoji: string; rank: number }[] = [
  { word: 'ant', emoji: '🐜', rank: 1 },
  { word: 'button', emoji: '🔘', rank: 2 },
  { word: 'coin', emoji: '🪙', rank: 3 },
  { word: 'egg', emoji: '🥚', rank: 4 },
  { word: 'apple', emoji: '🍎', rank: 5 },
  { word: 'shoe', emoji: '👟', rank: 6 },
  { word: 'cat', emoji: '🐱', rank: 7 },
  { word: 'chair', emoji: '🪑', rank: 8 },
  { word: 'bicycle', emoji: '🚲', rank: 9 },
  { word: 'horse', emoji: '🐴', rank: 10 },
  { word: 'car', emoji: '🚗', rank: 11 },
  { word: 'bus', emoji: '🚌', rank: 12 },
  { word: 'house', emoji: '🏠', rank: 13 },
  { word: 'airplane', emoji: '✈️', rank: 14 },
  { word: 'mountain', emoji: '⛰️', rank: 15 },
];

/** Words for backward and ABC order: short, common, all different first letters within a list. */
export const WORKOUT_WORDS = [
  'apple', 'bread', 'chair', 'door', 'egg', 'fish', 'glove', 'hat', 'ice', 'jar', 'key', 'lamp', 'milk', 'nail', 'orange',
  'pen', 'quilt', 'rug', 'sock', 'tree', 'van', 'watch', 'yarn', 'zipper', 'boat', 'cup', 'dog', 'fork', 'girl', 'horse',
  'kite', 'leaf', 'moon', 'nest', 'owl', 'pie', 'ring', 'soap', 'towel', 'wagon',
];

/** Sentences for Unscramble. Words are shuffled; the patient puts them back in order. */
export const SCRAMBLE_SENTENCES: Record<1 | 2 | 3, string[]> = {
  1: [
    'The dog is barking', 'I like hot coffee', 'She reads the paper', 'We eat at noon', 'He fixed the car',
    'The sun is out', 'Please close the door', 'My shoes are wet', 'The baby is asleep', 'I need my glasses',
  ],
  2: [
    'The mail comes after lunch', 'My sister called me today', 'Please pass the salt and pepper', 'We walked to the park',
    'The bus stops at the corner', 'I take my pills at night', 'He planted tomatoes in the garden', 'The store opens at nine',
    'She baked a cake for us', 'It might rain this afternoon',
  ],
  3: [
    'My doctor wants to see me next week', 'We need to buy milk on the way home', 'The game starts after the news is over',
    'Please call me when you get to the hotel', 'I left my keys on the kitchen table', 'The library closes early on Saturday',
    'Our neighbor brought us a pie yesterday', 'Turn left at the light after the bank', 'He forgot to set his alarm last night',
    'The nurse will check your blood pressure',
  ],
};

/** People for Names and Faces. Names start with the same sound as the job, to make an easy link. */
export const PEOPLE: { role: string; emoji: string; names: string[] }[] = [
  { role: 'doctor', emoji: '👩‍⚕️', names: ['Dana', 'Diane', 'Debbie'] },
  { role: 'cook', emoji: '👨‍🍳', names: ['Carl', 'Curtis', 'Cole'] },
  { role: 'police officer', emoji: '👮', names: ['Pete', 'Paul', 'Phil'] },
  { role: 'builder', emoji: '👷', names: ['Bill', 'Bob', 'Brad'] },
  { role: 'teacher', emoji: '👩‍🏫', names: ['Tina', 'Tess', 'Terri'] },
  { role: 'farmer', emoji: '👨‍🌾', names: ['Frank', 'Fred', 'Floyd'] },
  { role: 'mechanic', emoji: '🧑‍🔧', names: ['Mike', 'Mark', 'Max'] },
  { role: 'firefighter', emoji: '👩‍🚒', names: ['Faye', 'Fran', 'Flo'] },
  { role: 'artist', emoji: '👨‍🎨', names: ['Al', 'Andy', 'Abe'] },
  { role: 'singer', emoji: '👩‍🎤', names: ['Sally', 'Sue', 'Sarah'] },
  { role: 'judge', emoji: '👨‍⚖️', names: ['Joe', 'Jack', 'Jim'] },
  { role: 'scientist', emoji: '👩‍🔬', names: ['Sam', 'Stella', 'Sid'] },
  { role: 'manager', emoji: '🧑‍💼', names: ['Molly', 'Mel', 'Mabel'] },
];
