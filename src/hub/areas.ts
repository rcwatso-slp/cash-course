// The hub's areas and their tasks. Data only (no components), so the log and the
// clinician panel can use the names without pulling in every task.
import type { AreaId } from './types';

export const HUB_NAME = 'Therapy Hub';

export interface AreaDef {
  id: AreaId;
  emoji: string;
  title: string;
  /** What it targets, in clinician terms. */
  targets: string;
  desc: string;
  color: string;
}

export interface TaskDef {
  /** Also the route: #/<id> */
  id: string;
  area: AreaId;
  emoji: string;
  title: string;
  desc: string;
}

export const AREAS: AreaDef[] = [
  { id: 'memory', emoji: '🧠', title: 'Memory', targets: 'Memory', desc: 'Remember words, stories, numbers and important facts.', color: '#5b4b8a' },
  { id: 'language', emoji: '💬', title: 'Language', targets: 'Aphasia', desc: 'Name things, understand words and follow directions.', color: '#1f5f8b' },
  { id: 'speech', emoji: '🗣️', title: 'Speech', targets: 'Dysarthria', desc: 'Speak louder, slower and more clearly.', color: '#8a4b2a' },
  { id: 'swallow', emoji: '🥄', title: 'Swallowing', targets: 'Dysphagia', desc: 'Your exercises and your safe-swallow plan.', color: '#2a6f6f' },
  { id: 'reasoning', emoji: '🧩', title: 'Reasoning', targets: 'Reasoning and problem solving', desc: 'Figure out what fits, what is wrong and what to do.', color: '#6b6b1f' },
  { id: 'executive', emoji: '📋', title: 'Thinking & Planning', targets: 'Executive function and attention', desc: 'Put steps in order, plan the week, sort pills, stay focused.', color: '#7a2f55' },
  { id: 'money', emoji: '💵', title: 'Money & Community', targets: 'Functional math (Cash Course)', desc: 'Order food, shop online, pay and make change.', color: '#1f6f5c' },
];

export const TASKS: TaskDef[] = [
  // Memory
  { id: 'spaced-retrieval', area: 'memory', emoji: '⏱️', title: 'Spaced Retrieval', desc: 'Practice one important fact at longer and longer times apart.' },
  { id: 'word-list', area: 'memory', emoji: '📝', title: 'Word List', desc: 'Look at a list of words, wait a bit, then say them back.' },
  { id: 'story-recall', area: 'memory', emoji: '📰', title: 'Story Recall', desc: 'Read or listen to a message, then answer questions about it.' },
  { id: 'number-recall', area: 'memory', emoji: '🔢', title: 'Remember the Number', desc: 'Phone numbers, room numbers and times. Forward or backward.' },
  { id: 'matching-pairs', area: 'memory', emoji: '🃏', title: 'Matching Pairs', desc: 'Turn over cards and find the pairs.' },
  // Language
  { id: 'name-it', area: 'language', emoji: '🖼️', title: 'Name It', desc: 'Say the name of the picture.' },
  { id: 'point-to-it', area: 'language', emoji: '👆', title: 'Point to It', desc: 'Hear or read a word, then tap the picture.' },
  { id: 'follow-directions', area: 'language', emoji: '🧭', title: 'Follow Directions', desc: 'Tap the pictures in the right order.' },
  { id: 'yes-or-no', area: 'language', emoji: '✅', title: 'Yes or No', desc: 'Answer questions with yes or no.' },
  { id: 'finish-sentence', area: 'language', emoji: '✏️', title: 'Finish the Sentence', desc: 'Say the missing word.' },
  { id: 'category-naming', area: 'language', emoji: '🗂️', title: 'Name Things in a Category', desc: 'Name as many as you can in one minute.' },
  // Speech
  { id: 'loud-clear', area: 'speech', emoji: '📢', title: 'Loud & Clear', desc: 'Use a strong voice. Watch the meter.' },
  { id: 'say-it-clearly', area: 'speech', emoji: '🎙️', title: 'Say It Clearly', desc: 'Words, phrases and sentences. Record and listen back.' },
  { id: 'pacing-board', area: 'speech', emoji: '🚦', title: 'Pacing Board', desc: 'One word at a time. Plus pa-ta-ka warm-ups.' },
  // Swallowing
  { id: 'swallow-exercises', area: 'swallow', emoji: '💪', title: 'My Exercises', desc: 'Your swallowing exercises, with a timer and counter.' },
  { id: 'swallow-plan', area: 'swallow', emoji: '🍽️', title: 'My Swallow Plan', desc: 'Your safe-swallow strategies. Print a bedside card.' },
  { id: 'swallow-strategies', area: 'swallow', emoji: '🧠', title: 'Remember My Strategies', desc: 'Practice what to do at every meal.' },
  // Reasoning
  { id: 'odd-one-out', area: 'reasoning', emoji: '🔍', title: 'Odd One Out', desc: 'Which one does not belong?' },
  { id: 'analogies', area: 'reasoning', emoji: '🔗', title: 'Analogies', desc: 'Hot is to cold as up is to …' },
  { id: 'safety', area: 'reasoning', emoji: '🛟', title: 'Safety & Problem Solving', desc: 'What is the best thing to do?' },
  { id: 'inference', area: 'reasoning', emoji: '🕵️', title: 'Read Between the Lines', desc: 'Figure out what is really going on.' },
  { id: 'whats-wrong', area: 'reasoning', emoji: '🤨', title: "What's Wrong Here?", desc: 'Find what does not make sense.' },
  // Thinking & Planning
  { id: 'put-in-order', area: 'executive', emoji: '🔢', title: 'Put It in Order', desc: 'Put the steps of an everyday task in order.' },
  { id: 'pill-organizer', area: 'executive', emoji: '💊', title: 'Pill Organizer', desc: 'Read the labels and fill the weekly pill box.' },
  { id: 'calendar', area: 'executive', emoji: '📅', title: 'Read the Calendar', desc: 'Answer questions about a week of plans.' },
  { id: 'find-them-all', area: 'executive', emoji: '🎯', title: 'Find Them All', desc: 'Find every target on the page.' },
  { id: 'switch-it-up', area: 'executive', emoji: '🔀', title: 'Switch It Up', desc: 'Tap in order: 1, 2, 3 … or 1, A, 2, B …' },
];

export const areaById = (id: string): AreaDef | undefined => AREAS.find((a) => a.id === id);
export const taskById = (id: string): TaskDef | undefined => TASKS.find((t) => t.id === id);
export const tasksIn = (area: AreaId): TaskDef[] => TASKS.filter((t) => t.area === area);
