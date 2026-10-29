// "Real or scam?" messages. Realistic for a teen with a phone, using the parody names.
export type ScamFormat = 'text' | 'email' | 'popup' | 'dm';

export interface ScamCase {
  id: string;
  format: ScamFormat;
  from: string;
  subject?: string;
  body: string;
  /** What the button or link says */
  action?: string;
  scam: boolean;
  /** Red flags (for scams) or why it's OK (for real ones) */
  reasons: string[];
}

export const RED_FLAGS = [
  'Asks for a password, PIN, card number or code',
  'Too good to be true (free prizes, huge discounts)',
  'Rushes you or scares you ("act now", "account locked")',
  'Wants you to pay with gift cards',
  'Weird links, spelling or senders',
  "About something you didn't order or sign up for",
];

export const SCAM_CASES: ScamCase[] = [
  {
    id: 'package-fee', format: 'text', from: '+1 (838) 555-0192',
    body: 'Amazoom: Your package could not be delivered. Pay the $1.99 redelivery fee within 24 hrs: amazoom-redeliver.co/pay',
    action: 'amazoom-redeliver.co/pay', scam: true,
    reasons: ['Real stores never text you to pay a delivery fee', 'Rushes you ("within 24 hrs")', 'The link is not amazoom.com'],
  },
  {
    id: 'order-shipped', format: 'email', from: 'orders@leggo.com', subject: 'Your LEGGO order has shipped!',
    body: 'Good news! Your LEGGO Star Warz X-Wingz Fighter is on its way. It should arrive Thursday. You can track it in your LEGGO account.',
    scam: false,
    reasons: ["It's about something you really ordered", "It doesn't ask for money or passwords", 'It tells you to check your account yourself'],
  },
  {
    id: 'bank-pin', format: 'text', from: 'Chaise Alert',
    body: 'CHAISE BANK: Your account is LOCKED due to suspicious activity. Reply with your card number and PIN to unlock it.',
    scam: true,
    reasons: ['Banks never ask for your PIN, ever', 'Tries to scare you ("LOCKED")', 'Asks for your card number'],
  },
  {
    id: 'free-phone', format: 'popup', from: 'Pop-up on a website',
    body: '🎉 CONGRATULATIONS! You are visitor #1,000,000! You WON a FREE PhoneMax 16 Pro! Just pay $4.99 shipping.',
    action: 'CLAIM MY PRIZE', scam: true,
    reasons: ["Too good to be true: you didn't enter any contest", 'Asks for money to get a "free" prize', 'Pop-ups like this are always fake'],
  },
  {
    id: 'vbucks', format: 'dm', from: 'FreeBucksKing_2026',
    body: 'yo want 10,000 free V-Bux?? just log in with ur game account here and they go straight to ur account 🔥🔥',
    action: 'freevbux-generator.net', scam: true,
    reasons: ['Free game money generators are always scams', 'Asks you to log in on a strange website (they steal your account)', 'From a stranger'],
  },
  {
    id: 'starducks-reward', format: 'email', from: 'rewards@starducks.com', subject: 'You earned a free drink ☕',
    body: "You've collected 150 Stars! Your free drink reward is waiting in the Starducks app. No code needed. Just order in the app.",
    scam: false,
    reasons: ["It doesn't ask for any information", 'It sends you to the real app, not a link', 'Rewards for buying coffee are normal'],
  },
  {
    id: 'gift-card-job', format: 'text', from: '+1 (414) 555-0137',
    body: "Hi, this is your manager. I'm in a meeting. Can you buy 4 $100 Fal-Mart gift cards and text me the codes? I'll pay you back today.",
    scam: true,
    reasons: ['Asks you to buy gift cards and send the codes', 'From a number you don\'t know', 'Rushes you and says "pay you back"'],
  },
  {
    id: 'falmart-receipt', format: 'email', from: 'help@falmart.com', subject: 'Your Fal-Mart pickup order is ready',
    body: 'Your order #48210 (Krest toothpaste, eggs, paper towels) is ready for pickup at your store. Bring your ID. Total paid: $17.78.',
    scam: false,
    reasons: ['It matches an order you really made', "It doesn't ask you to click or pay anything", 'The email address is the real store'],
  },
  {
    id: 'airpads-cheap', format: 'popup', from: 'Ad on a website',
    body: '🔥 TODAY ONLY 🔥 AirPads Pro — $9.99 (was $249)! Only 3 left! Enter your card to reserve.',
    action: 'BUY NOW', scam: true,
    reasons: ['Way too cheap to be real', 'Rushes you ("only 3 left")', 'Unknown website asking for your card'],
  },
  {
    id: 'grandma-birthday', format: 'text', from: 'Grandma 💕',
    body: 'Happy birthday sweetheart! I put $25 in a card in the mail. Love you! 🎂',
    scam: false,
    reasons: ['From someone you know, using their usual number', "Doesn't ask you for anything", "Nothing to click"],
  },
  {
    id: 'deer-tag', format: 'email', from: 'dnr-licensing@state-hunting-permits.biz', subject: 'URGENT: Your deer license will be CANCELLED',
    body: 'Your hunting license has an error and will be cancelled in 2 hours. Re-enter your Social Security number and card number here to keep it.',
    action: 'Fix my license', scam: true,
    reasons: ['Scary and urgent ("CANCELLED", "2 hours")', 'Asks for your Social Security number and card number', 'The email is not from the real state website (.gov)'],
  },
  {
    id: 'seller-giftcard', format: 'dm', from: 'Marketplace seller',
    body: "Yes the LEGGO Millennium Fallcon is still for sale, $40! But I only take payment in Amazoom gift cards. Send me the codes and I'll ship it.",
    scam: true,
    reasons: ["A $170 set for $40 is too good to be true", 'Wants payment in gift cards', "You can't get your money back"],
  },
  {
    id: 'bank-real', format: 'text', from: 'Chaise Bank (12345)',
    body: 'Chaise Bank: A purchase of $8.47 at McDoogles was made with your debit card ending 4821. If this was you, no action is needed.',
    scam: false,
    reasons: ['It matches something you just bought', 'It does not ask for your PIN or card number', '"No action needed": it doesn\'t rush you'],
  },
  {
    id: 'cart-expire', format: 'popup', from: 'Pop-up while shopping',
    body: '⚠️ Your cart will be DELETED in 60 seconds! Enter your card number now to save your cart and get 90% off!',
    action: 'Save my cart', scam: true,
    reasons: ['Real carts don\'t get deleted in 60 seconds', '90% off is too good to be true', 'Asks for your card number in a pop-up'],
  },
];
