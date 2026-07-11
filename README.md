# Mini Expense Tracker

A full-stack expense tracking web application built with **React (Vite)** on the frontend and **Node.js (Express)** on the backend. Users can log daily spending across categories, filter and manage expenses, and visualize their spending through a pie chart and summary panel. No authentication is required (single-user application).

---

## Live Demo

- **Frontend:** https://mini-expense-tracker-mz38.onrender.com
- **Backend:** https://expense-tracker-backend-1e0k.onrender.com

---

## Tech Stack

| Layer | Library / Tool | Version | Purpose |
|-------|---------------|---------|---------|
| Frontend | React | 18.2.0 | Component-based user interface |
| Build Tool | Vite + @vitejs/plugin-react | 5.0.8 / 4.2.1 | Fast development server with HMR |
| Charts | Recharts | 2.10.3 | Expense visualization using pie charts |
| Backend | Node.js + Express | 4.18.2 | REST API for expense management |
| CORS | cors | 2.8.5 | Enables communication between frontend and backend |
| Unique IDs | uuid | 9.0.0 | Generates unique expense IDs |
| Storage | In-memory Array | — | Lightweight storage without database setup |
| Styling | Plain CSS | — | Responsive and dependency-free styling |

---

## Features

- Add new expenses
- Edit existing expenses
- Delete expenses
- Filter expenses by category
- Filter by date range (This Month, Last Month, Custom)
- Monthly spending summary
- Highest expense tracker
- Category-wise expense breakdown
- Interactive pie chart
- Export visible expenses to CSV
- Indian Rupee (₹) currency formatting
- Responsive UI for desktop and mobile

---

## How to Run Locally

> **Prerequisite:** Node.js 18 or above installed.

### 1. Clone the Repository

```bash
git clone https://github.com/gurmej2004-gs/Mini-Expense-Tracker.git
cd Mini-Expense-Tracker
```

---

### 2. Start the Backend

```bash
cd server
npm install
node index.js
```

The backend runs at:

```
http://localhost:5000
```

---

### 3. Start the Frontend

Open another terminal.

```bash
cd client
npm install
npm run dev
```

The frontend runs at:

```
http://localhost:5173
```

The provided `.env` file already points to:

```
VITE_API_URL=http://localhost:5000
```

---

## API Documentation

### Base URL

```
http://localhost:5000
```

All requests and responses use JSON.

---

### GET `/expenses`

Returns all expenses sorted by newest first.

#### Response

```json
[
  {
    "id": "a1b2c3d4",
    "amount": 450,
    "category": "Food",
    "date": "2026-06-07",
    "note": "Lunch",
    "createdAt": "2026-06-07T08:30:00.000Z"
  }
]
```

---

### POST `/expenses`

Creates a new expense.

#### Request

```json
{
  "amount": 450,
  "category": "Food",
  "date": "2026-06-07",
  "note": "Optional note"
}
```

#### Validation

- Amount must be greater than zero.
- Category is required.
- Date cannot be in the future.

#### Response

Returns the newly created expense.

---

### PUT `/expenses/:id`

Updates an existing expense.

#### Request

```json
{
  "amount": 500,
  "note": "Dinner"
}
```

#### Success Response

```json
{
  "id": "...",
  "amount": 500,
  "category": "Food"
}
```

#### Error

```json
{
  "error": "Expense not found"
}
```

---

### DELETE `/expenses/:id`

Deletes an expense.

#### Success

```json
{
  "message": "Deleted successfully"
}
```

#### Error

```json
{
  "error": "Expense not found"
}
```

---

## Project Structure

```text
Mini-Expense-Tracker/
│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── .env
│
└── server/
    └── index.js
```

---

## Screenshots

### Dashboard

```text
Add your screenshot here:
screenshots/dashboard.png
```

### Expense Summary

```text
Add your screenshot here:
screenshots/summary.png
```

### Expense Chart

```text
Add your screenshot here:
screenshots/chart.png
```

---

## What Works

- Add, update, and delete expenses
- Category and date filtering
- Monthly expense summary
- Category-wise total calculation
- Highest expense detection
- Pie chart visualization
- CSV export
- Responsive design
- Indian currency formatting
- IST timestamp generation

---

## Limitations

- Single-user application
- No authentication or authorization
- Data is stored only in memory
- Data resets whenever the backend restarts

---

## Future Improvements

- Persistent database (SQLite, MongoDB, or PostgreSQL)
- Budget tracking by category
- Server-side validation
- Automated testing using Jest or Vitest
- Better error handling with notifications
- User authentication and authorization
- Dark mode
- Monthly analytics dashboard

---

## License

This project was developed for educational purposes and portfolio demonstration.
