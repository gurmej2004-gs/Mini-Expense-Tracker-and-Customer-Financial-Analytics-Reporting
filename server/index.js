const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://mini-expense-tracker-mz38.onrender.com'
  ]
}));
app.use(express.json());

let expenses = [];

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Expense Tracker API',
    version: '1.0.0',
    status: 'running'
  });
});

const validateExpense = (data, isUpdate = false) => {
  const errors = [];
  if (!isUpdate && data.amount === undefined) errors.push('Amount is required');
  else if (data.amount !== undefined) {
    if (typeof data.amount !== 'number' || isNaN(data.amount)) errors.push('Amount must be a number');
    else if (data.amount <= 0) errors.push('Amount must be positive');
  }
  if (!isUpdate && !data.category) errors.push('Category is required');
  else if (data.category !== undefined) {
    const valid = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];
    if (!valid.includes(data.category)) errors.push('Invalid category');
  }
  if (data.date !== undefined) {
    const d = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (isNaN(d.getTime())) errors.push('Invalid date');
    else if (d > today) errors.push('Future date not allowed');
  }
  return errors;
};

app.get('/api/expenses/summary', (req, res) => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalThisMonth = expenses
    .filter(e => new Date(e.date) >= firstDay)
    .reduce((sum, e) => sum + e.amount, 0);
  const totalPerCategory = {};
  ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'].forEach(cat => {
    totalPerCategory[cat] = expenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
  });
  const highestSingleExpense = expenses.length > 0
    ? expenses.reduce((max, e) => e.amount > max.amount ? e : max, expenses[0])
    : null;
  res.json({ totalThisMonth, totalPerCategory, highestSingleExpense });
});

app.get('/api/expenses', (req, res) => {
  let filtered = [...expenses];
  if (req.query.category && req.query.category !== 'All')
    filtered = filtered.filter(e => e.category === req.query.category);
  if (req.query.startDate)
    filtered = filtered.filter(e => e.date >= req.query.startDate);
  if (req.query.endDate)
    filtered = filtered.filter(e => e.date <= req.query.endDate);
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(filtered);
});

app.post('/api/expenses', (req, res) => {
  const errors = validateExpense(req.body);
  if (errors.length > 0) return res.status(400).json({ error: errors.join(', ') });
  const newExpense = {
    id: uuidv4(),
    amount: req.body.amount,
    category: req.body.category,
    date: req.body.date || new Date().toISOString().split('T')[0],
    time: req.body.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    note: req.body.note || ''
  };
  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

app.put('/api/expenses/:id', (req, res) => {
  const index = expenses.findIndex(e => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Expense not found' });
  const errors = validateExpense(req.body, true);
  if (errors.length > 0) return res.status(400).json({ error: errors.join(', ') });
  const updatedExpense = { ...expenses[index], ...req.body };
  if (req.body.time) {
    updatedExpense.time = req.body.time;
  }
  expenses[index] = updatedExpense;
  res.json(expenses[index]);
});

app.delete('/api/expenses/:id', (req, res) => {
  const index = expenses.findIndex(e => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Expense not found' });
  expenses.splice(index, 1);
  res.json({ message: 'Deleted successfully' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));