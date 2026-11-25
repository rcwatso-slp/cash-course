// Original content for What Am I?, Word Links and Category Builder.

export interface Riddle {
  clues: string[];
  answer: string;
  also?: string[];
  /** Wrong choices for the "choose" response mode. */
  foils: string[];
  level: 1 | 2 | 3;
}

export const RIDDLES: Riddle[] = [
  // Level 1: everyday things, strong clues
  { clues: ['You wear me on your wrist.', 'I tell you the time.'], answer: 'watch', also: ['wristwatch'], foils: ['ring', 'glove', 'bracelet'], level: 1 },
  { clues: ['You sleep on me.', 'I have a pillow and blankets.'], answer: 'bed', foils: ['couch', 'chair', 'rug'], level: 1 },
  { clues: ['I am yellow and long.', 'You peel me before you eat me.'], answer: 'banana', foils: ['lemon', 'corn', 'apple'], level: 1 },
  { clues: ['You use me to open a door.', 'I hang on a ring with others like me.'], answer: 'key', also: ['keys'], foils: ['knob', 'lock', 'card'], level: 1 },
  { clues: ['I keep you dry when it rains.', 'You open me over your head.'], answer: 'umbrella', foils: ['raincoat', 'hat', 'tent'], level: 1 },
  { clues: ['You brush your teeth with me.', 'I have bristles.'], answer: 'toothbrush', foils: ['comb', 'hairbrush', 'floss'], level: 1 },
  { clues: ['I am cold and white.', 'I fall from the sky in winter.'], answer: 'snow', also: ['snowflake', 'snowflakes'], foils: ['rain', 'ice', 'hail'], level: 1 },
  { clues: ['You drink me in the morning.', 'I am hot and brown and can keep you awake.'], answer: 'coffee', foils: ['tea', 'milk', 'juice'], level: 1 },
  { clues: ['I bark and wag my tail.', 'People keep me as a pet.'], answer: 'dog', also: ['puppy'], foils: ['cat', 'bird', 'fish'], level: 1 },
  { clues: ['You put me on your feet before your shoes.', 'I come in pairs.'], answer: 'socks', also: ['sock'], foils: ['slippers', 'boots', 'gloves'], level: 1 },
  { clues: ['I shine in the sky during the day.', 'I keep the earth warm.'], answer: 'sun', foils: ['moon', 'star', 'cloud'], level: 1 },
  { clues: ['You sit on me at a table.', 'I have four legs and a back.'], answer: 'chair', foils: ['stool', 'bench', 'couch'], level: 1 },
  { clues: ['You call people on me.', 'You can also send texts with me.'], answer: 'phone', also: ['cell phone', 'cellphone', 'telephone'], foils: ['radio', 'computer', 'clock'], level: 1 },
  { clues: ['You wash your hands with me.', 'I make bubbles.'], answer: 'soap', foils: ['towel', 'lotion', 'water'], level: 1 },
  { clues: ['I am a fruit that is red or green.', 'One a day keeps the doctor away.'], answer: 'apple', foils: ['cherry', 'grape', 'pear'], level: 1 },
  // Level 2: places, people, actions, weaker clues
  { clues: ['You go here to borrow books.', 'You have to be quiet here.'], answer: 'library', foils: ['bookstore', 'school', 'museum'], level: 2 },
  { clues: ['I fix teeth.', 'You see me twice a year for a cleaning.'], answer: 'dentist', foils: ['doctor', 'nurse', 'barber'], level: 2 },
  { clues: ['You go here to mail a package.', 'They sell stamps here.'], answer: 'post office', also: ['postoffice'], foils: ['bank', 'store', 'library'], level: 2 },
  { clues: ['I am a meal.', 'You eat me in the middle of the day.'], answer: 'lunch', foils: ['breakfast', 'dinner', 'snack'], level: 2 },
  { clues: ['I cut hair.', 'You sit in my special chair.'], answer: 'barber', also: ['hairdresser', 'stylist', 'hairstylist'], foils: ['dentist', 'tailor', 'cook'], level: 2 },
  { clues: ['I am a season.', 'Leaves change color and fall during me.'], answer: 'fall', also: ['autumn'], foils: ['spring', 'summer', 'winter'], level: 2 },
  { clues: ['You keep food cold in me.', 'I have a light that turns on when you open my door.'], answer: 'refrigerator', also: ['fridge', 'icebox'], foils: ['oven', 'freezer', 'cabinet'], level: 2 },
  { clues: ['You do this with a broom.', 'It cleans the floor.'], answer: 'sweep', also: ['sweeping'], foils: ['mop', 'dust', 'vacuum'], level: 2 },
  { clues: ['I am a holiday with a turkey dinner.', 'People say what they are grateful for.'], answer: 'Thanksgiving', foils: ['Christmas', 'Easter', 'Fourth of July'], level: 2 },
  { clues: ['You go here when you are very sick or hurt.', 'Doctors and nurses work here day and night.'], answer: 'hospital', also: ['emergency room', 'er'], foils: ['pharmacy', 'clinic', 'school'], level: 2 },
  { clues: ['I am a game played with a bat and a ball.', 'You run around the bases.'], answer: 'baseball', also: ['softball'], foils: ['football', 'golf', 'tennis'], level: 2 },
  { clues: ['You do this when you are tired at night.', 'You close your eyes and dream.'], answer: 'sleep', also: ['sleeping'], foils: ['rest', 'sit', 'yawn'], level: 2 },
  { clues: ['I deliver letters to your house.', 'I come almost every day but Sunday.'], answer: 'mail carrier', also: ['mailman', 'mail man', 'postman', 'postal worker'], foils: ['driver', 'neighbor', 'paperboy'], level: 2 },
  { clues: ['You use me to see the time on a wall.', 'I have two hands and twelve numbers.'], answer: 'clock', foils: ['watch', 'calendar', 'mirror'], level: 2 },
  { clues: ['I am the room where you cook.', 'The stove and sink are in me.'], answer: 'kitchen', foils: ['bathroom', 'garage', 'dining room'], level: 2 },
  // Level 3: less common, more abstract
  { clues: ['I show the days, weeks and months.', 'You write appointments on me.'], answer: 'calendar', also: ['planner'], foils: ['clock', 'diary', 'map'], level: 3 },
  { clues: ['I am the money you pay for a place to live each month.', 'You pay me to a landlord.'], answer: 'rent', foils: ['tax', 'tip', 'bill'], level: 3 },
  { clues: ['I am a paper from your doctor.', 'You take me to the pharmacy to get medicine.'], answer: 'prescription', also: ['script'], foils: ['receipt', 'bill', 'chart'], level: 3 },
  { clues: ['I am the time of day when the sun comes up.', 'Roosters crow at me.'], answer: 'sunrise', also: ['dawn', 'morning', 'daybreak'], foils: ['sunset', 'noon', 'dusk'], level: 3 },
  { clues: ['I am a feeling.', 'You feel me before a big test or a doctor’s visit.'], answer: 'nervous', also: ['worried', 'anxious', 'scared'], foils: ['happy', 'bored', 'proud'], level: 3 },
  { clues: ['I am a person who has just moved in next door.', 'You might bring me cookies.'], answer: 'neighbor', also: ['new neighbor'], foils: ['cousin', 'stranger', 'guest'], level: 3 },
  { clues: ['I am a list of the food you can order at a restaurant.', 'I show the prices too.'], answer: 'menu', foils: ['receipt', 'bill', 'recipe'], level: 3 },
  { clues: ['I am written on a card in the kitchen.', 'I tell you the steps and ingredients to make a dish.'], answer: 'recipe', foils: ['menu', 'list', 'label'], level: 3 },
  { clues: ['I am the opposite of a question.', 'You give me when someone asks you something.'], answer: 'answer', also: ['reply', 'response'], foils: ['story', 'joke', 'guess'], level: 3 },
  { clues: ['I am a tool that shows which way is north.', 'Hikers carry me.'], answer: 'compass', foils: ['map', 'flashlight', 'ruler'], level: 3 },
  { clues: ['I am an amount of money you save for later.', 'I grow in the bank with interest.'], answer: 'savings', also: ['savings account', 'nest egg'], foils: ['allowance', 'loan', 'change'], level: 3 },
  { clues: ['I am the paper that shows what you bought and what you paid.', 'The cashier hands me to you.'], answer: 'receipt', foils: ['coupon', 'menu', 'ticket'], level: 3 },
  { clues: ['I am a big event when two people get married.', 'There is often cake and dancing.'], answer: 'wedding', foils: ['graduation', 'birthday', 'funeral'], level: 3 },
  { clues: ['I measure how hot or cold it is outside.', 'You read me in degrees.'], answer: 'temperature', also: ['thermometer'], foils: ['weather', 'forecast', 'humidity'], level: 3 },
  { clues: ['I am a person who is learning to drive.', 'I need a permit before a license.'], answer: 'student driver', also: ['new driver', 'learner'], foils: ['passenger', 'mechanic', 'pilot'], level: 3 },
];

export type LinkType = 'same' | 'opposite' | 'goes';

export interface WordLink {
  type: LinkType;
  word: string;
  answer: string;
  foils: string[];
  level: 1 | 2 | 3;
}

export const LINK_PROMPTS: Record<LinkType, (w: string) => string> = {
  same: (w) => `Which word means the SAME as “${w}”?`,
  opposite: (w) => `Which word means the OPPOSITE of “${w}”?`,
  goes: (w) => `Which word goes best with “${w}”?`,
};

export const WORD_LINKS: WordLink[] = [
  // Level 1
  { type: 'opposite', word: 'hot', answer: 'cold', foils: ['warm', 'sunny', 'wet'], level: 1 },
  { type: 'opposite', word: 'up', answer: 'down', foils: ['high', 'top', 'over'], level: 1 },
  { type: 'opposite', word: 'big', answer: 'small', foils: ['tall', 'huge', 'wide'], level: 1 },
  { type: 'opposite', word: 'open', answer: 'closed', foils: ['door', 'wide', 'empty'], level: 1 },
  { type: 'opposite', word: 'happy', answer: 'sad', foils: ['glad', 'funny', 'tired'], level: 1 },
  { type: 'same', word: 'big', answer: 'large', foils: ['little', 'tall', 'round'], level: 1 },
  { type: 'same', word: 'glad', answer: 'happy', foils: ['mad', 'sleepy', 'sad'], level: 1 },
  { type: 'same', word: 'little', answer: 'small', foils: ['many', 'short', 'big'], level: 1 },
  { type: 'goes', word: 'salt', answer: 'pepper', foils: ['sugar', 'water', 'spoon'], level: 1 },
  { type: 'goes', word: 'cup', answer: 'saucer', foils: ['fork', 'pan', 'napkin'], level: 1 },
  { type: 'goes', word: 'shoes', answer: 'socks', foils: ['hat', 'shirt', 'belt'], level: 1 },
  { type: 'goes', word: 'bread', answer: 'butter', foils: ['milk', 'soup', 'ice'], level: 1 },
  // Level 2
  { type: 'opposite', word: 'early', answer: 'late', foils: ['soon', 'first', 'fast'], level: 2 },
  { type: 'opposite', word: 'empty', answer: 'full', foils: ['clean', 'open', 'light'], level: 2 },
  { type: 'opposite', word: 'buy', answer: 'sell', foils: ['pay', 'shop', 'spend'], level: 2 },
  { type: 'opposite', word: 'remember', answer: 'forget', foils: ['recall', 'think', 'learn'], level: 2 },
  { type: 'same', word: 'quick', answer: 'fast', foils: ['slow', 'late', 'busy'], level: 2 },
  { type: 'same', word: 'begin', answer: 'start', foils: ['finish', 'stop', 'wait'], level: 2 },
  { type: 'same', word: 'shout', answer: 'yell', foils: ['whisper', 'sing', 'talk'], level: 2 },
  { type: 'same', word: 'tired', answer: 'sleepy', foils: ['awake', 'hungry', 'bored'], level: 2 },
  { type: 'goes', word: 'needle', answer: 'thread', foils: ['button', 'pin', 'cloth'], level: 2 },
  { type: 'goes', word: 'lock', answer: 'key', foils: ['door', 'chain', 'safe'], level: 2 },
  { type: 'goes', word: 'hammer', answer: 'nail', foils: ['saw', 'wood', 'box'], level: 2 },
  { type: 'goes', word: 'toothbrush', answer: 'toothpaste', foils: ['soap', 'comb', 'towel'], level: 2 },
  // Level 3
  { type: 'opposite', word: 'ancient', answer: 'modern', foils: ['old', 'historic', 'rare'], level: 3 },
  { type: 'opposite', word: 'generous', answer: 'selfish', foils: ['kind', 'giving', 'rich'], level: 3 },
  { type: 'opposite', word: 'rare', answer: 'common', foils: ['strange', 'raw', 'unusual'], level: 3 },
  { type: 'opposite', word: 'arrive', answer: 'depart', foils: ['reach', 'enter', 'travel'], level: 3 },
  { type: 'same', word: 'enormous', answer: 'huge', foils: ['tiny', 'heavy', 'strong'], level: 3 },
  { type: 'same', word: 'repair', answer: 'fix', foils: ['break', 'replace', 'build'], level: 3 },
  { type: 'same', word: 'purchase', answer: 'buy', foils: ['sell', 'borrow', 'return'], level: 3 },
  { type: 'same', word: 'difficult', answer: 'hard', foils: ['easy', 'heavy', 'simple'], level: 3 },
  { type: 'goes', word: 'doctor', answer: 'patient', foils: ['teacher', 'pilot', 'student'], level: 3 },
  { type: 'goes', word: 'landlord', answer: 'tenant', foils: ['neighbor', 'banker', 'owner'], level: 3 },
  { type: 'goes', word: 'question', answer: 'answer', foils: ['problem', 'story', 'number'], level: 3 },
  { type: 'goes', word: 'thunder', answer: 'lightning', foils: ['snow', 'rainbow', 'wind'], level: 3 },
];

export interface CategoryItem {
  kind: 'name' | 'fits';
  /** name: the members shown. fits: the category. */
  given: string[];
  answer: string;
  foils: string[];
  level: 1 | 2 | 3;
}

export const CATEGORY_ITEMS: CategoryItem[] = [
  // Level 1
  { kind: 'name', given: ['dog', 'cat', 'horse', 'cow'], answer: 'animals', foils: ['foods', 'tools', 'colors'], level: 1 },
  { kind: 'name', given: ['apple', 'banana', 'orange', 'grape'], answer: 'fruits', foils: ['vegetables', 'drinks', 'animals'], level: 1 },
  { kind: 'name', given: ['shirt', 'pants', 'socks', 'coat'], answer: 'clothes', foils: ['furniture', 'tools', 'toys'], level: 1 },
  { kind: 'name', given: ['red', 'blue', 'green', 'yellow'], answer: 'colors', foils: ['shapes', 'numbers', 'fruits'], level: 1 },
  { kind: 'name', given: ['car', 'bus', 'truck', 'train'], answer: 'vehicles', foils: ['buildings', 'animals', 'tools'], level: 1 },
  { kind: 'fits', given: ['fruits'], answer: 'pear', foils: ['carrot', 'bread', 'cheese'], level: 1 },
  { kind: 'fits', given: ['animals'], answer: 'rabbit', foils: ['rock', 'chair', 'cup'], level: 1 },
  { kind: 'fits', given: ['furniture'], answer: 'table', foils: ['apple', 'shoe', 'car'], level: 1 },
  { kind: 'fits', given: ['drinks'], answer: 'milk', foils: ['bread', 'egg', 'spoon'], level: 1 },
  { kind: 'fits', given: ['clothes'], answer: 'sweater', foils: ['lamp', 'pear', 'nail'], level: 1 },
  // Level 2
  { kind: 'name', given: ['hammer', 'saw', 'wrench', 'screwdriver'], answer: 'tools', foils: ['machines', 'kitchen things', 'toys'], level: 2 },
  { kind: 'name', given: ['Monday', 'Tuesday', 'Friday', 'Sunday'], answer: 'days of the week', foils: ['months', 'holidays', 'seasons'], level: 2 },
  { kind: 'name', given: ['piano', 'guitar', 'drum', 'violin'], answer: 'musical instruments', foils: ['furniture', 'tools', 'games'], level: 2 },
  { kind: 'name', given: ['doctor', 'teacher', 'plumber', 'cook'], answer: 'jobs', foils: ['places', 'relatives', 'hobbies'], level: 2 },
  { kind: 'name', given: ['spring', 'summer', 'fall', 'winter'], answer: 'seasons', foils: ['months', 'weather', 'holidays'], level: 2 },
  { kind: 'fits', given: ['things in a kitchen'], answer: 'stove', foils: ['bathtub', 'bed', 'lawnmower'], level: 2 },
  { kind: 'fits', given: ['jobs'], answer: 'nurse', foils: ['sister', 'neighbor', 'friend'], level: 2 },
  { kind: 'fits', given: ['things that are cold'], answer: 'ice', foils: ['soup', 'oven', 'fire'], level: 2 },
  { kind: 'fits', given: ['vegetables'], answer: 'broccoli', foils: ['grape', 'cookie', 'cheese'], level: 2 },
  { kind: 'fits', given: ['months'], answer: 'April', foils: ['Tuesday', 'Easter', 'winter'], level: 2 },
  // Level 3
  { kind: 'name', given: ['nickel', 'dime', 'quarter', 'penny'], answer: 'coins', foils: ['bills', 'checks', 'cards'], level: 3 },
  { kind: 'name', given: ['aunt', 'cousin', 'nephew', 'grandson'], answer: 'relatives', foils: ['friends', 'neighbors', 'coworkers'], level: 3 },
  { kind: 'name', given: ['inch', 'foot', 'yard', 'mile'], answer: 'measures of length', foils: ['measures of weight', 'measures of time', 'shapes'], level: 3 },
  { kind: 'name', given: ['happy', 'angry', 'nervous', 'proud'], answer: 'feelings', foils: ['colors', 'jobs', 'sizes'], level: 3 },
  { kind: 'name', given: ['Thanksgiving', 'New Year’s Day', 'Memorial Day', 'Labor Day'], answer: 'holidays', foils: ['seasons', 'birthdays', 'months'], level: 3 },
  { kind: 'fits', given: ['things that need batteries'], answer: 'flashlight', foils: ['candle', 'broom', 'book'], level: 3 },
  { kind: 'fits', given: ['things that are round'], answer: 'coin', foils: ['book', 'brick', 'door'], level: 3 },
  { kind: 'fits', given: ['things you find at a bank'], answer: 'teller', foils: ['stethoscope', 'oven', 'pool'], level: 3 },
  { kind: 'fits', given: ['feelings'], answer: 'lonely', foils: ['purple', 'heavy', 'square'], level: 3 },
  { kind: 'fits', given: ['things with wheels'], answer: 'wheelchair', foils: ['sofa', 'ladder', 'canoe'], level: 3 },
];
