# Cash Course

A money-skills practice site for therapy sessions. It covers ordering food, adding up a total, paying, making change and checking change. It runs entirely in the browser and is hosted free on GitHub Pages. There are no accounts and no server, and data never leaves the device.

See [PLAN.md](PLAN.md) for the full roadmap.

## What's in it

| Section | Activity | What he practices |
|---|---|---|
| 🍽️ Eat out | **McDoogles, Taco Smell, Chipoodle, Domin-Oops, Starducks** | Order (kiosk or menu board) → add up the order → (tax) → pay → work out the change → receipt. Chipoodle and Domin-Oops have build-your-own items with paid add-ons (guac, toppings). Starducks has Tall/Grande/Quacki sizes and add-ins. |
| | **Grapplebee's** | Sit-down restaurant: the server brings the check, he picks or works out the tip, then pays |
| | **DoorDosh** | Order delivery at higher app prices → add up the delivery fee, service fee, small order fee and tip → "How much extra does delivery cost?" |
| 🛒 Shop online | **Fal-Mart, Amazoom, LEGGO Store, Bass Bro Shops** | Search and browse → product page → cart → subtotal → pick delivery → "Is shipping free?" → total with shipping/tax → how much is left on the gift card → place order. Bass Bro Shops is hunting and fishing gear (no weapons or ammo). |
| 💪 Money skills | **Quick Change** | "The price is $7.39. You pay with $20. How much change?" |
| | **Check the Change** | Work out the change, then check what the cashier hands back, and learn what to say if it's wrong |
| | **Saving Up** | Pick a goal (LEGGO Star Warz sets, trail camera, deer license…): "How much more do you need?" and "How many weeks?" |
| | **Can I Afford It?** | "You have $10. It costs $11.29. Can you buy it?" Quick yes/no, then how much is left or how much more he'd need |
| | **Chaise Bank** | A debit account: purchases and deposits, "What's your balance now?", and cards declined when there isn't enough |

**Budget mode** (clinician setting): "You have $15 to spend." After the total, he answers "Do you have enough?" If not, he goes back and puts something back. In stores, the gift card becomes the budget.

With **Order type → Task**, restaurants give an **order card** and stores give a **shopping list**, sometimes including "the cheapest ___", so he has to compare prices.

Every problem has three help levels: **Hint → More help → Answer**. Each problem is logged with the highest help level used, the number of tries, the time taken and whether he used the calculator.

## Clinician settings

Click **🔒 Clinician** at the bottom-left of any page. The first time, you'll create a 4-digit PIN.

- **Ordering and shopping:** price difficulty (whole dollars → cents), free choice vs. task (order card / shopping list), kiosk vs. menu board, running total on/off, gift card amount for online stores
- **Tax:** on/off, rate (default 7.25%), whether the app or the client works out the tax
- **Paying:** app pays with the next bill up or a $20, client pays the next dollar up, or client picks bills from a wallet
- **Change help:** count up like a cashier (number line) or column subtraction with borrowing shown
- **Help:** how many help levels, start with help showing (errorless), wait before help unlocks, hint after a wrong answer
- **Calculator:** phone-style calculator on/off. Its use is recorded.
- **Display:** read-aloud buttons, large text, high contrast
- **Budget and tips:** budget off, a fixed amount, or different each order; tip mode at Grapplebee's (pick 15/18/20%, or work out 15% or 20%)
- **This session:** today's results, the share done independently, results by skill, and every problem
- **Progress:** a chart of the share done independently each day (by skill or all), and a mastery check per skill. The mastery rule is adjustable, e.g. 80% for 3 sessions in a row with at least 5 problems.
- **Data:** export CSV for notes, download/import a JSON backup, delete data

The PIN only keeps settings away from the client. It isn't real security. All data lives in the browser's local storage on that device, so data from his phone and from your laptop stay separate. Use the backup export to move data between devices.

**Privacy:** use initials or a nickname, never a full name.

## Editing menus, products and prices

- Restaurant menus: [src/data/restaurants/](src/data/restaurants/), one file per restaurant
- Store products: [src/data/stores/](src/data/stores/). LEGGO and Star Warz items are shared in `toys.ts`, and each store sets its own price.
- Saving Up goals: the top of [src/modules/SavingUp.tsx](src/modules/SavingUp.tsx)

Prices are in cents (`599` = $5.99). Change names or prices, then commit and push, and the site updates in a minute or two.

## Running it on your computer

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173.

```bash
npm test
```

## Publishing to GitHub Pages

1. Create a new repository on GitHub (for example `cash-course`). GitHub Pages on a free account needs a **public** repository. The site holds no client data, so that's fine.
2. Push this folder to the repository's `main` branch.
3. On GitHub, go to **Settings → Pages**, and under **Build and deployment → Source** choose **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` runs the tests, builds and publishes. The site will be at `https://<your-username>.github.io/<repo-name>/`.

On his phone, open the site and use **Share → Add to Home Screen** (iPhone) or **⋮ → Add to Home screen** (Android) so it opens like an app.
