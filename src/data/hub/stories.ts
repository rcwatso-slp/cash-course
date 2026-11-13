// Short practical passages for Story Recall. Original text.
// The first option in each question is the right one. The app shuffles them.

export interface StoryQuestion {
  q: string;
  options: string[];
  /** Points to the part of the passage that has the answer. */
  hint: string;
}

export interface Story {
  id: string;
  level: 1 | 2 | 3;
  kind: string;
  emoji: string;
  title: string;
  text: string;
  questions: StoryQuestion[];
}

export const STORIES: Story[] = [
  // Level 1: two or three sentences
  {
    id: 'pharmacy',
    level: 1,
    kind: 'Voicemail',
    emoji: '📞',
    title: 'Message from the pharmacy',
    text: 'Hi, this is Lakeside Pharmacy. Your prescription is ready. You can pick it up after 3 o’clock today.',
    questions: [
      { q: 'Who called?', options: ['The pharmacy', 'The bank', 'The dentist', 'A friend'], hint: 'Think about where the medicine comes from.' },
      { q: 'What is ready?', options: ['A prescription', 'A pizza', 'The car', 'A haircut'], hint: 'They said something is ready to pick up.' },
      { q: 'When can you pick it up?', options: ['After 3 o’clock', 'Before noon', 'Tomorrow morning', 'Next week'], hint: 'They gave a time today.' },
    ],
  },
  {
    id: 'dinner',
    level: 1,
    kind: 'Text message',
    emoji: '💬',
    title: 'Text from your sister',
    text: 'Hi! I’m bringing dinner tonight. I’ll make chicken soup. See you at 6.',
    questions: [
      { q: 'What is she bringing?', options: ['Dinner', 'Flowers', 'A movie', 'Breakfast'], hint: 'She is bringing a meal.' },
      { q: 'What will she make?', options: ['Chicken soup', 'Spaghetti', 'Tacos', 'Pancakes'], hint: 'It is something warm in a bowl.' },
      { q: 'What time is she coming?', options: ['6', '4', '8', 'Noon'], hint: 'She said “See you at …”' },
    ],
  },
  {
    id: 'weather',
    level: 1,
    kind: 'Weather report',
    emoji: '🌧️',
    title: 'Today’s weather',
    text: 'Today will be cloudy and cool, with a high of 55 degrees. Rain will start in the afternoon, so bring an umbrella.',
    questions: [
      { q: 'What will start in the afternoon?', options: ['Rain', 'Snow', 'Sunshine', 'Wind'], hint: 'It is why you need an umbrella.' },
      { q: 'What is the high temperature?', options: ['55 degrees', '75 degrees', '35 degrees', '90 degrees'], hint: 'It is cool today, not hot or freezing.' },
      { q: 'What should you bring?', options: ['An umbrella', 'Sunglasses', 'A coat and boots', 'A fan'], hint: 'Something that keeps you dry.' },
    ],
  },
  {
    id: 'library',
    level: 1,
    kind: 'Notice',
    emoji: '📚',
    title: 'Library notice',
    text: 'The library will be closed on Monday for a holiday. It will open again on Tuesday at 9 in the morning.',
    questions: [
      { q: 'What day is the library closed?', options: ['Monday', 'Friday', 'Sunday', 'Wednesday'], hint: 'It is closed for a holiday.' },
      { q: 'When does it open again?', options: ['Tuesday at 9', 'Monday at noon', 'Wednesday at 10', 'Saturday at 8'], hint: 'The day after it is closed.' },
    ],
  },
  // Level 2: four or five sentences
  {
    id: 'doctor',
    level: 2,
    kind: 'Appointment reminder',
    emoji: '🩺',
    title: 'Doctor’s appointment',
    text: 'This is a reminder from Dr. Patel’s office. You have an appointment on Thursday, March 12, at 10:30 in the morning. Please arrive 15 minutes early and bring your insurance card and a list of your medicines. Call 555-0142 if you need to change the time.',
    questions: [
      { q: 'Which doctor’s office called?', options: ['Dr. Patel', 'Dr. Lopez', 'Dr. Green', 'Dr. Kim'], hint: 'It was the first sentence.' },
      { q: 'What day is the appointment?', options: ['Thursday', 'Monday', 'Saturday', 'Tuesday'], hint: 'It is later in the week.' },
      { q: 'How early should you arrive?', options: ['15 minutes', '5 minutes', 'An hour', '30 minutes'], hint: 'A quarter of an hour.' },
      { q: 'What should you bring?', options: ['Insurance card and medicine list', 'A photo ID only', 'Lunch and water', 'Your glasses and a book'], hint: 'Two things: a card and a list.' },
    ],
  },
  {
    id: 'recipe',
    level: 2,
    kind: 'Recipe',
    emoji: '🥞',
    title: 'Easy pancakes',
    text: 'To make pancakes, mix one cup of flour, one egg, and one cup of milk in a bowl. Heat a pan with a little butter. Pour in a small amount of batter. When you see bubbles on top, flip the pancake and cook one more minute.',
    questions: [
      { q: 'How many eggs do you use?', options: ['One', 'Two', 'Three', 'None'], hint: 'The same number as the cups of flour.' },
      { q: 'What do you heat the pan with?', options: ['Butter', 'Water', 'Syrup', 'Sugar'], hint: 'Just a little of it.' },
      { q: 'When do you flip the pancake?', options: ['When you see bubbles', 'After ten minutes', 'When it smokes', 'Right away'], hint: 'Watch the top of the pancake.' },
    ],
  },
  {
    id: 'bus',
    level: 2,
    kind: 'Notice',
    emoji: '🚌',
    title: 'Bus route change',
    text: 'Starting next Monday, the Number 7 bus will no longer stop at Oak Street because of road work. Riders should use the stop on Elm Street, one block north. The road work will last about three weeks. Buses will still run every 20 minutes.',
    questions: [
      { q: 'Which bus is changing?', options: ['Number 7', 'Number 12', 'Number 3', 'Number 70'], hint: 'It is a single-digit number.' },
      { q: 'Which stop should riders use?', options: ['Elm Street', 'Oak Street', 'Main Street', 'Pine Street'], hint: 'Not Oak. Another tree name.' },
      { q: 'Why is the stop closed?', options: ['Road work', 'A parade', 'Flooding', 'A broken bus'], hint: 'Something is being fixed.' },
      { q: 'How often do buses run?', options: ['Every 20 minutes', 'Every hour', 'Every 5 minutes', 'Twice a day'], hint: 'That did not change.' },
    ],
  },
  {
    id: 'work',
    level: 2,
    kind: 'Voicemail',
    emoji: '📞',
    title: 'Message from your manager',
    text: 'Hey, it’s Dana from the grocery store. Can you work Saturday instead of Friday this week? Your shift would be 8 to 2. Please text me back by tomorrow night to let me know.',
    questions: [
      { q: 'Who called?', options: ['Dana, the manager', 'Sam, a coworker', 'The bank', 'A neighbor'], hint: 'The person from the grocery store.' },
      { q: 'What day do they want you to work instead?', options: ['Saturday', 'Friday', 'Sunday', 'Monday'], hint: 'Not Friday.' },
      { q: 'What are the shift hours?', options: ['8 to 2', '9 to 5', '2 to 8', '6 to noon'], hint: 'It starts in the morning.' },
      { q: 'How should you answer?', options: ['Text back by tomorrow night', 'Call back right away', 'Come in to talk', 'Send an email next week'], hint: 'She asked you to send a message.' },
    ],
  },
  {
    id: 'neighbor',
    level: 2,
    kind: 'Note',
    emoji: '📝',
    title: 'Note from a neighbor',
    text: 'Hi, I’m Rosa from apartment 4B. I’ll be away visiting my son until Sunday. Could you please water my plants on Wednesday? The key is under the blue flowerpot. Thank you so much!',
    questions: [
      { q: 'Which apartment does Rosa live in?', options: ['4B', '2A', '4D', '10B'], hint: 'A number and a letter.' },
      { q: 'Who is she visiting?', options: ['Her son', 'Her sister', 'A friend', 'Her doctor'], hint: 'A family member.' },
      { q: 'What does she want you to do?', options: ['Water her plants', 'Feed her cat', 'Get her mail', 'Take out the trash'], hint: 'Something that needs water.' },
      { q: 'Where is the key?', options: ['Under the blue flowerpot', 'Under the doormat', 'With the manager', 'In the mailbox'], hint: 'Near the plants.' },
    ],
  },
  // Level 3: longer, more details
  {
    id: 'news',
    level: 3,
    kind: 'Local news',
    emoji: '📰',
    title: 'New park opens',
    text: 'The town of Riverton opened a new park on Saturday. The park has a walking path, a dog area, and a garden with 40 raised beds that people can rent for $15 a season. About 300 people came to the opening. The mayor said the park took two years to build and was paid for by a state grant. Free yoga classes will be held there every Sunday morning in the summer.',
    questions: [
      { q: 'What is the name of the town?', options: ['Riverton', 'Lakeside', 'Oakville', 'Hillsboro'], hint: 'It has a body of water in its name.' },
      { q: 'How much does a garden bed cost?', options: ['$15 a season', '$40 a season', '$15 a month', 'It is free'], hint: 'Less than $20.' },
      { q: 'About how many people came?', options: ['300', '40', '3,000', '15'], hint: 'A few hundred.' },
      { q: 'How was the park paid for?', options: ['A state grant', 'Higher taxes', 'Donations from a church', 'Ticket sales'], hint: 'Money from the state.' },
      { q: 'What happens on Sunday mornings?', options: ['Free yoga classes', 'A farmers market', 'Dog training', 'Concerts'], hint: 'An exercise class.' },
    ],
  },
  {
    id: 'discharge',
    level: 3,
    kind: 'Instructions',
    emoji: '🏥',
    title: 'Going-home instructions',
    text: 'You may go home on Friday. Your daughter will pick you up at 11 in the morning. Take your new blood pressure pill once a day with breakfast. Do not drive for two weeks. A home health nurse will visit on Monday afternoon to check on you. If you feel dizzy or have chest pain, call 911.',
    questions: [
      { q: 'What day do you go home?', options: ['Friday', 'Monday', 'Sunday', 'Wednesday'], hint: 'The end of the work week.' },
      { q: 'Who is picking you up?', options: ['Your daughter', 'Your son', 'A taxi', 'A neighbor'], hint: 'A family member.' },
      { q: 'When do you take the new pill?', options: ['Once a day with breakfast', 'Twice a day', 'At bedtime', 'Only when you feel bad'], hint: 'With a meal in the morning.' },
      { q: 'How long should you not drive?', options: ['Two weeks', 'Two days', 'Two months', 'One week'], hint: 'More than a week, less than a month.' },
      { q: 'When will the nurse visit?', options: ['Monday afternoon', 'Friday night', 'Tuesday morning', 'Next month'], hint: 'Early next week.' },
    ],
  },
  {
    id: 'trip',
    level: 3,
    kind: 'Email',
    emoji: '✉️',
    title: 'Family trip plans',
    text: 'Hi everyone! The family reunion is on July 18 at Grandma’s house in Springfield. Lunch is at 1 o’clock. Uncle Joe is grilling burgers and hot dogs, so please bring a side dish or a dessert. There will be a lake nearby, so bring a swimsuit if you want to swim. Parking is limited, so try to carpool. Please tell Maria by July 1 if you can come.',
    questions: [
      { q: 'Where is the reunion?', options: ['Grandma’s house', 'A park', 'Uncle Joe’s house', 'A restaurant'], hint: 'Whose house is it at?' },
      { q: 'What time is lunch?', options: ['1 o’clock', 'Noon', '3 o’clock', '11 o’clock'], hint: 'Just after noon.' },
      { q: 'What should you bring?', options: ['A side dish or dessert', 'Burgers', 'Chairs', 'Nothing'], hint: 'Uncle Joe has the main food covered.' },
      { q: 'Why should people carpool?', options: ['Parking is limited', 'Gas is expensive', 'The road is closed', 'It is far away'], hint: 'There is not much room for cars.' },
      { q: 'Who should you tell if you can come?', options: ['Maria', 'Uncle Joe', 'Grandma', 'Nobody'], hint: 'The last sentence.' },
    ],
  },
];
