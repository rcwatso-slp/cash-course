// Everyday tasks for Put It in Order. Steps are in the right order. Original content.

export interface Sequence {
  title: string;
  emoji: string;
  steps: string[];
}

export const SEQUENCES: Sequence[] = [
  // 3 steps
  { title: 'Make toast', emoji: '🍞', steps: ['Put bread in the toaster', 'Push the lever down', 'Spread butter on the toast'] },
  { title: 'Wash your hands', emoji: '🧼', steps: ['Turn on the water and wet your hands', 'Rub soap on your hands for 20 seconds', 'Rinse and dry your hands'] },
  { title: 'Mail a letter', emoji: '✉️', steps: ['Put the letter in the envelope', 'Put a stamp on the envelope', 'Drop it in the mailbox'] },
  { title: 'Drink a glass of water', emoji: '🥛', steps: ['Get a glass from the cabinet', 'Fill it at the sink', 'Drink the water'] },
  { title: 'Brush your teeth', emoji: '🪥', steps: ['Put toothpaste on the toothbrush', 'Brush your teeth', 'Rinse your mouth'] },
  { title: 'Take a pill', emoji: '💊', steps: ['Open the pill bottle', 'Take out one pill', 'Swallow it with water'] },
  // 4 steps
  { title: 'Make a cup of coffee', emoji: '☕', steps: ['Put a filter in the coffee maker', 'Add coffee grounds', 'Pour in water and turn it on', 'Pour the coffee into a mug'] },
  { title: 'Make a phone call', emoji: '📱', steps: ['Unlock your phone', 'Open the phone app', 'Dial the number', 'Wait for them to answer'] },
  { title: 'Make a sandwich', emoji: '🥪', steps: ['Get out two slices of bread', 'Spread mustard on the bread', 'Add turkey and cheese', 'Put the slices together'] },
  { title: 'Get dressed for cold weather', emoji: '🧥', steps: ['Put on your socks', 'Put on your shoes', 'Put on your coat', 'Put on your gloves'] },
  { title: 'Water a plant', emoji: '🪴', steps: ['Check if the soil is dry', 'Fill the watering can', 'Pour water on the soil', 'Put the can away'] },
  // 5 steps
  { title: 'Do a load of laundry', emoji: '🧺', steps: ['Sort the dirty clothes', 'Put the clothes in the washer', 'Add detergent and start the washer', 'Move the wet clothes to the dryer', 'Fold the dry clothes'] },
  { title: 'Scramble eggs', emoji: '🍳', steps: ['Crack the eggs into a bowl', 'Beat the eggs with a fork', 'Heat butter in a pan', 'Pour the eggs into the pan and stir', 'Put the eggs on a plate'] },
  { title: 'Go grocery shopping', emoji: '🛒', steps: ['Make a shopping list', 'Drive or ride to the store', 'Put the items in your cart', 'Pay at the checkout', 'Put the groceries away at home'] },
  { title: 'Refill a prescription', emoji: '🏥', steps: ['Check how many pills are left', 'Call the pharmacy with the prescription number', 'Wait for the text that it is ready', 'Go to the pharmacy', 'Pay and pick it up'] },
  { title: 'Take a shower', emoji: '🚿', steps: ['Get a clean towel ready', 'Turn on the water and check the temperature', 'Wash with soap and shampoo', 'Rinse off and turn off the water', 'Dry off with the towel'] },
  // 6–7 steps
  { title: 'Bake a frozen pizza', emoji: '🍕', steps: ['Read the directions on the box', 'Turn on the oven to heat up', 'Take the pizza out of the box and plastic', 'Put the pizza in the oven when it is hot', 'Set a timer', 'Take the pizza out with oven mitts', 'Let it cool, then cut it'] },
  { title: 'See the doctor', emoji: '🩺', steps: ['Call to make an appointment', 'Write the date on your calendar', 'Get a ride for that day', 'Check in at the front desk', 'Wait to be called', 'Talk with the doctor'] },
  { title: 'Send a text message', emoji: '💬', steps: ['Unlock your phone', 'Open the messages app', 'Pick the person to text', 'Type your message', 'Read it over', 'Press send'] },
  { title: 'Plan a birthday dinner', emoji: '🎂', steps: ['Pick a date', 'Invite the guests', 'Make a grocery list', 'Buy the food and a cake', 'Cook the dinner', 'Light the candles and sing'] },
  { title: 'Change a light bulb', emoji: '💡', steps: ['Turn off the light switch', 'Let the old bulb cool down', 'Unscrew the old bulb', 'Screw in the new bulb', 'Turn the switch back on', 'Throw away the old bulb'] },
];

export const sequencesFor = (level: 1 | 2 | 3) =>
  SEQUENCES.filter((s) => (level === 1 ? s.steps.length <= 4 : level === 2 ? s.steps.length >= 4 && s.steps.length <= 5 : s.steps.length >= 5));
