// Original content for WRAP: Write it, Repeat it, Associate it, Picture it.
// Level 1: one fact. Level 2: two parts. Level 3: three or more parts.

export interface WrapItem {
  id: string;
  level: 1 | 2 | 3;
  emoji: string;
  /** What kind of thing it is: Appointment, Name, Parking... */
  kind: string;
  /** The thing to remember, said to the patient. */
  fact: string;
  /** A short written note, as an example for "Write it". */
  note: string;
  q: string;
  answer: string;
  /** Typed answers: each part must be there. Each part lists ways to say it. */
  parts: string[][];
  /** Three wrong choices, close to the answer. */
  wrong: [string, string, string];
  /** An idea for "Associate it". */
  link: string;
  /** An idea for "Picture it". */
  picture: string;
  pictureEmoji: string;
}

export const WRAP_ITEMS: WrapItem[] = [
  // ---------- Level 1: one fact ----------
  {
    id: 'park-level', level: 1, emoji: '🅿️', kind: 'Parking', fact: 'You parked on level 3.', note: 'Car: level 3',
    q: 'What level did you park on?', answer: 'Level 3', parts: [['3', 'three']], wrong: ['Level 1', 'Level 5', 'Level 2'],
    link: 'A tricycle has 3 wheels. Your car is on the tricycle level.', picture: 'Picture your car sitting on top of a giant number 3.', pictureEmoji: '🚗 3️⃣',
  },
  {
    id: 'aide-name', level: 1, emoji: '🧑‍⚕️', kind: 'Name', fact: 'The new aide’s name is Rosa.', note: 'Aide = Rosa',
    q: 'What is the new aide’s name?', answer: 'Rosa', parts: [['rosa']], wrong: ['Rita', 'Rhonda', 'Maria'],
    link: 'Rosa sounds like “rose.”', picture: 'Picture Rosa holding a big red rose.', pictureEmoji: '🌹',
  },
  {
    id: 'room-214', level: 1, emoji: '🚪', kind: 'Room', fact: 'Your room number is 214.', note: 'Room 214',
    q: 'What is your room number?', answer: '214', parts: [['214', '2 14', 'two fourteen', 'two one four']], wrong: ['241', '124', '204'],
    link: '2/14 is Valentine’s Day.', picture: 'Picture a big valentine heart taped to your door.', pictureEmoji: '❤️ 🚪',
  },
  {
    id: 'keys-bowl', level: 1, emoji: '🔑', kind: 'Where it is', fact: 'Your keys are in the blue bowl by the door.', note: 'Keys: blue bowl',
    q: 'Where are your keys?', answer: 'In the blue bowl', parts: [['blue'], ['bowl']], wrong: ['In the kitchen drawer', 'On the nightstand', 'In your coat pocket'],
    link: 'Blue and bowl both start with B.', picture: 'Picture your keys splashing into a bowl of blue water.', pictureEmoji: '🔑 🥣 💧',
  },
  {
    id: 'dinner-soup', level: 1, emoji: '🍲', kind: 'Meal', fact: 'Dinner tonight is chicken soup.', note: 'Dinner: chicken soup',
    q: 'What is for dinner tonight?', answer: 'Chicken soup', parts: [['chicken'], ['soup']], wrong: ['Beef stew', 'Tomato soup', 'Chicken salad'],
    link: 'Chicken soup is what people eat to feel better.', picture: 'Picture a chicken in an apron stirring a pot of soup.', pictureEmoji: '🐔 🍲',
  },
  {
    id: 'pt-ten', level: 1, emoji: '🦶', kind: 'Appointment', fact: 'Your physical therapy is at 10 o’clock.', note: 'PT at 10',
    q: 'What time is physical therapy?', answer: '10 o’clock', parts: [['10', 'ten']], wrong: ['11 o’clock', '2 o’clock', '9 o’clock'],
    link: 'Ten toes: physical therapy works on walking.', picture: 'Picture ten toes marching into the therapy gym.', pictureEmoji: '🦶 🦶 🔟',
  },
  {
    id: 'bus-seven', level: 1, emoji: '🚌', kind: 'Bus', fact: 'Take bus number 7.', note: 'Bus 7',
    q: 'Which bus do you take?', answer: 'Bus 7', parts: [['7', 'seven']], wrong: ['Bus 17', 'Bus 1', 'Bus 70'],
    link: '7 is a lucky number. It’s the lucky bus.', picture: 'Picture a bus covered in four-leaf clovers with a big 7 on the front.', pictureEmoji: '🍀 🚌',
  },
  {
    id: 'game-saturday', level: 1, emoji: '🏟️', kind: 'Event', fact: 'Your grandson’s game is on Saturday.', note: 'Game: Saturday',
    q: 'What day is the game?', answer: 'Saturday', parts: [['saturday', 'sat']], wrong: ['Sunday', 'Friday', 'Thursday'],
    link: 'Saturday: you SAT in the stands.', picture: 'Picture yourself sitting in the stands, cheering.', pictureEmoji: '🏟️ 📣',
  },
  {
    id: 'mail-hook', level: 1, emoji: '📬', kind: 'Where it is', fact: 'The mail key is on the green hook.', note: 'Mail key: green hook',
    q: 'Which hook is the mail key on?', answer: 'The green hook', parts: [['green']], wrong: ['The red hook', 'The yellow hook', 'The black hook'],
    link: 'Green means go. Go get the mail.', picture: 'Picture a green traffic light on top of the mailbox.', pictureEmoji: '🟢 📬',
  },
  {
    id: 'pharmacy-six', level: 1, emoji: '💊', kind: 'Time', fact: 'The pharmacy closes at 6.', note: 'Pharmacy closes 6',
    q: 'What time does the pharmacy close?', answer: '6 o’clock', parts: [['6', 'six']], wrong: ['5 o’clock', '8 o’clock', '9 o’clock'],
    link: 'It rhymes: “Pick up by six.”', picture: 'Picture a pill bottle with clock hands pointing to 6.', pictureEmoji: '💊 🕕',
  },
  {
    id: 'doctor-baker', level: 1, emoji: '🩺', kind: 'Name', fact: 'Your new doctor is Dr. Baker.', note: 'Dr. Baker',
    q: 'What is your new doctor’s name?', answer: 'Dr. Baker', parts: [['baker']], wrong: ['Dr. Barker', 'Dr. Parker', 'Dr. Walker'],
    link: 'A baker bakes bread.', picture: 'Picture the doctor in a chef’s hat, holding a loaf of bread.', pictureEmoji: '👨‍⚕️ 🍞',
  },
  {
    id: 'eye-glasses', level: 1, emoji: '👓', kind: 'Bring', fact: 'Bring your glasses to the eye appointment.', note: 'Eye appt: bring glasses',
    q: 'What do you bring to the eye appointment?', answer: 'Your glasses', parts: [['glasses', 'eyeglasses']], wrong: ['Your hearing aids', 'Your cane', 'Your library card'],
    link: 'Eyes and glasses go together.', picture: 'Picture a giant eye wearing glasses.', pictureEmoji: '👁️ 👓',
  },

  // ---------- Level 2: two parts ----------
  {
    id: 'dentist-tue', level: 2, emoji: '🦷', kind: 'Appointment', fact: 'Your dentist appointment is on Tuesday at 2:30.', note: 'Dentist Tue 2:30',
    q: 'When is your dentist appointment?', answer: 'Tuesday at 2:30', parts: [['tuesday', 'tue'], ['2 30', '230', 'two thirty']],
    wrong: ['Thursday at 2:30', 'Tuesday at 3:20', 'Thursday at 3:20'],
    link: 'Tuesday sounds like “Tooth-day.” 2:30 sounds like “tooth-hurty.”', picture: 'Picture a giant tooth wearing a watch that says 2:30.', pictureEmoji: '🦷 ⌚',
  },
  {
    id: 'park-g2', level: 2, emoji: '🅿️', kind: 'Parking', fact: 'You parked in row G on level 2.', note: 'Car: row G, level 2',
    q: 'Where did you park?', answer: 'Row G, level 2', parts: [['g'], ['2', 'two']], wrong: ['Row C, level 2', 'Row G, level 3', 'Row B, level 2'],
    link: 'G2: “Gee, that’s too far to walk!”', picture: 'Picture a giant letter G riding on two wheels.', pictureEmoji: '🅶 🛞 🛞',
  },
  {
    id: 'call-sister', level: 2, emoji: '☎️', kind: 'Message', fact: 'Call your sister back after 7 tonight.', note: 'Call sister after 7',
    q: 'Who do you need to call, and when?', answer: 'Your sister, after 7', parts: [['sister'], ['7', 'seven']],
    wrong: ['Your brother, after 7', 'Your sister, after 9', 'Your daughter, after 7'],
    link: '7 o’clock is after supper: “Sister after supper.”', picture: 'Picture your sister holding a phone shaped like a 7.', pictureEmoji: '👩 ☎️ 7️⃣',
  },
  {
    id: 'flu-friday', level: 2, emoji: '💉', kind: 'Appointment', fact: 'Your flu shot is at the pharmacy on Friday.', note: 'Flu shot: pharmacy, Fri',
    q: 'Where and when is your flu shot?', answer: 'At the pharmacy on Friday', parts: [['pharmacy', 'drugstore', 'drug store'], ['friday', 'fri']],
    wrong: ['At the clinic on Friday', 'At the pharmacy on Monday', 'At the clinic on Monday'],
    link: 'Flu and Friday both start with F.', picture: 'Picture the pharmacy sign flashing “FRIDAY” in big lights.', pictureEmoji: '🏪 💡',
  },
  {
    id: 'neighbor-dog', level: 2, emoji: '🐶', kind: 'Names', fact: 'The new neighbor is Sam, and his dog is named Buster.', note: 'Neighbor Sam, dog Buster',
    q: 'What are the neighbor’s name and his dog’s name?', answer: 'Sam and Buster', parts: [['sam'], ['buster']],
    wrong: ['Stan and Buster', 'Sam and Buddy', 'Stan and Buddy'],
    link: 'Buster “busts” through the fence to see Sam.', picture: 'Picture a dog bursting through a fence into Sam’s arms.', pictureEmoji: '🐕 💥 🧍',
  },
  {
    id: 'blue-pill', level: 2, emoji: '💊', kind: 'Medicine', fact: 'Take the blue pill with breakfast.', note: 'Blue pill: breakfast',
    q: 'Which pill, and when do you take it?', answer: 'The blue pill, with breakfast', parts: [['blue'], ['breakfast', 'morning']],
    wrong: ['The white pill, with breakfast', 'The blue pill, at bedtime', 'The white pill, at bedtime'],
    link: 'Blue sky in the morning: blue pill in the morning.', picture: 'Picture a blue pill sitting on a fried egg.', pictureEmoji: '🔵 🍳',
  },
  {
    id: 'library-books', level: 2, emoji: '📚', kind: 'Errand', fact: 'Return 3 library books by the 15th.', note: '3 library books by 15th',
    q: 'How many books, and when are they due?', answer: '3 books, by the 15th', parts: [['3', 'three'], ['15', 'fifteen']],
    wrong: ['2 books, by the 15th', '3 books, by the 5th', '2 books, by the 5th'],
    link: '3 times 5 is 15.', picture: 'Picture three books stacked on a calendar page that says 15.', pictureEmoji: '📚 📅',
  },
  {
    id: 'meeting-108', level: 2, emoji: '🏢', kind: 'Where it is', fact: 'The meeting is in Room 108 on the first floor.', note: 'Room 108, 1st floor',
    q: 'Where is the meeting?', answer: 'Room 108, first floor', parts: [['108', 'one oh eight'], ['first', '1st', '1 floor']],
    wrong: ['Room 180, first floor', 'Room 108, second floor', 'Room 801, first floor'],
    link: '108 starts with 1: the first floor.', picture: 'Picture a door with a giant 1 on it, and 08 underneath.', pictureEmoji: '🚪 1️⃣',
  },
  {
    id: 'garbage-wed', level: 2, emoji: '🗑️', kind: 'Chore', fact: 'The garbage goes out on Wednesday night.', note: 'Garbage out Wed night',
    q: 'What goes out, and when?', answer: 'The garbage, Wednesday night', parts: [['garbage', 'trash'], ['wednesday', 'wed']],
    wrong: ['The recycling, Wednesday night', 'The garbage, Thursday night', 'The recycling, Thursday night'],
    link: 'Wednesday is the middle of the week. The garbage goes out mid-week.', picture: 'Picture a garbage can wearing a sign that says WEDNESDAY.', pictureEmoji: '🗑️ 🪧',
  },
  {
    id: 'pickup-noon', level: 2, emoji: '🚗', kind: 'Plan', fact: 'Your daughter will pick you up at noon by the front door.', note: 'Daughter: noon, front door',
    q: 'When and where will your daughter pick you up?', answer: 'At noon, by the front door', parts: [['noon', '12', 'twelve'], ['front']],
    wrong: ['At noon, by the side door', 'At 2, by the front door', 'At 2, by the side door'],
    link: 'At noon the sun is right overhead, shining on the front door.', picture: 'Picture the sun sitting right on top of the front door.', pictureEmoji: '☀️ 🚪',
  },
  {
    id: 'cable-magnet', level: 2, emoji: '📺', kind: 'Where it is', fact: 'The cable company’s number is on the fridge, under the apple magnet.', note: 'Cable #: fridge, apple magnet',
    q: 'Where is the cable company’s number?', answer: 'On the fridge, under the apple magnet', parts: [['fridge', 'refrigerator'], ['apple']],
    wrong: ['On the fridge, under the flower magnet', 'In the drawer, under the apple magnet', 'On the desk, under the lamp'],
    link: 'An apple a day keeps the TV repairman away.', picture: 'Picture a big red apple holding the TV remote.', pictureEmoji: '🍎 📺',
  },
  {
    id: 'choir-thu', level: 2, emoji: '🎤', kind: 'Event', fact: 'Choir practice is Thursday at 4.', note: 'Choir Thu 4:00',
    q: 'When is choir practice?', answer: 'Thursday at 4', parts: [['thursday', 'thu', 'thurs'], ['4', 'four']],
    wrong: ['Tuesday at 4', 'Thursday at 5', 'Tuesday at 5'],
    link: 'A quartet has 4 singers.', picture: 'Picture four singers holding up a Thursday calendar page.', pictureEmoji: '🎤 🎤 🎤 🎤',
  },

  // ---------- Level 3: three or more parts ----------
  {
    id: 'eye-appt', level: 3, emoji: '👁️', kind: 'Appointment', fact: 'Your eye appointment is Monday at 9:15, on the 4th floor.', note: 'Eye appt Mon 9:15, 4th fl',
    q: 'When and where is your eye appointment?', answer: 'Monday at 9:15, 4th floor', parts: [['monday', 'mon'], ['9 15', '915', 'nine fifteen', 'quarter after 9', 'quarter after nine'], ['4th', 'fourth', '4 floor']],
    wrong: ['Monday at 9:15, 5th floor', 'Sunday at 9:15, 4th floor', 'Monday at 9:50, 4th floor'],
    link: 'EYES has 4 letters: the 4th floor. 9:15 is a quarter after 9 on Monday morning.', picture: 'Picture a pair of glasses riding the elevator to floor 4, a clock reading 9:15.', pictureEmoji: '👓 🛗 4️⃣',
  },
  {
    id: 'milk-bread-stamps', level: 3, emoji: '🛒', kind: 'Errand', fact: 'Pick up milk, bread and stamps on the way home.', note: 'Milk, bread, stamps',
    q: 'What three things do you need to pick up?', answer: 'Milk, bread and stamps', parts: [['milk'], ['bread'], ['stamp']],
    wrong: ['Milk, eggs and stamps', 'Milk, bread and envelopes', 'Juice, bread and stamps'],
    link: 'Breakfast and the mail: milk and bread for breakfast, stamps for the letters.', picture: 'Picture a loaf of bread pouring milk onto a stamped letter.', pictureEmoji: '🍞 🥛 ✉️',
  },
  {
    id: 'plumber', level: 3, emoji: '🔧', kind: 'Plan', fact: 'The plumber is coming Thursday between 1 and 3. Leave the side door open.', note: 'Plumber Thu 1–3, side door',
    q: 'When is the plumber coming, and which door do you leave open?', answer: 'Thursday, 1 to 3, the side door', parts: [['thursday', 'thu', 'thurs'], ['1', 'one'], ['side']],
    wrong: ['Tuesday, 1 to 3, the side door', 'Thursday, 1 to 3, the front door', 'Thursday, 3 to 5, the side door'],
    link: 'The pipes run along the side of the house, so the plumber uses the side door.', picture: 'Picture a plumber squeezing through the side door, carrying a Thursday sign.', pictureEmoji: '🔧 🚪',
  },
  {
    id: 'blood-test', level: 3, emoji: '🩸', kind: 'Appointment', fact: 'Your blood test is Wednesday at 8. Don’t eat after midnight. Bring your insurance card.', note: 'Blood test Wed 8. No food after midnight. Insurance card',
    q: 'When is the blood test, what can’t you do, and what do you bring?', answer: 'Wednesday at 8, no food after midnight, insurance card',
    parts: [['wednesday', 'wed'], ['8', 'eight'], ['eat', 'food', 'fast'], ['insurance', 'card']],
    wrong: ['Wednesday at 9, no food after midnight, photo ID', 'Tuesday at 8, no food after midnight, insurance card', 'Wednesday at 8, no coffee after noon, insurance card'],
    link: 'Empty stomach, full wallet: no food, but bring the card.', picture: 'Picture an empty plate with your insurance card on it, and a clock at 8.', pictureEmoji: '🍽️ 💳 🕗',
  },
  {
    id: 'cafe-elm', level: 3, emoji: '☕', kind: 'Plan', fact: 'Meet your friend at the café on Elm Street at 11 on Saturday.', note: 'Café on Elm, Sat 11',
    q: 'Where and when are you meeting your friend?', answer: 'The café on Elm Street, Saturday at 11', parts: [['elm'], ['saturday', 'sat'], ['11', 'eleven']],
    wrong: ['The café on Oak Street, Saturday at 11', 'The café on Elm Street, Sunday at 11', 'The café on Elm Street, Saturday at 1'],
    link: 'An elm is a tree. 11 looks like two tree trunks.', picture: 'Picture a coffee cup sitting under a tall elm tree with two trunks, like 11.', pictureEmoji: '☕ 🌳 🌳',
  },
  {
    id: 'water-garden', level: 3, emoji: '🪴', kind: 'Chore', fact: 'Water the tomatoes every morning before 9, with the green watering can.', note: 'Tomatoes: mornings before 9, green can',
    q: 'What do you water, by what time, and with which can?', answer: 'The tomatoes, before 9, with the green can', parts: [['tomato'], ['9', 'nine'], ['green']],
    wrong: ['The roses, before 9, with the green can', 'The tomatoes, before 10, with the green can', 'The tomatoes, before 9, with the red can'],
    link: 'Tomato plants have green leaves. Water before 9, before the sun gets hot.', picture: 'Picture a green watering can pouring onto red tomatoes, with a clock at 9.', pictureEmoji: '🍅 🪴 🕘',
  },
  {
    id: 'bus-22', level: 3, emoji: '🚏', kind: 'Bus', fact: 'The bus to the senior center leaves at 9:40 from the stop by the bank. It’s bus 22.', note: 'Bus 22, 9:40, stop by bank',
    q: 'Which bus, what time, and where is the stop?', answer: 'Bus 22 at 9:40, by the bank', parts: [['22', 'twenty two'], ['9 40', '940', 'nine forty'], ['bank']],
    wrong: ['Bus 12 at 9:40, by the bank', 'Bus 22 at 9:14, by the bank', 'Bus 22 at 9:40, by the church'],
    link: '22 looks like two swans. 9:40 is 20 minutes before 10.', picture: 'Picture two swans waiting at the bus stop in front of the bank.', pictureEmoji: '🦢 🦢 🏦',
  },
  {
    id: 'birthday-june', level: 3, emoji: '🎂', kind: 'Birthday', fact: 'Your granddaughter’s birthday is June 12th. She is turning 9, and she loves horses.', note: 'Granddaughter: June 12, turning 9, horses',
    q: 'When is her birthday, how old is she turning, and what does she love?', answer: 'June 12th, turning 9, horses', parts: [['june', 'jun'], ['12', 'twelve'], ['9', 'nine'], ['horse']],
    wrong: ['July 12th, turning 9, horses', 'June 12th, turning 8, horses', 'June 21st, turning 9, dogs'],
    link: 'June is summer, the time for horseback riding. 12 and 9 are both on a clock face.', picture: 'Picture a horse in a party hat, with 9 candles, on a June calendar.', pictureEmoji: '🐴 🥳 🕯️',
  },
  {
    id: 'batteries', level: 3, emoji: '🔋', kind: 'Where it is', fact: 'Your hearing aid batteries are size 312. They are in the top drawer, on the left side.', note: 'Batteries 312: top drawer, left',
    q: 'What size are the batteries, and where are they?', answer: 'Size 312, top drawer, left side', parts: [['312', 'three twelve', 'three one two'], ['top'], ['left']],
    wrong: ['Size 13, top drawer, left side', 'Size 312, bottom drawer, left side', 'Size 312, top drawer, right side'],
    link: 'Top left is where you start reading a page. Start there.', picture: 'Picture a battery marked 312 sitting in the top left corner of the drawer.', pictureEmoji: '🔋 ↖️',
  },
  {
    id: 'book-club', level: 3, emoji: '📖', kind: 'Event', fact: 'Book club meets the first Tuesday of the month at the library, at 6:30.', note: 'Book club: 1st Tue, library, 6:30',
    q: 'When and where does book club meet?', answer: 'First Tuesday, at the library, at 6:30', parts: [['first', '1st'], ['tuesday', 'tue'], ['library'], ['6 30', '630', 'six thirty']],
    wrong: ['Second Tuesday, at the library, at 6:30', 'First Tuesday, at the church, at 6:30', 'First Thursday, at the library, at 6:30'],
    link: 'Books belong in the library. Start the month with a story: the first Tuesday.', picture: 'Picture a book opening to page 1 on a Tuesday calendar.', pictureEmoji: '📖 1️⃣ 📅',
  },
];

/** Questions about the strategy itself, for "Learn the steps". The first option is right. */
export const WRAP_STEPS_QUIZ: { q: string; options: [string, string, string, string]; why: string }[] = [
  { q: 'What does the W in WRAP stand for?', options: ['Write it', 'Wait for it', 'Wonder about it', 'Watch it'], why: 'W is Write it: put it on paper, in your phone or on a calendar.' },
  { q: 'What does the R in WRAP stand for?', options: ['Repeat it', 'Read it', 'Rest', 'Remove it'], why: 'R is Repeat it: say it out loud a few times.' },
  { q: 'What does the A in WRAP stand for?', options: ['Associate it', 'Ask for it', 'Answer it', 'Add it up'], why: 'A is Associate it: link it to something you already know.' },
  { q: 'What does the P in WRAP stand for?', options: ['Picture it', 'Plan it', 'Practice it', 'Point to it'], why: 'P is Picture it: make a picture of it in your mind.' },
  { q: 'You write the appointment on your calendar. Which WRAP step is that?', options: ['Write it', 'Repeat it', 'Associate it', 'Picture it'], why: 'Putting it on paper or a calendar is Write it.' },
  { q: 'You say “Room 214, Room 214, Room 214” out loud. Which step is that?', options: ['Repeat it', 'Write it', 'Associate it', 'Picture it'], why: 'Saying it again and again is Repeat it.' },
  { q: 'You think, “Rosa sounds like rose.” Which step is that?', options: ['Associate it', 'Repeat it', 'Write it', 'Picture it'], why: 'Linking it to something you know is Associate it.' },
  { q: 'You imagine your keys splashing into a blue bowl. Which step is that?', options: ['Picture it', 'Associate it', 'Repeat it', 'Write it'], why: 'Making a picture in your mind is Picture it.' },
  { q: 'A nurse tells you your new room number. What is the first thing WRAP says to do?', options: ['Write it down', 'Wait until later', 'Try to guess it', 'Ask someone else to remember it'], why: 'W comes first: write it down so you have it.' },
  { q: 'Why does “Associate it” help you remember?', options: ['It ties the new fact to something you already know', 'It makes the fact shorter', 'It lets someone else remember for you', 'It makes the fact go away'], why: 'New facts stick better when they are hooked to something already in your memory.' },
  { q: 'Which is the best picture for “Dr. Baker”?', options: ['The doctor in a chef’s hat holding bread', 'A plain white wall', 'A random number', 'A blank piece of paper'], why: 'A picture that matches the name (a baker with bread) is easy to see and recall.' },
  { q: 'Where is a good place to write things you need to remember?', options: ['A calendar or notebook you always keep in the same place', 'A scrap of paper you throw away', 'The back of your hand', 'Nowhere: just hope you remember'], why: 'Keep notes in one place you check every day.' },
];

export const WRAP_STEPS: { letter: 'W' | 'R' | 'A' | 'P'; title: string; how: string }[] = [
  { letter: 'W', title: 'Write it', how: 'Write it down in a few words: on paper, in your phone, or on a calendar.' },
  { letter: 'R', title: 'Repeat it', how: 'Say it out loud, 3 times.' },
  { letter: 'A', title: 'Associate it', how: 'Link it to something you already know.' },
  { letter: 'P', title: 'Picture it', how: 'Close your eyes. Make a picture of it in your mind.' },
];
