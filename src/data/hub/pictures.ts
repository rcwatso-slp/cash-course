// Everyday nouns with a picture (emoji), a category, a meaning cue and the first sound.
// Used by Name It, Point to It, Follow Directions, Word List and Matching Pairs.
// level: 1 = very common, 2 = common, 3 = less common / longer word.

export interface PictureWord {
  word: string;
  emoji: string;
  category: Category;
  /** Semantic cue: what it is and what it's for. */
  cue: string;
  /** First sound or syllable for the phonemic cue, written how it sounds. */
  sound: string;
  /** Other names that also count. */
  also?: string[];
  level: 1 | 2 | 3;
}

export type Category = 'food' | 'drink' | 'clothing' | 'home' | 'kitchen' | 'bathroom' | 'animal' | 'vehicle' | 'nature' | 'object' | 'health' | 'music';

export const CATEGORY_NAMES: Record<Category, string> = {
  food: 'food',
  drink: 'drinks',
  clothing: 'clothing',
  home: 'things in a house',
  kitchen: 'kitchen things',
  bathroom: 'bathroom things',
  animal: 'animals',
  vehicle: 'ways to get around',
  nature: 'things in nature',
  object: 'everyday things',
  health: 'health and medical things',
  music: 'musical instruments',
};

export const PICTURES: PictureWord[] = [
  // Food
  { word: 'banana', emoji: '🍌', category: 'food', cue: 'A long yellow fruit. You peel it.', sound: 'ba', level: 1 },
  { word: 'apple', emoji: '🍎', category: 'food', cue: 'A round red fruit. It crunches when you bite it.', sound: 'a', level: 1 },
  { word: 'bread', emoji: '🍞', category: 'food', cue: 'You make a sandwich with two slices of it.', sound: 'br', also: ['loaf'], level: 1 },
  { word: 'egg', emoji: '🥚', category: 'food', cue: 'A chicken lays it. You can scramble or fry it.', sound: 'e', level: 1 },
  { word: 'cheese', emoji: '🧀', category: 'food', cue: 'It is made from milk. You put it on a cracker or a burger.', sound: 'ch', level: 1 },
  { word: 'carrot', emoji: '🥕', category: 'food', cue: 'A long orange vegetable. Rabbits like it.', sound: 'ca', level: 1 },
  { word: 'corn', emoji: '🌽', category: 'food', cue: 'A yellow vegetable you eat off the cob.', sound: 'co', also: ['corn on the cob'], level: 2 },
  { word: 'grapes', emoji: '🍇', category: 'food', cue: 'Small round fruit that grows in a bunch. Wine is made from it.', sound: 'gr', also: ['grape'], level: 1 },
  { word: 'lemon', emoji: '🍋', category: 'food', cue: 'A sour yellow fruit. You squeeze it into tea.', sound: 'le', level: 2 },
  { word: 'strawberry', emoji: '🍓', category: 'food', cue: 'A small red fruit with seeds on the outside.', sound: 'straw', level: 2 },
  { word: 'potato', emoji: '🥔', category: 'food', cue: 'You can bake it, mash it or make French fries from it.', sound: 'po', level: 2 },
  { word: 'tomato', emoji: '🍅', category: 'food', cue: 'A round red food. Ketchup is made from it.', sound: 'to', level: 2 },
  { word: 'pizza', emoji: '🍕', category: 'food', cue: 'Cut into slices, with cheese and sauce on top.', sound: 'pee', level: 1 },
  { word: 'hamburger', emoji: '🍔', category: 'food', cue: 'A meat patty in a bun.', sound: 'ham', also: ['burger', 'cheeseburger'], level: 1 },
  { word: 'cake', emoji: '🎂', category: 'food', cue: 'A sweet dessert with candles for a birthday.', sound: 'ca', also: ['birthday cake'], level: 1 },
  { word: 'cookie', emoji: '🍪', category: 'food', cue: 'A sweet snack. It can have chocolate chips.', sound: 'coo', level: 1 },
  { word: 'pineapple', emoji: '🍍', category: 'food', cue: 'A spiky tropical fruit with leaves on top.', sound: 'pine', level: 3 },
  { word: 'broccoli', emoji: '🥦', category: 'food', cue: 'A green vegetable that looks like a little tree.', sound: 'bro', level: 3 },
  { word: 'peanuts', emoji: '🥜', category: 'food', cue: 'A nut in a shell. Used to make a butter for sandwiches.', sound: 'pea', also: ['peanut', 'nuts'], level: 2 },
  { word: 'onion', emoji: '🧅', category: 'food', cue: 'A vegetable that can make you cry when you cut it.', sound: 'uh', level: 2 },
  { word: 'watermelon', emoji: '🍉', category: 'food', cue: 'A big green fruit, red inside with black seeds.', sound: 'wa', level: 2 },
  { word: 'pear', emoji: '🍐', category: 'food', cue: 'A green fruit, round at the bottom and narrow at the top.', sound: 'pe', level: 2 },
  { word: 'mushroom', emoji: '🍄', category: 'food', cue: 'It grows in damp places. You can put it on pizza.', sound: 'mu', level: 3 },
  // Drinks
  { word: 'coffee', emoji: '☕', category: 'drink', cue: 'A hot brown drink many people have in the morning.', sound: 'co', also: ['cup of coffee', 'tea', 'cup'], level: 1 },
  { word: 'milk', emoji: '🥛', category: 'drink', cue: 'A white drink that comes from cows.', sound: 'mi', also: ['glass of milk'], level: 1 },
  { word: 'drop', emoji: '💧', category: 'drink', cue: 'A tiny bit of water, like one from a leaky faucet.', sound: 'dr', also: ['water drop', 'water', 'raindrop', 'drip'], level: 2 },
  { word: 'juice', emoji: '🧃', category: 'drink', cue: 'A fruit drink in a box with a straw.', sound: 'joo', also: ['juice box'], level: 2 },
  { word: 'teapot', emoji: '🫖', category: 'kitchen', cue: 'You pour hot tea from it.', sound: 'tee', also: ['kettle', 'tea kettle'], level: 3 },
  // Clothing
  { word: 'shirt', emoji: '👕', category: 'clothing', cue: 'You wear it on top. It can have short or long sleeves.', sound: 'sh', also: ['t-shirt', 'tshirt', 'tee shirt'], level: 1 },
  { word: 'pants', emoji: '👖', category: 'clothing', cue: 'You wear them on your legs.', sound: 'pa', also: ['jeans', 'trousers'], level: 1 },
  { word: 'dress', emoji: '👗', category: 'clothing', cue: 'One piece of clothing with a skirt.', sound: 'dr', level: 1 },
  { word: 'socks', emoji: '🧦', category: 'clothing', cue: 'You wear them on your feet, inside your shoes.', sound: 'so', also: ['sock'], level: 1 },
  { word: 'shoe', emoji: '👟', category: 'clothing', cue: 'You wear it on your foot and tie the laces.', sound: 'sh', also: ['shoes', 'sneaker', 'sneakers', 'tennis shoe'], level: 1 },
  { word: 'hat', emoji: '🧢', category: 'clothing', cue: 'You wear it on your head to block the sun.', sound: 'ha', also: ['cap', 'baseball cap'], level: 1 },
  { word: 'gloves', emoji: '🧤', category: 'clothing', cue: 'You wear them on your hands when it is cold.', sound: 'gl', also: ['glove', 'mittens'], level: 2 },
  { word: 'scarf', emoji: '🧣', category: 'clothing', cue: 'You wrap it around your neck in winter.', sound: 'sc', level: 2 },
  { word: 'glasses', emoji: '👓', category: 'clothing', cue: 'You wear them on your face to see better.', sound: 'gla', also: ['eyeglasses', 'spectacles'], level: 1 },
  { word: 'watch', emoji: '⌚', category: 'clothing', cue: 'You wear it on your wrist to tell the time.', sound: 'wa', also: ['wristwatch'], level: 2 },
  { word: 'purse', emoji: '👜', category: 'clothing', cue: 'A bag to carry your wallet and keys.', sound: 'pur', also: ['handbag', 'bag'], level: 2 },
  { word: 'necktie', emoji: '👔', category: 'clothing', cue: 'You wear it around your neck with a dress shirt.', sound: 'ne', also: ['tie', 'dress shirt'], level: 3 },
  { word: 'boot', emoji: '🥾', category: 'clothing', cue: 'A tall, heavy shoe for hiking or snow.', sound: 'boo', also: ['boots', 'hiking boot'], level: 2 },
  // Home
  { word: 'bed', emoji: '🛏️', category: 'home', cue: 'You sleep in it at night.', sound: 'be', level: 1 },
  { word: 'chair', emoji: '🪑', category: 'home', cue: 'You sit on it at the table.', sound: 'ch', level: 1 },
  { word: 'door', emoji: '🚪', category: 'home', cue: 'You open it to go into a room.', sound: 'do', level: 1 },
  { word: 'key', emoji: '🔑', category: 'object', cue: 'You use it to unlock a door or start a car.', sound: 'kee', level: 1 },
  { word: 'clock', emoji: '⏰', category: 'home', cue: 'It tells the time. It can ring to wake you up.', sound: 'cl', also: ['alarm clock', 'alarm'], level: 1 },
  { word: 'light bulb', emoji: '💡', category: 'home', cue: 'It screws into a lamp and lights up the room.', sound: 'li', also: ['lightbulb', 'bulb', 'light', 'lamp'], level: 2 },
  { word: 'television', emoji: '📺', category: 'home', cue: 'You watch shows and the news on it.', sound: 'te', also: ['tv', 't v'], level: 1 },
  { word: 'telephone', emoji: '☎️', category: 'home', cue: 'You use it to call someone.', sound: 'te', also: ['phone'], level: 2 },
  { word: 'candle', emoji: '🕯️', category: 'home', cue: 'It has a wick. You light it with a match.', sound: 'ca', level: 2 },
  { word: 'broom', emoji: '🧹', category: 'home', cue: 'You sweep the floor with it.', sound: 'br', level: 2 },
  { word: 'couch', emoji: '🛋️', category: 'home', cue: 'A long soft seat in the living room.', sound: 'cow', also: ['sofa'], level: 2 },
  { word: 'house', emoji: '🏠', category: 'home', cue: 'A building where people live.', sound: 'how', also: ['home'], level: 1 },
  { word: 'basket', emoji: '🧺', category: 'home', cue: 'You carry laundry or a picnic in it.', sound: 'ba', also: ['laundry basket'], level: 3 },
  { word: 'mirror', emoji: '🪞', category: 'bathroom', cue: 'You look in it to see yourself.', sound: 'mi', level: 2 },
  // Kitchen
  { word: 'spoon', emoji: '🥄', category: 'kitchen', cue: 'You eat soup or cereal with it.', sound: 'sp', level: 1 },
  { word: 'fork', emoji: '🍴', category: 'kitchen', cue: 'It has points. You eat with it.', sound: 'fo', also: ['fork and knife', 'silverware'], level: 1 },
  { word: 'pan', emoji: '🍳', category: 'kitchen', cue: 'You fry eggs in it on the stove.', sound: 'pa', also: ['frying pan', 'skillet'], level: 2 },
  { word: 'bowl', emoji: '🥣', category: 'kitchen', cue: 'You eat cereal or soup out of it.', sound: 'bo', also: ['cereal'], level: 2 },
  { word: 'cup', emoji: '🥤', category: 'kitchen', cue: 'You drink soda from it with a straw.', sound: 'cu', also: ['soda', 'drink'], level: 1 },
  // Bathroom
  { word: 'toothbrush', emoji: '🪥', category: 'bathroom', cue: 'You use it to clean your teeth.', sound: 'too', level: 1 },
  { word: 'soap', emoji: '🧼', category: 'bathroom', cue: 'You wash your hands with it.', sound: 'so', level: 1 },
  { word: 'bathtub', emoji: '🛁', category: 'bathroom', cue: 'You fill it with water and take a bath.', sound: 'ba', also: ['tub', 'bath'], level: 2 },
  { word: 'toilet', emoji: '🚽', category: 'bathroom', cue: 'It is in the bathroom. You flush it.', sound: 'toy', level: 2 },
  { word: 'toilet paper', emoji: '🧻', category: 'bathroom', cue: 'A soft roll of paper in the bathroom.', sound: 'toy', also: ['paper towel', 'paper towels', 'tissue', 'roll'], level: 3 },
  // Animals
  { word: 'dog', emoji: '🐶', category: 'animal', cue: 'A pet that barks and wags its tail.', sound: 'do', also: ['puppy'], level: 1 },
  { word: 'cat', emoji: '🐱', category: 'animal', cue: 'A pet that says meow.', sound: 'ca', also: ['kitten', 'kitty'], level: 1 },
  { word: 'cow', emoji: '🐄', category: 'animal', cue: 'A farm animal that gives milk.', sound: 'cow', level: 1 },
  { word: 'horse', emoji: '🐴', category: 'animal', cue: 'A big animal people ride.', sound: 'hor', also: ['pony'], level: 1 },
  { word: 'pig', emoji: '🐷', category: 'animal', cue: 'A pink farm animal that says oink.', sound: 'pi', level: 1 },
  { word: 'chicken', emoji: '🐔', category: 'animal', cue: 'A farm bird that lays eggs.', sound: 'chi', also: ['hen', 'rooster'], level: 1 },
  { word: 'fish', emoji: '🐟', category: 'animal', cue: 'It swims in water and has fins.', sound: 'fi', level: 1 },
  { word: 'bird', emoji: '🐦', category: 'animal', cue: 'It has wings and feathers and can fly.', sound: 'bur', level: 1 },
  { word: 'duck', emoji: '🦆', category: 'animal', cue: 'A bird that swims in a pond and says quack.', sound: 'du', level: 2 },
  { word: 'sheep', emoji: '🐑', category: 'animal', cue: 'A farm animal with wool.', sound: 'shee', also: ['lamb'], level: 2 },
  { word: 'bee', emoji: '🐝', category: 'animal', cue: 'A small insect that makes honey. It can sting.', sound: 'bee', also: ['honeybee', 'bumblebee'], level: 2 },
  { word: 'butterfly', emoji: '🦋', category: 'animal', cue: 'An insect with big colorful wings.', sound: 'bu', level: 2 },
  { word: 'turtle', emoji: '🐢', category: 'animal', cue: 'A slow animal with a shell on its back.', sound: 'tur', also: ['tortoise'], level: 2 },
  { word: 'frog', emoji: '🐸', category: 'animal', cue: 'A green animal that hops and says ribbit.', sound: 'fr', level: 2 },
  { word: 'elephant', emoji: '🐘', category: 'animal', cue: 'A huge gray animal with a trunk.', sound: 'e', level: 2 },
  { word: 'deer', emoji: '🦌', category: 'animal', cue: 'A wild animal in the woods. The male has antlers.', sound: 'dee', also: ['buck', 'reindeer'], level: 2 },
  { word: 'rabbit', emoji: '🐇', category: 'animal', cue: 'A small animal with long ears that hops.', sound: 'ra', also: ['bunny'], level: 2 },
  { word: 'squirrel', emoji: '🐿️', category: 'animal', cue: 'A small animal with a bushy tail. It collects nuts.', sound: 'skw', also: ['chipmunk'], level: 3 },
  { word: 'giraffe', emoji: '🦒', category: 'animal', cue: 'A tall animal with a very long neck.', sound: 'ji', level: 3 },
  { word: 'penguin', emoji: '🐧', category: 'animal', cue: 'A black and white bird that cannot fly. It lives in the cold.', sound: 'pen', level: 3 },
  // Vehicles
  { word: 'car', emoji: '🚗', category: 'vehicle', cue: 'You drive it on the road.', sound: 'ca', level: 1 },
  { word: 'bus', emoji: '🚌', category: 'vehicle', cue: 'A big vehicle that carries lots of people around town.', sound: 'bu', also: ['school bus'], level: 1 },
  { word: 'bicycle', emoji: '🚲', category: 'vehicle', cue: 'It has two wheels and pedals.', sound: 'bi', also: ['bike'], level: 1 },
  { word: 'airplane', emoji: '✈️', category: 'vehicle', cue: 'It flies people through the sky.', sound: 'air', also: ['plane', 'jet'], level: 1 },
  { word: 'train', emoji: '🚆', category: 'vehicle', cue: 'It runs on tracks.', sound: 'tr', level: 1 },
  { word: 'boat', emoji: '⛵', category: 'vehicle', cue: 'It floats on water. This one has a sail.', sound: 'bo', also: ['sailboat', 'ship'], level: 1 },
  { word: 'ambulance', emoji: '🚑', category: 'vehicle', cue: 'It takes sick or hurt people to the hospital.', sound: 'am', level: 2 },
  { word: 'fire truck', emoji: '🚒', category: 'vehicle', cue: 'A big red truck that comes to put out fires.', sound: 'fi', also: ['firetruck', 'fire engine'], level: 2 },
  { word: 'helicopter', emoji: '🚁', category: 'vehicle', cue: 'It flies with spinning blades on top.', sound: 'he', level: 3 },
  { word: 'tractor', emoji: '🚜', category: 'vehicle', cue: 'A farm vehicle with big back wheels.', sound: 'tr', level: 3 },
  // Nature
  { word: 'tree', emoji: '🌳', category: 'nature', cue: 'It is tall with a trunk, branches and leaves.', sound: 'tr', level: 1 },
  { word: 'flower', emoji: '🌸', category: 'nature', cue: 'It grows in a garden and smells nice.', sound: 'fl', also: ['blossom'], level: 1 },
  { word: 'sun', emoji: '☀️', category: 'nature', cue: 'It shines in the sky during the day.', sound: 'su', level: 1 },
  { word: 'moon', emoji: '🌙', category: 'nature', cue: 'You see it in the sky at night.', sound: 'moo', level: 1 },
  { word: 'star', emoji: '⭐', category: 'nature', cue: 'It twinkles in the night sky.', sound: 'st', level: 1 },
  { word: 'snowflake', emoji: '❄️', category: 'nature', cue: 'It falls from the sky in winter. Each one is different.', sound: 'sn', also: ['snow'], level: 2 },
  { word: 'fire', emoji: '🔥', category: 'nature', cue: 'It is hot and burns. You sit by it at a campfire.', sound: 'fi', also: ['flame', 'flames'], level: 1 },
  { word: 'rainbow', emoji: '🌈', category: 'nature', cue: 'Colors in the sky after it rains.', sound: 'ray', level: 2 },
  { word: 'cactus', emoji: '🌵', category: 'nature', cue: 'A prickly plant that grows in the desert.', sound: 'ca', level: 3 },
  { word: 'mountain', emoji: '⛰️', category: 'nature', cue: 'Very tall land. People climb it.', sound: 'mow', also: ['mountains', 'hill'], level: 2 },
  { word: 'leaf', emoji: '🍁', category: 'nature', cue: 'It grows on a tree and falls off in autumn.', sound: 'lee', also: ['leaves', 'maple leaf'], level: 2 },
  // Objects
  { word: 'book', emoji: '📖', category: 'object', cue: 'It has pages. You read it.', sound: 'boo', level: 1 },
  { word: 'pen', emoji: '🖊️', category: 'object', cue: 'You write with it. It has ink.', sound: 'pe', level: 1 },
  { word: 'scissors', emoji: '✂️', category: 'object', cue: 'You cut paper with them.', sound: 'si', level: 2 },
  { word: 'hammer', emoji: '🔨', category: 'object', cue: 'A tool you use to pound in nails.', sound: 'ha', level: 2 },
  { word: 'umbrella', emoji: '☂️', category: 'object', cue: 'It keeps you dry in the rain.', sound: 'um', level: 2 },
  { word: 'envelope', emoji: '✉️', category: 'object', cue: 'You put a letter in it and mail it.', sound: 'en', also: ['letter', 'mail'], level: 3 },
  { word: 'ball', emoji: '⚽', category: 'object', cue: 'You kick it in soccer.', sound: 'ba', also: ['soccer ball', 'football'], level: 1 },
  { word: 'gift', emoji: '🎁', category: 'object', cue: 'A wrapped box you give on a birthday.', sound: 'gi', also: ['present', 'box'], level: 2 },
  { word: 'balloon', emoji: '🎈', category: 'object', cue: 'You blow air into it. It floats at a party.', sound: 'ba', level: 2 },
  { word: 'cell phone', emoji: '📱', category: 'object', cue: 'You carry it in your pocket to call and text.', sound: 'se', also: ['phone', 'cellphone', 'smartphone', 'mobile phone'], level: 1 },
  { word: 'camera', emoji: '📷', category: 'object', cue: 'You take pictures with it.', sound: 'ca', level: 2 },
  { word: 'computer', emoji: '💻', category: 'object', cue: 'You type and use the internet on it.', sound: 'com', also: ['laptop'], level: 2 },
  { word: 'lock', emoji: '🔒', category: 'object', cue: 'You need a key or a code to open it.', sound: 'lo', also: ['padlock'], level: 2 },
  { word: 'flag', emoji: '🚩', category: 'object', cue: 'Cloth on a pole that waves in the wind.', sound: 'fl', level: 3 },
  { word: 'magnet', emoji: '🧲', category: 'object', cue: 'It sticks to the refrigerator. It pulls metal.', sound: 'ma', level: 3 },
  { word: 'calendar', emoji: '📅', category: 'object', cue: 'It shows the days and months of the year.', sound: 'ca', level: 3 },
  // Health
  { word: 'pill', emoji: '💊', category: 'health', cue: 'Medicine you swallow with water.', sound: 'pi', also: ['pills', 'medicine', 'capsule', 'tablet'], level: 1 },
  { word: 'bandage', emoji: '🩹', category: 'health', cue: 'You put it on a small cut.', sound: 'ban', also: ['band aid', 'bandaid'], level: 2 },
  { word: 'thermometer', emoji: '🌡️', category: 'health', cue: 'It tells you if you have a fever.', sound: 'ther', level: 3 },
  { word: 'wheelchair', emoji: '🦽', category: 'health', cue: 'A chair with wheels for someone who cannot walk far.', sound: 'wee', level: 3 },
  { word: 'tooth', emoji: '🦷', category: 'health', cue: 'You chew with it. The dentist checks it.', sound: 'too', also: ['teeth'], level: 2 },
  // Music
  { word: 'guitar', emoji: '🎸', category: 'music', cue: 'You strum its strings to play music.', sound: 'gi', level: 2 },
  { word: 'drum', emoji: '🥁', category: 'music', cue: 'You hit it with sticks to keep the beat.', sound: 'dr', also: ['drums'], level: 2 },
  { word: 'piano', emoji: '🎹', category: 'music', cue: 'It has black and white keys.', sound: 'pee', also: ['keyboard'], level: 2 },
  { word: 'trumpet', emoji: '🎺', category: 'music', cue: 'A shiny horn you blow into.', sound: 'tr', also: ['horn'], level: 3 },
  { word: 'violin', emoji: '🎻', category: 'music', cue: 'You play it with a bow under your chin.', sound: 'vi', also: ['fiddle'], level: 3 },
];

export const picturesUpTo = (level: number) => PICTURES.filter((p) => p.level <= level);
