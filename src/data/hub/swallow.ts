// Swallowing exercises and safe-swallow strategies. These are reminders for patients who
// were taught them by their speech-language pathologist. Original wording.

export interface Exercise {
  id: string;
  name: string;
  /** Common name clinicians use. */
  aka?: string;
  steps: string[];
  /** Defaults the clinician can change. holdSec 0 = no hold timer. */
  reps: number;
  holdSec: number;
  sets: number;
  note?: string;
}

export const EXERCISES: Exercise[] = [
  {
    id: 'effortful',
    name: 'Hard swallow',
    aka: 'Effortful swallow',
    steps: ['Sit up straight.', 'Swallow your saliva.', 'Squeeze all your throat and neck muscles as hard as you can while you swallow.'],
    reps: 10,
    holdSec: 0,
    sets: 3,
  },
  {
    id: 'masako',
    name: 'Tongue hold',
    aka: 'Masako',
    steps: ['Stick the tip of your tongue out a little.', 'Gently hold it between your front teeth.', 'Keep it there and swallow your saliva.', 'Then relax your tongue.'],
    reps: 10,
    holdSec: 0,
    sets: 3,
    note: 'Do not do this with food or drink in your mouth.',
  },
  {
    id: 'shaker',
    name: 'Head lift',
    aka: 'Shaker',
    steps: ['Lie flat on your back.', 'Keep your shoulders on the bed or floor.', 'Lift only your head and look at your toes.', 'Hold, then rest your head back down.'],
    reps: 3,
    holdSec: 60,
    sets: 1,
    note: 'Your therapist may also give you quick head lifts with no hold. Stop if your neck hurts.',
  },
  {
    id: 'mendelsohn',
    name: 'Hold the swallow up',
    aka: 'Mendelsohn',
    steps: ['Put your fingers lightly on your Adam’s apple.', 'Swallow your saliva.', 'When you feel it rise, squeeze and hold it up.', 'Hold, then let go and relax.'],
    reps: 10,
    holdSec: 3,
    sets: 1,
  },
  {
    id: 'ctar',
    name: 'Chin tuck with a ball',
    aka: 'Chin tuck against resistance (CTAR)',
    steps: ['Sit up straight with a soft ball under your chin.', 'Tuck your chin down and squeeze the ball.', 'Hold the squeeze.', 'Then relax.'],
    reps: 10,
    holdSec: 3,
    sets: 3,
  },
  {
    id: 'supraglottic',
    name: 'Breath-hold swallow',
    aka: 'Supraglottic swallow',
    steps: ['Take a breath in and hold it.', 'Keep holding your breath and swallow.', 'Cough right after you swallow.', 'Swallow again, then breathe.'],
    reps: 10,
    holdSec: 0,
    sets: 1,
    note: 'Use this with food or drink only if your therapist told you to.',
  },
  {
    id: 'tonguePress',
    name: 'Tongue press',
    aka: 'Tongue strengthening',
    steps: ['Press your whole tongue up against the roof of your mouth.', 'Push as hard as you can.', 'Hold, then relax.'],
    reps: 10,
    holdSec: 3,
    sets: 3,
  },
  {
    id: 'jaw',
    name: 'Jaw opening',
    aka: 'Jaw opening exercise',
    steps: ['Sit up straight.', 'Open your mouth as wide as you comfortably can.', 'Hold it open.', 'Then close slowly and relax.'],
    reps: 5,
    holdSec: 10,
    sets: 1,
  },
];

export const exerciseById = (id: string) => EXERCISES.find((e) => e.id === id);

export interface Strategy {
  id: string;
  /** Short line for the bedside card. */
  short: string;
  emoji: string;
  /** Question for recall practice. */
  ask: string;
  /** Wrong but tempting answers for recall practice. */
  foils: string[];
}

export const STRATEGIES: Strategy[] = [
  { id: 'upright', short: 'Sit all the way up (90°) to eat and drink', emoji: '🪑', ask: 'How should you sit when you eat or drink?', foils: ['Lie back in bed', 'Lean way back in a recliner', 'Lie on your side'] },
  { id: 'small', short: 'Take small bites and small sips', emoji: '🥄', ask: 'How big should your bites and sips be?', foils: ['Big bites so you finish fast', 'Big gulps', 'As much as fits in your mouth'] },
  { id: 'slow', short: 'Eat slowly. Swallow before the next bite.', emoji: '🐢', ask: 'When should you take the next bite?', foils: ['Right away, while still chewing', 'Before you swallow', 'Take two bites at once'] },
  { id: 'chinTuck', short: 'Tuck your chin down when you swallow', emoji: '⬇️', ask: 'What do you do with your chin when you swallow?', foils: ['Tip your head back', 'Turn your head to look up', 'Nothing special'] },
  { id: 'double', short: 'Swallow twice for each bite or sip', emoji: '✌️', ask: 'How many times do you swallow for each bite?', foils: ['Once, then take the next bite', 'Never more than once', 'Only when it feels stuck'] },
  { id: 'alternate', short: 'Take a sip of drink between bites of food', emoji: '🔁', ask: 'What do you do between bites of food?', foils: ['Take another bite right away', 'Talk with food in your mouth', 'Wait until the end to drink'] },
  { id: 'noStraw', short: 'No straws. Sip from a cup.', emoji: '🚫', ask: 'How should you drink?', foils: ['Through a straw', 'Gulp it fast', 'Tip your head back to pour it in'] },
  { id: 'noTalk', short: 'Don’t talk with food in your mouth', emoji: '🤐', ask: 'What should you not do while you chew?', foils: ['Chew with your mouth closed', 'Sit up straight', 'Take small bites'] },
  { id: 'clear', short: 'If your voice sounds wet, clear your throat and swallow again', emoji: '💧', ask: 'Your voice sounds wet or gurgly while you eat. What do you do?', foils: ['Keep eating', 'Take a big drink to wash it down', 'Lie down'] },
  { id: 'stayUp', short: 'Stay sitting up for 30 minutes after eating', emoji: '⏰', ask: 'What do you do right after a meal?', foils: ['Lie down for a nap', 'Lie flat in bed', 'Bend over to tie your shoes'] },
  { id: 'oral', short: 'Brush teeth or dentures and clean your mouth after meals', emoji: '🪥', ask: 'What do you do to keep your mouth clean after you eat?', foils: ['Nothing until tomorrow', 'Only rinse with soda', 'Leave food in your cheeks'] },
  { id: 'meds', short: 'Take pills the way your therapist showed you', emoji: '💊', ask: 'How do you take your pills?', foils: ['All at once with a big gulp', 'Dry, with no water', 'Chew every pill, even if told not to'] },
  { id: 'check', short: 'Check your cheeks for leftover food', emoji: '🔎', ask: 'What do you check for after you swallow?', foils: ['Nothing, just keep going', 'Your phone', 'The time'] },
  { id: 'alert', short: 'Only eat when you are wide awake', emoji: '👀', ask: 'When is it safe to eat?', foils: ['When you are very sleepy', 'While lying down', 'While falling asleep'] },
];

export const strategyById = (id: string) => STRATEGIES.find((s) => s.id === id);

/** General safety questions that apply to everyone, used alongside the patient's own strategies. */
export const SWALLOW_SCENARIOS = [
  {
    q: 'You start coughing hard and can’t stop during a meal. What should you do?',
    options: ['Stop eating and get help from a nurse or caregiver', 'Keep eating faster', 'Drink a big glass of water quickly', 'Lie down'],
    why: 'Stop and get help. Tell your therapist about it too.',
  },
  {
    q: 'Someone offers you a food that is not on your diet. What should you do?',
    options: ['Say no thank you, and stick to your diet', 'Eat it, just this once', 'Take a big bite to try it', 'Hide it in your cheek'],
    why: 'Your diet was chosen to keep you safe.',
  },
  {
    q: 'You feel like food is stuck in your throat. What should you do?',
    options: ['Stop eating, try to cough and swallow, and tell someone', 'Take a bigger bite to push it down', 'Ignore it and keep eating', 'Lie down flat'],
    why: 'Stop and let someone know. If you can’t breathe or speak, get emergency help.',
  },
  {
    q: 'You are very sleepy, and your lunch tray just arrived. What should you do?',
    options: ['Wait until you are awake and sitting up', 'Eat quickly before you fall asleep', 'Eat lying down', 'Have someone pour drinks into your mouth'],
    why: 'Eating when sleepy makes it easier for food to go down the wrong way.',
  },
];
