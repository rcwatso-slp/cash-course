// Content for the Language (aphasia) tasks. Original items.

export interface YesNoItem {
  q: string;
  a: boolean;
  level: 1 | 2 | 3;
}

export const YES_NO: YesNoItem[] = [
  // Level 1: everyday facts
  { q: 'Is a banana yellow?', a: true, level: 1 },
  { q: 'Do you wear shoes on your hands?', a: false, level: 1 },
  { q: 'Is ice cold?', a: true, level: 1 },
  { q: 'Can a dog fly?', a: false, level: 1 },
  { q: 'Do you sleep in a bed?', a: true, level: 1 },
  { q: 'Is the sun out at night?', a: false, level: 1 },
  { q: 'Do you drink water?', a: true, level: 1 },
  { q: 'Is a car bigger than a cup?', a: true, level: 1 },
  { q: 'Do fish live in trees?', a: false, level: 1 },
  { q: 'Do you eat soup with a fork?', a: false, level: 1 },
  { q: 'Is grass green?', a: true, level: 1 },
  { q: 'Can you eat a chair?', a: false, level: 1 },
  { q: 'Do birds have feathers?', a: true, level: 1 },
  { q: 'Is fire hot?', a: true, level: 1 },
  { q: 'Do you brush your teeth with a hammer?', a: false, level: 1 },
  // Level 2: two ideas, less obvious
  { q: 'Do you put a stamp on a letter before you mail it?', a: true, level: 2 },
  { q: 'Is Monday the day after Sunday?', a: true, level: 2 },
  { q: 'Do you need an umbrella when it is sunny and dry?', a: false, level: 2 },
  { q: 'Is a minute longer than an hour?', a: false, level: 2 },
  { q: 'Can you buy stamps at the post office?', a: true, level: 2 },
  { q: 'Do you put milk in the oven to keep it cold?', a: false, level: 2 },
  { q: 'Is December in the winter?', a: true, level: 2 },
  { q: 'Do you dry your hands with soap?', a: false, level: 2 },
  { q: 'Does a week have seven days?', a: true, level: 2 },
  { q: 'Is a nickel worth more than a dime?', a: false, level: 2 },
  { q: 'Do you need a key to start most cars?', a: true, level: 2 },
  { q: 'Can a person see in the dark without a light?', a: false, level: 2 },
  { q: 'Does a dentist take care of your teeth?', a: true, level: 2 },
  { q: 'Do you wear a coat to stay warm?', a: true, level: 2 },
  { q: 'Is a lemon sweet?', a: false, level: 2 },
  // Level 3: reversals, comparisons, word meaning
  { q: 'Is a pound heavier than an ounce?', a: true, level: 3 },
  { q: 'If you are late, did you arrive before the time?', a: false, level: 3 },
  { q: 'Does the word “ancient” mean very new?', a: false, level: 3 },
  { q: 'If the store closes at 9 and it is 10, is the store open?', a: false, level: 3 },
  { q: 'Is a grandmother older than her grandchild?', a: true, level: 3 },
  { q: 'Do you put on your socks after your shoes?', a: false, level: 3 },
  { q: 'Is the word “quiet” the opposite of “loud”?', a: true, level: 3 },
  { q: 'If you lend someone money, should they give it back?', a: true, level: 3 },
  { q: 'Was your mother born before you?', a: true, level: 3 },
  { q: 'Is a half more than a quarter?', a: true, level: 3 },
  { q: 'If it is raining, is the ground usually dry?', a: false, level: 3 },
  { q: 'Does “brief” mean long?', a: false, level: 3 },
  { q: 'Is a car repaired by a mechanic?', a: true, level: 3 },
  { q: 'If you skip breakfast, did you eat breakfast?', a: false, level: 3 },
  { q: 'Is the third of the month before the tenth?', a: true, level: 3 },
];

export interface SentenceItem {
  stem: string; // ___ marks the blank
  answer: string;
  also?: string[];
  /** Wrong choices for the easiest level. */
  foils: string[];
  level: 1 | 2 | 3;
}

export const SENTENCES: SentenceItem[] = [
  // Level 1: very automatic phrases
  { stem: 'You brush your ___.', answer: 'teeth', also: ['tooth'], foils: ['shoes', 'car', 'bread'], level: 1 },
  { stem: 'Salt and ___.', answer: 'pepper', foils: ['water', 'socks', 'chair'], level: 1 },
  { stem: 'You sleep in a ___.', answer: 'bed', foils: ['cup', 'shoe', 'tree'], level: 1 },
  { stem: 'Peanut butter and ___.', answer: 'jelly', also: ['jam'], foils: ['paper', 'nails', 'soap'], level: 1 },
  { stem: 'You drink coffee from a ___.', answer: 'cup', also: ['mug'], foils: ['fork', 'hat', 'book'], level: 1 },
  { stem: 'Rise and ___.', answer: 'shine', foils: ['fall', 'sit', 'eat'], level: 1 },
  { stem: 'You wear a hat on your ___.', answer: 'head', foils: ['foot', 'hand', 'knee'], level: 1 },
  { stem: 'Bread and ___.', answer: 'butter', foils: ['shoes', 'paint', 'glass'], level: 1 },
  { stem: 'You open the door with a ___.', answer: 'key', foils: ['spoon', 'sock', 'cake'], level: 1 },
  { stem: 'Happy birthday to ___.', answer: 'you', foils: ['them', 'car', 'cup'], level: 1 },
  { stem: 'Ladies and ___.', answer: 'gentlemen', foils: ['tables', 'apples', 'clocks'], level: 1 },
  { stem: 'You wash your hands with soap and ___.', answer: 'water', foils: ['sand', 'milk', 'paper'], level: 1 },
  // Level 2: everyday sentences
  { stem: 'When it rains, you open your ___.', answer: 'umbrella', foils: ['window', 'mouth', 'mail'], level: 2 },
  { stem: 'You cut paper with a pair of ___.', answer: 'scissors', foils: ['shoes', 'socks', 'glasses'], level: 2 },
  { stem: 'At night you turn off the ___.', answer: 'lights', also: ['light', 'lamp', 'tv', 'television'], foils: ['bread', 'stairs', 'floor'], level: 2 },
  { stem: 'You mail a letter at the post ___.', answer: 'office', foils: ['card', 'man', 'house'], level: 2 },
  { stem: 'To call your friend, you pick up the ___.', answer: 'phone', also: ['telephone'], foils: ['broom', 'plate', 'book'], level: 2 },
  { stem: 'You put food in the refrigerator to keep it ___.', answer: 'cold', also: ['fresh', 'cool'], foils: ['hot', 'loud', 'tall'], level: 2 },
  { stem: 'You need gas to drive your ___.', answer: 'car', also: ['truck'], foils: ['bed', 'dog', 'shirt'], level: 2 },
  { stem: 'When you are tired, you go to ___.', answer: 'sleep', also: ['bed'], foils: ['work', 'swim', 'shop'], level: 2 },
  { stem: 'You can tell the time by looking at a ___.', answer: 'clock', also: ['watch', 'phone'], foils: ['plate', 'shoe', 'tree'], level: 2 },
  { stem: 'In the morning, many people drink a cup of ___.', answer: 'coffee', also: ['tea', 'juice'], foils: ['sand', 'soap', 'paint'], level: 2 },
  { stem: 'If you are sick, you go to see the ___.', answer: 'doctor', also: ['nurse'], foils: ['mailman', 'cook', 'barber'], level: 2 },
  { stem: 'You pay for groceries at the ___.', answer: 'register', also: ['checkout', 'cashier', 'counter', 'front'], foils: ['garden', 'garage', 'bathroom'], level: 2 },
  // Level 3: less predictable
  { stem: 'The opposite of early is ___.', answer: 'late', foils: ['soon', 'fast', 'first'], level: 3 },
  { stem: 'A person who fixes leaky pipes is a ___.', answer: 'plumber', foils: ['baker', 'pilot', 'teacher'], level: 3 },
  { stem: 'You keep your money safe in a ___.', answer: 'bank', also: ['wallet', 'safe'], foils: ['bucket', 'garden', 'sink'], level: 3 },
  { stem: 'Water turns to ice when it gets very ___.', answer: 'cold', foils: ['hot', 'old', 'loud'], level: 3 },
  { stem: 'A baby cat is called a ___.', answer: 'kitten', foils: ['puppy', 'calf', 'cub'], level: 3 },
  { stem: 'You need a ticket to get on a ___.', answer: 'plane', also: ['train', 'bus', 'airplane'], foils: ['bed', 'couch', 'sidewalk'], level: 3 },
  { stem: 'The day after Friday is ___.', answer: 'Saturday', foils: ['Thursday', 'Monday', 'Sunday'], level: 3 },
  { stem: 'You look up a word’s meaning in a ___.', answer: 'dictionary', foils: ['calendar', 'menu', 'map'], level: 3 },
  { stem: 'When you can’t find your way, you look at a ___.', answer: 'map', also: ['phone', 'gps'], foils: ['clock', 'cup', 'mirror'], level: 3 },
  { stem: 'Bees make ___.', answer: 'honey', foils: ['milk', 'bread', 'wool'], level: 3 },
  { stem: 'The person who flies an airplane is the ___.', answer: 'pilot', foils: ['driver', 'captain of the ship', 'clerk'], level: 3 },
  { stem: 'Twelve months make one ___.', answer: 'year', foils: ['week', 'day', 'hour'], level: 3 },
];

export const FLUENCY_CATEGORIES: { name: string; level: 1 | 2 | 3; examples: string[] }[] = [
  { name: 'Animals', level: 1, examples: ['dog', 'cat', 'horse', 'cow'] },
  { name: 'Foods', level: 1, examples: ['bread', 'apple', 'chicken', 'rice'] },
  { name: 'Clothing', level: 1, examples: ['shirt', 'pants', 'socks', 'hat'] },
  { name: 'Things in a kitchen', level: 1, examples: ['stove', 'spoon', 'plate', 'sink'] },
  { name: 'Colors', level: 1, examples: ['red', 'blue', 'green', 'yellow'] },
  { name: 'Fruits', level: 2, examples: ['apple', 'banana', 'orange', 'grape'] },
  { name: 'Vegetables', level: 2, examples: ['carrot', 'corn', 'peas', 'lettuce'] },
  { name: 'Things in a bathroom', level: 2, examples: ['sink', 'towel', 'soap', 'toothbrush'] },
  { name: 'Jobs', level: 2, examples: ['teacher', 'nurse', 'cook', 'farmer'] },
  { name: 'Things that are cold', level: 2, examples: ['ice', 'snow', 'freezer', 'ice cream'] },
  { name: 'Sports', level: 2, examples: ['baseball', 'soccer', 'golf', 'tennis'] },
  { name: 'Things you find at a grocery store', level: 2, examples: ['milk', 'eggs', 'cart', 'bread'] },
  { name: 'Words that start with S', level: 3, examples: ['sun', 'sock', 'salt', 'sister'] },
  { name: 'Words that start with B', level: 3, examples: ['ball', 'boat', 'bread', 'blue'] },
  { name: 'Words that start with T', level: 3, examples: ['table', 'tree', 'time', 'tea'] },
  { name: 'Things that have wheels', level: 3, examples: ['car', 'bike', 'wheelchair', 'cart'] },
  { name: 'Things that are round', level: 3, examples: ['ball', 'plate', 'coin', 'clock'] },
  { name: 'Things you do in the morning', level: 3, examples: ['shower', 'brush teeth', 'get dressed', 'eat breakfast'] },
];
