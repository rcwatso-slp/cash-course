# Money Skills Practice Site — Plan

A front-end-only website hosted on GitHub Pages, used during therapy sessions to practice functional money skills: ordering food, online shopping, totaling costs, paying, and budgeting.

**Client profile (for design decisions only. No identifying info goes in the app):** 17 years old, Level 2 autism, working on functional money use.

### Decisions so far
| Topic | Decision |
|---|---|
| Sales tax default | **7.25%** (can still be changed in the clinician panel) |
| Devices | **Laptop in session** (main design target). **Phone layout** too, since he has a phone and that's where he'll really shop and order. |
| Current skills | Addition is fairly strong. **Subtraction and making change are the main targets.** |
| Interests | **Lego, Star Wars, deer hunting.** Hunting gear is included, but **no weapons or ammo** anywhere on the site. |
| Branding | **Funny parody names** (McDoogles, Fal-Mart). See §8. |

---

## 1. Design principles

These apply to every screen.

| Principle | What it means in the app |
|---|---|
| **Age-respectful** | Looks like real apps a teen uses. No cartoons, baby colors, or "Great job, buddy!" Feedback is matter-of-fact: "Correct. $12.47." |
| **Predictable** | Same layout every time: the task goes at the top, the work area in the middle, help buttons in the same spot. No surprise pop-ups. |
| **Low sensory load** | Calm palette, no flashing, no sounds by default, motion off by default. One task on screen at a time. |
| **Real-world transfer** | Menus and stores look and work like the real ones (layout, flow, buttons, fees) so the skill carries over to an actual Chipotle line or the Walmart app. |
| **Clinician in control** | All settings sit behind a clinician lock. The client sees only the task. |
| **Independence first** | Help is never shown automatically unless the clinician turns that on. He has to ask for it, and every request is recorded. |
| **Privacy by design** | No accounts, no server, no client names. Data stays on the device and can be exported by the clinician. |

---

## 2. Core modules (what you asked for)

### 2.1 Restaurant ordering
- **Restaurants** (parody names, full list in §8): McDoogles, Taco Smell, Chipoodle, Domin-Oops Pizza, Starducks, Subwhey, Windy's, and the sit-down Grapplebee's.
- **Ordering formats** that match real life:
  - **Kiosk / app** with picture tiles, categories, and an "Add to order" button
  - **Menu board**: a dense wall menu he has to scan and read (harder, and closer to a real counter)
  - **Build-your-own** (burrito or sub), where add-ons cost extra ("Guac +$2.45")
  - **Combos vs. à la carte**, which teaches that a meal can cost less than buying the items separately
  - **Sizes** (S/M/L at different prices)
- **The task:** he orders, then **calculates the total himself** before the app shows it. The running total stays hidden unless the clinician turns it on.
- **Sit-down mode (optional):** adds a tip step (15/18/20% buttons, or "calculate 20% yourself").
- **Delivery mode (optional, DoorDosh):** adds a delivery fee, a service fee, and a tip. This shows him why delivery costs so much more.

### 2.2 Online shopping
- **Amazoom** (Amazon-style): search bar, product grid, star ratings, product page, quantity selector, cart, checkout, "Zoom Prime" free shipping.
- **Fal-Mart** (Walmart-style): categories (grocery, household, electronics, toys), "Fallback" sale prices, pickup vs. delivery.
- **Bass Bro Shops** (outdoor store, built around his hunting interest): camo, blaze orange, boots, trail cameras, deer corn, hand warmers. **No weapons or ammo.**
- **The LEGGO Store** (brick sets, including "Star Warz" sets).
- **Realistic checkout flow:** cart → shipping options (free 5-day vs. $5.99 next-day) → review order → "Place order." He learns each step in order.
- **Tasks:** "Buy toothpaste and a phone charger," "Find the cheapest headphones," "Add 3 boxes of cereal."

### 2.3 Three help levels (least-to-most prompting)
One **Help** button. Each press moves up one level. The level he reached is saved with every problem.

| Level | Name | Example (burger $5.49 + fries $2.79 + drink $1.89) |
|---|---|---|
| 1 | **Hint** | "Add up the prices of everything in your cart. Start with the burger and the fries." |
| 2 | **More help** | Shows the problem set up for him: the prices lined up in a column with the decimal points aligned (`5.49 + 2.79 + 1.89`). He fills in the answer. Optional money pictures (bills and coins) for each price. |
| 3 | **Answer** | Shows the answer and how it was worked out: "$5.49 + $2.79 = $8.28. $8.28 + $1.89 = **$10.17**." He then types the answer in himself to finish the problem. |

- Hints are written **for each problem type** (total, tax, change, budget, compare), not one generic hint.
- **Clinician settings:** which levels are available, whether a wrong answer brings up Level 1 automatically, and a wait time before Help can be pressed (so he tries first).
- An optional **errorless mode** starts at Level 2 or 3 and fades back across sessions.

### 2.4 Tax toggle
- On/off switch in the clinician panel.
- The rate can be changed. It defaults to **7.25%**, with a custom rate also available.
- **Difficulty options when tax is on:**
  - **App calculates tax** (he just reads the receipt line)
  - **He calculates tax** (its own step with its own help levels)
  - **Estimate mode:** "About how much will tax add? Round to the nearest dollar."
- Optional teaching point: **"The price on the menu isn't the price you pay."**

---

## 3. Recommended additions

Ranked roughly by how much they help with functional money use.

### 3.1 Wallet, paying and making change (top priority, part of Phase 1)
Subtraction and change are his main targets, so this module moves up to the MVP.
- A **virtual wallet** with bills and coins he clicks to pay (drags or taps on a phone). The clinician sets what's in it ("You have one $20, two $5s, and three $1s").
- **Next-dollar-up strategy:** a common, evidence-supported method for people who struggle with exact change. For $7.39 he pays $8. This can be its own mode, with its own hints.
- **Making change:** "You paid $20. How much change should you get back?"
- **"Did they give me the right change?":** the cashier hands back change, which is sometimes wrong, and he checks it. This is the most common real-world use of the skill.
- **Card vs. cash:** paying with a card skips the change step but still needs a balance check (see 3.3).

**Help levels for change (written for this skill):**

| Level | Example (total $7.39, he paid $20) |
|---|---|
| 1 Hint | "Change is what you paid minus the total. Try counting up from $7.39 to $20." |
| 2 More help | A **count-up number line**: $7.39 → **$8.00** (+61¢) → **$10** (+$2) → **$20** (+$10). He adds up the jumps. Showing the subtraction in a column, with regrouping marked, is an option the clinician can turn on. |
| 3 Answer | "$20.00 − $7.39 = **$12.61**," with the count-up path shown as bills and coins: a $10, two $1s, two quarters, a dime and a penny. |

Counting up is the default because it's how cashiers make change. It avoids borrowing across zeros ($20.00 − $7.39), which is often where subtraction breaks down.

**Change difficulty ladder:**

| Level | Example |
|---|---|
| C1 | Whole-dollar price, pay with the next bill up: $7 paid with $10 |
| C2 | Whole-dollar price, pay with $20: $13 paid with $20 |
| C3 | Next-dollar-up, cents only: $7.39 paid with $8 |
| C4 | Cents price, pay with $10 or $20: $7.39 paid with $20 |
| C5 | Price with tax, and he picks which bills to pay with |

### 3.2 Budget mode: "Can I afford it?" (high value)
- "You have **$15**. Order a meal and a drink." The running total is hidden. He has to keep track himself, and if he goes over, the app tells him at checkout.
- A quick **yes/no game**: "You have $10. The meal costs $11.29. Can you buy it?" This builds speed with the most common real-world money decision.
- **"What do I put back?"**: He's over budget, so he chooses an item to remove.

### 3.3 Debit card balance (medium-high)
- A simple bank-app balance screen. Each purchase is subtracted. "You have $42.18. After this order, how much is left?"
- This moves into a **weekly budget**: $50 for the week, plan lunches across 5 days.
- The bank app is **Chaise Bank** (the logo is a chair).

### 3.3b Saving-up goal (high value, uses his interests)
- "You want the **LEGGO Star Warz Millennium Fallcon** ($169.99). You have $62.50. **How much more do you need?**" This is a subtraction problem he'll care about.
- Next: "You save $15 a week. How many weeks until you can buy it?" with a progress bar that fills up.
- The hunting version: "Your deer license and tag cost $48. You have $30." Real hunting costs (license, tags, blaze orange, deer corn) give practice with realistic numbers.

### 3.4 Comparison shopping (medium)
- "Which is the better deal?" Compare two sizes or two brands.
- **Sales:** "20% off," "Buy one get one free," "$2 off when you buy 2." Includes the classic trap of a "sale" that costs more per item.
- Unit price is an advanced level and optional.

### 3.5 Reading receipts (medium)
- He's shown a receipt and answers questions: "What was the tax?" "How much did the fries cost?" "Was he charged correctly?" Some receipts have a planted mistake for him to find.

### 3.6 Ordering script practice (medium, bridges to community outings)
- After building an order, an optional **"Say your order"** screen gives a script: "Hi, can I get a #2 with a medium Coke?" A read-aloud button lets him hear it first.
- Prepares him for ordering at a counter, not just at a kiosk. Good practice before a community outing.

### 3.7 Online safety (medium, age-relevant at 17)
- In the store, there are occasional **fake "deal" pop-ups** or sellers that look like scams ("iPhone $19.99!!! Enter card now"). He practices spotting them and closing them.
- **"Is this a real checkout?"** recognition practice.
- No real personal info is ever typed in. Checkout forms are already filled with an obviously fake address.

### 3.8 Built-in calculator toggle
- Functional money use as an adult usually means **a phone calculator**, so independent calculator use is a legitimate goal.
- The clinician picks one: **No calculator**, **Calculator allowed**, or **Calculator required**. The calculator looks like a phone calculator so the skill transfers.

### 3.9 Difficulty ladder
The clinician picks a level, or the app suggests moving up when he meets a mastery rule.

| Level | Prices | Items | Extras |
|---|---|---|---|
| 1 | Whole dollars ($3, $5) | 2 | none |
| 2 | Half and quarter dollars ($3.50, $2.25) | 2–3 | none |
| 3 | Any cents ($4.79) | 3–4 | none |
| 4 | Any cents | 4–6 | tax |
| 5 | Any cents | 4–6 | tax + tip or fees + budget |

### 3.10 Progress data for the clinician
- Each problem saves: module, difficulty, correct or not, **highest help level used** (0 = independent), attempts, time taken, and date.
- **Session summary screen:** "12 problems, 9 independent (75%), 2 with hint, 1 with answer."
- **Progress chart across sessions:** independence % over time, by module.
- **Mastery rule** (the clinician can change it): for example, 80% independent across 3 sessions in a row.
- **Export to CSV** for notes and progress reports. **Export/import a JSON backup** so the data can move between devices.
- Data is saved under a **nickname or initials**, never a full name.

### 3.11 Motivation (age-appropriate)
- A low-key points or streak counter. Can be turned off.
- **Interest products:** LEGGO sets and Star Warz merchandise at Fal-Mart, Amazoom and the LEGGO Store. Hunting gear at Bass Bro Shops. Word problems use these items too.
- **No weapons anywhere:** no guns, bows, ammo or knives. Toy lightsabers and blasters are also left out by default (see §8).
- An optional **"First / Then" bar** at the top: "First: 5 problems → Then: free choice."

### 3.12 Accessibility
- **Read aloud** button on every task and hint (built-in browser speech, no cost).
- Large-text mode, high-contrast mode, motion off by default.
- **Laptop first:** he types answers on the keyboard and presses Enter to submit, with an on-screen number pad as an option.
- **Phone layout:** the same app on a narrow screen, with big tap targets, an on-screen money keypad, and the cart as a bottom bar like real food-ordering apps. It can be added to his home screen. Practice done on his phone saves its data on his phone, so homework results get exported or checked at the next session.
- Lenient answer checking: `10.17`, `$10.17`, and `10.170` all count as correct. `10.2` is gently flagged ("Money uses 2 numbers after the dot").

### 3.13 Print / homework mode
- Generates a printable worksheet from the same menus ("Order lunch for under $12 and write the total"), to support practice at home and with his family.

---

## 4. Clinician panel

Opened with a hidden gesture (long-press the logo) plus a 4-digit PIN, so the client can't change settings.

- **Client profile:** nickname, difficulty level, mastery rule
- **Money:** tax on/off and rate, tip on/off, delivery fees on/off, calculator mode, show running total
- **Help:** which help levels are on, wait time before help, auto-help after a wrong answer, errorless mode
- **Tasks:** pick modules, number of problems per session, specific restaurant or store
- **Wallet:** starting cash, card balance
- **Display:** read aloud, large text, high contrast, points on/off
- **Data:** session summary, charts, export CSV/JSON, clear data
- **Content editor (phase 4):** edit menu items, prices, and products without touching code

---

## 5. Technical plan

| Decision | Choice | Why |
|---|---|---|
| Framework | **Vite + React + TypeScript** | Many screens and lots of shared state. Fast, and plenty of examples online. |
| Routing | Hash routing (`/#/store`) | GitHub Pages has no server-side routing. |
| Hosting | GitHub Pages, deployed by a **GitHub Actions** workflow on push to `main` | Free, automatic deploys. |
| Data storage | `localStorage` for settings and session data, plus JSON export/import | Front-end only, nothing leaves the device. |
| Offline | **PWA** (installable, works offline) | Clinic Wi-Fi is unreliable. It can be added to the iPad home screen like an app. |
| Money math | **All amounts stored as whole cents** (`549`, not `5.49`) | Prevents decimal rounding errors (e.g. `0.1 + 0.2 = 0.30000000000000004`). |
| Tax rounding | Round half-up on the subtotal, the way most registers do | Matches real receipts. |
| Content | Menus, products, and hints live in `/src/data/*.json` | Prices and items can be edited without touching app code. |
| Images | Simple, consistent food and product illustrations or royalty-free photos (e.g. Unsplash), stored locally | No brand photos (see §7). Fast loading offline. |
| Testing | Unit tests (Vitest) for all money math and answer checking | Wrong math in a money-teaching app would be harmful, so this has to be tested. |

### Folder structure
```
src/
  data/          restaurants/*.json, stores/*.json, hints.json
  lib/           money.ts (cents math, formatting, parsing), tax.ts, problems.ts, storage.ts
  components/    NumberPad, HelpButton, Wallet, Receipt, Calculator, ReadAloud
  modules/       Restaurant/, Store/, Wallet/, Budget/, Compare/, Receipts/
  clinician/     Settings, Dashboard, Export
  App.tsx
.github/workflows/deploy.yml
```

---

## 6. Build phases

**Phase 1: MVP (usable in session)** ✅ Built (October 2026)
- McDoogles (kiosk format): order → work out the total → **pay → make change**
- Wallet, count-up change helper, "check the cashier's change"
- Three help levels for both totals and change, keyboard and number-pad input, answer checking
- Clinician panel: tax toggle (default 7.25%), help settings, difficulty for totals and for change
- Basic per-problem data saved, and a session summary
- Laptop and phone layouts
- Deployed to GitHub Pages

**Phase 2: Shopping** ✅ Built (October 2026)
- Fal-Mart and Amazoom with cart and checkout, stocked with LEGGO and Star Warz products
- Taco Smell, Chipoodle, Domin-Oops and Starducks, plus the menu board format
- Saving-up goal (LEGGO set)

**Phase 3: Budgeting**
- Budget mode, the yes/no affordability game, Chaise Bank debit balance
- Bass Bro Shops, Grapplebee's (tip) and DoorDosh (fees)
- Progress charts, mastery rule, CSV export

**Phase 4: Extras**
- Comparison shopping and sales, receipt reading, script practice, online safety
- Print/homework mode, content editor, PWA offline, interest themes

---

## 7. Things to decide or watch out for

1. **Branding.** Use the parody names in §8 with similar colors and layout, but **no real logos or brand photos**. Item names are parodies too ("Big Mac" becomes the "Big Snack").
2. **Prices.** Use realistic prices for your area so the numbers feel real. Store them in JSON so they're easy to update.
3. **Privacy (HIPAA-adjacent).** Nothing identifying in the app or repo. Use initials or a nickname only. Data stays in the browser on the clinic device. Exports are the clinician's responsibility to store properly.
4. **Shared devices.** If several clients use one iPad, the app keeps a separate profile for each nickname.

---

## 8. Parody names

### Restaurants
| Real | Parody | Gag / item examples |
|---|---|---|
| McDonald's | **McDoogles** | Big Snack, McNuggies, Happy-ish Meal, McFlurrie |
| Taco Bell | **Taco Smell** | Crunchwrap Extreme-o, Nacho Fries Supreme, Baja Blast-Off |
| Chipotle | **Chipoodle** Mexican Grill | Poodle mascot. Burrito bowl builder, "Guac is extra (+$2.45)" |
| Domino's | **Domin-Oops** Pizza | "Oops! All Cheese," Lava Crunch Cake, build-your-own pizza |
| Starbucks | **Starducks** Coffee | Duck mascot. Venti → **"Quacki"** size. Pumpkin Spice Quackuccino |
| Subway | **Subwhey** | Footlong / 6-inch pricing, "Eat Fresh-ish" |
| Wendy's | **Windy's** | Frosty → "Breezy," Baconeator |
| Chick-fil-A | **Chick-fil-Eh?** | Spicy Deluxe-ish, waffle fries |
| Applebee's | **Grapplebee's** (sit-down) | Server, tip step, appetizer combos |
| DoorDash | **DoorDosh** | Delivery fee, service fee, "small order fee," tip |

### Stores and apps
| Real | Parody | Notes |
|---|---|---|
| Walmart | **Fal-Mart** | "Fallback" sale prices, pickup vs. delivery |
| Amazon | **Amazoom** | "Zoom Prime" free shipping, star ratings, "Buy Now" |
| Target | **Tar-Jay** | Optional later store |
| Bass Pro / Cabela's | **Bass Bro Shops** | Camo hoodie, blaze orange vest, boots, trail camera, deer corn, hand warmers, binoculars, deer license and tag. **No weapons or ammo.** |
| LEGO | **LEGGO** | Brick sets with piece counts and realistic prices |
| Star Wars | **Star Warz** | Millennium Fallcon, Darth Vapor helmet, Baby Yodel plush, Chewbucka, R2-D-Tooth |
| Bank (debit app) | **Chaise Bank** | Balance, transactions, "money left" |

### Rules for names
- Funny and recognizable, never crude or mean. No jokes that make fun of his interests.
- No real logos. Colors and layout hint at the brand (McDoogles is red and yellow, Fal-Mart is blue with a yellow spark).
- **Lightsabers and blasters:** left out by default to keep the no-weapons rule consistent. Clinician can decide otherwise.
