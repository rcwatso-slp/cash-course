// Practice material for the Speech (dysarthria) tasks. Original content.

/** Level 1: single words. Level 2: short phrases. Level 3: sentences. Functional phrases are mixed in at every level. */
export const CLEAR_SPEECH: Record<1 | 2 | 3, string[]> = {
  1: [
    'water', 'coffee', 'yes', 'no', 'help', 'thank you', 'bathroom', 'blanket', 'telephone', 'tomorrow',
    'medicine', 'pillow', 'kitchen', 'nurse', 'butterfly', 'potato', 'Tuesday', 'umbrella', 'basket', 'window',
    'dinner', 'remote', 'glasses', 'hello', 'goodbye',
  ],
  2: [
    'I need help', 'Good morning', 'Thank you very much', 'Turn on the light', 'I’m thirsty', 'Call my daughter',
    'Close the door', 'A cup of coffee', 'Where are my glasses?', 'I’m cold', 'Not right now', 'See you later',
    'Pass the salt', 'I feel tired', 'Raise the bed', 'What time is it?', 'Open the window', 'Let’s go outside',
    'Turn up the TV', 'I’d like some water',
  ],
  3: [
    'Can I have some water, please?', 'I need to use the bathroom.', 'Please call my son and tell him I said hello.',
    'What time is my doctor’s appointment?', 'I would like a cup of coffee with milk.', 'My back hurts when I sit up.',
    'Could you turn the TV to the news?', 'I’d like to sit by the window for a while.', 'Please bring me another blanket.',
    'We should go to the store after lunch.', 'The weather is supposed to be nice tomorrow.', 'I left my glasses on the kitchen table.',
    'Can you help me find my phone?', 'My granddaughter is coming to visit on Sunday.', 'I’ll have the chicken soup and a roll, please.',
  ],
};

/** Loud & Clear phrases, short to long. */
export const LOUD_PHRASES: string[] = [
  'Good morning!', 'Hello!', 'Thank you!', 'I need help.', 'Come here, please.', 'How are you?', 'Excuse me!',
  'I’m ready to go.', 'Turn it up, please.', 'Can you hear me?', 'I’d like a glass of water.', 'Please close the door.',
  'Have a great day!', 'What’s for lunch today?', 'Let’s go for a walk.', 'Nice to see you again!',
];

/** Pacing Board sentences (one box per word). */
export const PACING: Record<1 | 2 | 3, string[]> = {
  1: ['I need help', 'Good morning', 'Thank you', 'I am tired', 'Turn it off', 'Call my son', 'I want coffee', 'Open the door'],
  2: ['I would like some water', 'Please turn on the light', 'Can you help me up', 'My name is on the list', 'I want to go outside', 'What time is lunch today'],
  3: [
    'Please call my daughter after dinner',
    'I would like the chicken and a salad',
    'Can you bring me my glasses please',
    'The bus comes at ten in the morning',
    'I need to pick up my medicine today',
  ],
};

export const DDK = [
  { id: 'pa', label: 'puh-puh-puh', say: 'puh puh puh puh puh' },
  { id: 'ta', label: 'tuh-tuh-tuh', say: 'tuh tuh tuh tuh tuh' },
  { id: 'ka', label: 'kuh-kuh-kuh', say: 'kuh kuh kuh kuh kuh' },
  { id: 'ptk', label: 'puh-tuh-kuh', say: 'puh tuh kuh, puh tuh kuh, puh tuh kuh' },
] as const;
