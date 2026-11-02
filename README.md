# Ledgerly

Ledgerly is a lightweight expense tracker for individuals and small businesses. You record expenses
in naira or foreign currency, group them into categories with a monthly budget, and see where the
money went on a dashboard. Amounts can be shown in NGN (the default), USD, GBP or EUR, and any
filtered list can be exported to CSV for your accountant.

## Features

- Add, edit and delete expenses (description, amount, currency, date, category, notes)
- Categories with a colour and a monthly budget in NGN
- Dashboard: monthly total, budget remaining, spending and progress per category, 6 month trend
- Expense list with month, category and text filters, sorting and pagination
- CSV export of whatever the list is currently filtered to
- Display currency switcher (stored per browser)

## Stack

| Part     | Tech                                                         |
| -------- | ------------------------------------------------------------ |
| Frontend | React 19, React Router 8, TypeScript, Vite 8                 |
| Backend  | Node 24 (runs TypeScript natively), Express 5                |
| Data     | In-memory store seeded with demo data, optional JSON file    |
| Tests    | Vitest                                                       |

The API and the web app are served from one process on port **5101**. In development the server
mounts Vite in middleware mode, so there is no separate frontend dev server and no proxy to set up.

## Getting started

Requirements: Node 22.18+ (Node 24 recommended) and npm.

```bash
npm install
npm run dev        # http://localhost:5101 with hot reload
```

Production build:

```bash
npm run build      # builds the SPA into dist/
npm start          # serves dist/ and the API on http://localhost:5101
```

With Docker:

```bash
docker compose up --build
```

Configuration lives in environment variables (see `.env.example`):

- `PORT` (default `5101`)
- `LEDGERLY_DATA_FILE`: path to a JSON file. When set, data is loaded from and saved to that file.
  When empty, the app starts with fresh demo data on every restart.

## Demo data

On start the store is seeded with seven categories and roughly three months of expenses. Dates are
relative to today, so the current month always has data.

## Project layout

```
server/            Express app (API, static hosting, Vite middleware in dev)
  routes/          one router per resource: expenses, categories, summary, export
  store.ts         in-memory store with optional JSON persistence
  seed.ts          demo data
  validation.ts    request validation
shared/types.ts    types shared by the API and the web app
src/               React app
  api/client.ts    fetch wrapper and request cache
  pages/           Dashboard, Expenses, Categories
  components/      forms, table, dialogs, pickers
  lib/             money, date and amount helpers
tests/             Vitest suites (server/ and web/)
```

## API

| Method | Path                               | Notes                                              |
| ------ | ---------------------------------- | -------------------------------------------------- |
| GET    | `/api/expenses`                    | `month=YYYY-MM` or `all`, `categoryId`, `q`, `page`, `pageSize` |
| GET    | `/api/expenses/:id`                |                                                    |
| POST   | `/api/expenses`                    | body: `date, description, amount, currency, categoryId, notes?` |
| PUT    | `/api/expenses/:id`                | same body as POST                                  |
| DELETE | `/api/expenses/:id`                |                                                    |
| GET    | `/api/categories`                  |                                                    |
| POST   | `/api/categories`                  | body: `name, color, budget`                        |
| PUT    | `/api/categories/:id`              | same body as POST                                  |
| DELETE | `/api/categories/:id`              | 409 while the category still has expenses          |
| GET    | `/api/summary?month=YYYY-MM`       | dashboard data, all amounts in NGN                 |
| GET    | `/api/rates`                       | naira value of one unit of each currency           |
| GET    | `/api/export/expenses.csv`         | same filters as `/api/expenses`                    |

Money is stored per expense in its original currency. Everything that is totalled (dashboard,
budgets, the "Amount (NGN)" CSV column) is converted to naira with the rates in `server/money.ts`.

## Tests

```bash
npm test           # vitest run
npm run typecheck  # tsc
```

Server tests start the Express app on a random port against a fresh seeded store, so they do not
need anything running.
