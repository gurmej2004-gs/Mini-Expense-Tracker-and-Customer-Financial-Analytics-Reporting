const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

// In-memory storage
let expenses = [];

// GET / - Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Expense Tracker API — your personal finance companion',
    version: '1.0.0',
    author: 'Studio Graphene Assessment — Exercise 2',
    status: 'running',
    description: 'Track your daily expenses, filter by category and date, and visualise your spending habits.',
    endpoints: {
      'GET /api/expenses': 'Get all expenses with optional filters (category, startDate, endDate)',
      'POST /api/expenses': 'Create a new expense',
      'PUT /api/expenses/:id': 'Update an existing expense by ID',
      'DELETE /api/expenses/:id': 'Delete an expense by ID',
      'GET /api/expenses/summary': 'Get total this month, per category totals, and highest single expense'
    }
  });
});

// Helper function to validate expense data
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
      errors.push('Category must be one of: Food, Transport, Bills, Entertainment, Other');
    }
  }

  if (data.date !== undefined) {
    const expenseDate = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (isNaN(expenseDate.getTime())) {
      errors.push('Date must be a valid date');
    } else if (expenseDate > today) {
      errors.push('Date cannot be in the future');
    }
  }

  if (data.note !== undefined && typeof data.note !== 'string') {
    errors.push('Note must be a string');
  }

  return errors;
};

// GET /api/expenses - Get all expenses with optional filtering
app.get('/api/expenses', (req, res) => {
  try {
    let filteredExpenses = [...expenses];

    // Filter by category
    if (req.query.category) {
      filteredExpenses = filteredExpenses.filter(exp => exp.category === req.query.category);
    }

    // Filter by date range
    if (req.query.startDate) {
      const startDate = new Date(req.query.startDate);
      filteredExpenses = filteredExpenses.filter(exp => new Date(exp.date) >= startDate);
    }

    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
      filteredExpenses = filteredExpenses.filter(exp => new Date(exp.date) <= endDate);
    }

    // Sort by date descending
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(filteredExpenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve expenses' });
  }
});

// POST /api/expenses - Create a new expense
app.post('/api/expenses', (req, res) => {
  try {
    const errors = validateExpense(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    const newExpense = {
      id: uuidv4(),
      amount: req.body.amount,
      category: req.body.category,
      date: req.body.date || new Date().toISOString().split('T')[0],
      note: req.body.note || '',
      createdAt: new Date().toISOString()
    };

    expenses.push(newExpense);
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// PUT /api/expenses/:id - Update an existing expense
app.put('/api/expenses/:id', (req, res) => {
  try {
    const index = expenses.findIndex(exp => exp.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const errors = validateExpense(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    const updatedExpense = {
      ...expenses[index],
      amount: req.body.amount !== undefined ? req.body.amount : expenses[index].amount,
      category: req.body.category !== undefined ? req.body.category : expenses[index].category,
      date: req.body.date !== undefined ? req.body.date : expenses[index].date,
      note: req.body.note !== undefined ? req.body.note : expenses[index].note
    };

    expenses[index] = updatedExpense;
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// DELETE /api/expenses/:id - Delete an expense
app.delete('/api/expenses/:id', (req, res) => {
  try {
    const index = expenses.findIndex(exp => exp.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    expenses.splice(index, 1);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// GET /api/expenses/summary - Get expense summary
app.get('/api/expenses/summary', (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate total for this month
    const thisMonthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });

    const totalThisMonth = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate total per category
    const totalPerCategory = {};
    const categories = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];
    
    categories.forEach(cat => {
      totalPerCategory[cat] = expenses
        .filter(exp => exp.category === cat)
        .reduce((sum, exp) => sum + exp.amount, 0);
    });

    // Find highest single expense
    const highestSingleExpense = expenses.length > 0 
      ? expenses.reduce((max, exp) => exp.amount > max.amount ? exp : max, expenses[0])
      : null;

    res.json({
      totalThisMonth,
      totalPerCategory,
      highestSingleExpense
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve summary' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
