# Cash Course

A money-skills practice site for therapy sessions. It covers ordering food, adding up a total, paying, making change and checking change. It runs entirely in the browser and is hosted free on GitHub Pages. There are no accounts and no server, and data never leaves the device.

See [PLAN.md](PLAN.md) for the full roadmap.

## What's in this version (Phase 1)

| Activity | What he practices |
|---|---|
| **McDoogles** | Order from a kiosk menu → add up the order → (tax) → pay → work out the change → receipt |
| **Quick Change** | "The price is $7.39. You pay with $20. How much change?" Sets of 5–20 problems. |
| **Check the Change** | Work out the change, then check what the cashier hands back. Sometimes it's wrong. He learns what to say. |

Every problem has three help levels: **Hint → More help → Answer**. Each problem is logged with the highest help level used, the number of tries, the time taken and whether he used the calculator.

## Clinician settings

Click **🔒 Clinician** at the bottom-left of any page. The first time, you'll create a 4-digit PIN.

- **Ordering:** price difficulty (whole dollars → cents), free choice vs. order card, running total on/off
- **Tax:** on/off, rate (default 7.25%), whether the app or the client works out the tax
- **Paying:** app pays with the next bill up or a $20, client pays the next dollar up, or client picks bills from a wallet
- **Change help:** count up like a cashier (number line) or column subtraction with borrowing shown
- **Help:** how many help levels, start with help showing (errorless), wait before help unlocks, hint after a wrong answer
- **Calculator:** phone-style calculator on/off. Its use is recorded.
- **Display:** read-aloud buttons, large text, high contrast
- **This session:** today's results, the share done independently, results by skill, and every problem
- **Data:** export CSV for notes, download/import a JSON backup, delete data

The PIN only keeps settings away from the client. It isn't real security. All data lives in the browser's local storage on that device, so data from his phone and from your laptop stay separate. Use the backup export to move data between devices.

**Privacy:** use initials or a nickname, never a full name.

## Editing menus and prices

The McDoogles menu is in [src/data/mcdoogles.ts](src/data/mcdoogles.ts). Prices are in cents (`599` = $5.99). Change names or prices, then commit and push, and the site updates in a minute or two.

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
