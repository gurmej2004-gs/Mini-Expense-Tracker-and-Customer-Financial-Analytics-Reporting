const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// ✅ FIX 1: Render PORT FIX
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://mini-expense-tracker-1-sci1.onrender.com'
  ]
}));

app.use(express.json());

// In-memory storage
let expenses = [];

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Expense Tracker API Running',
    version: '1.0.0',
    status: 'running'
  });
});

// Validate expense
const validateExpense = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate && !data.amount) {
    errors.push('Amount is required');
  } else if (data.amount !== undefined) {
    if (typeof data.amount !== 'number' || isNaN(data.amount)) {
      errors.push('Amount must be a number');
    } else if (data.amount <= 0) {
      errors.push('Amount must be positive');
    }
  }

  if (!isUpdate && !data.category) {
    errors.push('Category is required');
  } else if (data.category !== undefined) {
    const validCategories = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];
    if (!validCategories.includes(data.category)) {
      errors.push('Invalid category');
    }
  }

  if (data.date !== undefined) {
    const expenseDate = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (isNaN(expenseDate.getTime())) {
      errors.push('Invalid date');
    } else if (expenseDate > today) {
      errors.push('Future date not allowed');
    }
  }

  return errors;
};

// GET all expenses
app.get('/api/expenses', (req, res) => {
  res.json(expenses);
});

// POST create expense
app.post('/api/expenses', (req, res) => {
  const errors = validateExpense(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  const newExpense = {
    id: uuidv4(),
    amount: req.body.amount,
    category: req.body.category,
    date: req.body.date || new Date().toISOString().split('T')[0],
    note: req.body.note || ''
  };

  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

// PUT update expense
app.put('/api/expenses/:id', (req, res) => {
  const index = expenses.findIndex(e => e.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  expenses[index] = {
    ...expenses[index],
    ...req.body
  };

  res.json(expenses[index]);
});

// DELETE expense
app.delete('/api/expenses/:id', (req, res) => {
  const index = expenses.findIndex(e => e.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  expenses.splice(index, 1);

  res.json({ message: 'Deleted successfully' });
});

// SUMMARY
app.get('/api/expenses/summary', (req, res) => {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory = {};
  expenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  res.json({
    total,
    byCategory
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});