Here's the full README — copy everything below:

```markdown
# Mini Expense Tracker

**Exercise 2: Mini Expense Tracker** — A full-stack expense tracking web application built with React (Vite) on the frontend and Node.js (Express) on the backend. Users can log daily spending across categories, filter and manage expenses, and visualize their spending through a pie chart and summary panel. No authentication is required — single user assumed.

---

## Live Demo

- **Frontend:** https://mini-expense-tracker-mz38.onrender.com
- **Backend:** https://expense-tracker-backend-1e0k.onrender.com

---

## Tech Stack

| Layer | Library / Tool | Version | Why I chose it |
|-------|---------------|---------|----------------|
| Frontend framework | React | 18.2.0 | Component-based UI, hooks-friendly, widely used |
| Build tool | Vite + @vitejs/plugin-react | 5.0.8 / 4.2.1 | Fast dev server with HMR, minimal config |
| Charts | Recharts | 2.10.3 | React-native chart library, easy pie chart setup |
| Backend | Node.js + Express | — / 4.18.2 | Lightweight REST API, simple routing |
| CORS | cors | 2.8.5 | Lets the Vite dev server talk to the Express server |
| Unique IDs | uuid | 9.0.0 | Collision-free IDs for each expense record |
| Storage | In-memory array | — | No DB setup needed; satisfies the brief |
| Styling | Plain CSS | — | Keeps dependencies minimal, full control |

---

## How to Run Locally

> Assumes only **Node.js 18+** is installed. No global installs required.

### 1. Clone the repo

```bash
git clone https://github.com/gurmej2004-gs/Mini-Expense-Tracker.git
cd Mini-Expense-Tracker
```

### 2. Start the backend

```bash
cd server
npm install
node index.js
```

Server starts at `http://localhost:5000`

### 3. Start the frontend (open a new terminal)

```bash
cd client
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`

Open `http://localhost:5173` in your browser. The `.env` file in `/client` already points to `http://localhost:5000`.

---

## API Documentation

**Base URL:** `http://localhost:5000`

All request bodies are JSON. All responses are JSON.

### `GET /expenses`
Returns all expenses sorted by date, newest first.

**Response `200`:**
```json
[
  {
    "id": "a1b2c3d4-...",
    "amount": 450.00,
    "category": "Food",
    "date": "2026-06-07",
    "note": "Lunch",
    "createdAt": "2026-06-07T08:30:00.000Z"
  }
]
```

### `POST /expenses`
Add a new expense.

**Request body:**
```json
{
  "amount": 450.00,
  "category": "Food",
  "date": "2026-06-07",
  "note": "Optional note"
}
```

**Validation:** `amount` must be a positive number. `category` is required. `date` cannot be in the future.

**Response `201`:** The created expense object.

### `PUT /expenses/:id`
Update an existing expense by ID.

**Request body:** Any subset of `{ amount, category, date, note }`.

**Response `200`:** The updated expense object.

**Response `404`:** `{ "error": "Expense not found" }`

### `DELETE /expenses/:id`
Delete an expense by ID.

**Response `200`:** `{ "message": "Deleted successfully" }`

**Response `404`:** `{ "error": "Expense not found" }`

---

## Project Structure

```
Mini-Expense-Tracker/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx             # Root component — state, filtering, CRUD, chart
│   │   ├── App.css             # Global styles
│   │   └── main.jsx            # React entry point
│   ├── index.html              # HTML shell
│   ├── vite.config.js          # Vite config
│   └── .env                    # VITE_API_URL=http://localhost:5000
│
└── server/
    └── index.js                # Express server — all routes + in-memory storage
```

---

## What Works

- Add, edit, and delete expenses
- Filter by category and date range (this month, last month, custom)
- Summary panel: total spent this month, total per category, highest single expense
- Pie chart breakdown by category (Recharts)
- CSV export of currently visible expenses
- Currency formatted for Indian locale (₹1,234.50)
- Timestamps captured in IST (Indian Standard Time)
- Responsive layout for mobile

---

## Next Steps

Things I chose not to build due to time, and what I would add next:

- **Persistence** — Write expenses to a JSON file or SQLite so data survives server restarts (the brief lists this as a bonus)
- **Budget limits per category** — Let the user set a monthly cap per category with a visual warning when exceeded
- **Stricter form validation** — Currently handled on the frontend; I would add server-side validation too
- **Tests** — Add Vitest/Jest tests for the Express routes (POST validation, GET sort order, DELETE 404 case)
- **Better error UX** — Show toast notifications on API failures rather than silent errors
- **Authentication** — Out of scope for this brief but the natural next step for a real app

---

## Honesty Note

I used **Claude (Anthropic)** as an AI assistant during this project for talking through approach decisions. Every line of application code is my own, and I can walk through it in detail during the follow-up interview. As the brief states, using AI tools is permitted as long as you understand what you have submitted — I do.
```