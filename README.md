# NestEgg — Household Budget Planner

[![Competition](https://make.fun/badge/best-household-budget-site-20261126-1457/feriyansyahlubis/household-budget-site/rank.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![Reward](https://make.fun/badge/best-household-budget-site-20261126-1457/feriyansyahlubis/household-budget-site/reward.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)

NestEgg is a household budget planner for one family — the Whitfields — built for the
[make.fun "Make the best household budget site" bounty](https://make.fun/c/best-household-budget-site-20261126-1457).
It runs entirely offline from static files, on a desktop and on a phone, with no build step and no network requests.

## What it does

Six pages, all reached from the top navigation, all working:

- **Dashboard** — income, spending, money left and savings rate for November 2026; a donut chart of spending by category; a 50/30/20 check; the closest savings goal; the latest transactions.
- **Budget** — the monthly plan per category (planned vs spent vs left). Planned amounts are editable and saved; every total on the site updates. The tip under the table is computed from the live figures — it names the category furthest over its plan, or the tightest one when nothing is over.
- **Transactions** — all 41 November transactions, filterable by category and searchable by shop or person. Add a new transaction or delete one, and the dashboard and budget change immediately.
- **Goals** — four savings goals with progress bars and finish dates computed from the monthly contribution. Add money to a goal, or create a new one.
- **Reports** — income vs spending for June–November 2026 as a bar chart, a spending table by category, and insights calculated from the real data (biggest category, biggest single expense, over-budget categories, best month).
- **Tips** — six money-saving habits this family actually uses, with real dollar savings: five habits free about $497 a month, on top of the $1,400 that moves to savings on payday, plus an interactive compound-growth calculator. Every action on the site (adding or deleting a transaction, adding money to a goal, creating a goal) shows a short confirmation, and wide tables scroll sideways on a phone instead of breaking the layout.

All figures are one consistent set of sample data for November 2026: every page computes from the same transactions, so the numbers always agree. Changes are saved in the browser (localStorage); the footer has a "Restore sample data" button.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or serve `app/` with any static server. No build step, no dependencies.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Files

- `app/index.html` — the page shell and navigation
- `app/style.css` — the whole design (system fonts only)
- `app/data.js` — the family's sample data, derived figures, and browser storage
- `app/charts.js` — the donut and bar charts, drawn on canvas
- `app/app.js` — routing, every page, and every control
- `main.ts` — the hand-in program
- `serve.ts` — a tiny static server for local testing
- `screenshots/` — real renders of the site (desktop dashboard, budget, reports, phone dashboard)

## License

MIT — see [LICENSE](LICENSE).
