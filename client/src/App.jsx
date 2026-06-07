import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

const COLORS = {
  Food: '#2D3748',
  Transport: '#4A5568',
  Bills: '#718096',
  Entertainment: '#A0AEC0',
  Other: '#CBD5E0'
};

function App() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Filter state
  const [filters, setFilters] = useState({
    category: 'All',
    dateRange: 'This Month',
    startDate: '',
    endDate: ''
  });

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.category !== 'All') params.append('category', filters.category);
      
      if (filters.dateRange === 'This Month') {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        params.append('startDate', firstDay.toISOString().split('T')[0]);
        params.append('endDate', now.toISOString().split('T')[0]);
      } else if (filters.dateRange === 'Last Month') {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        params.append('startDate', firstDay.toISOString().split('T')[0]);
        params.append('endDate', lastDay.toISOString().split('T')[0]);
      } else if (filters.dateRange === 'Custom' && filters.startDate && filters.endDate) {
        params.append('startDate', filters.startDate);
        params.append('endDate', filters.endDate);
      }

      const response = await fetch(`${API_BASE}/expenses?${params}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE}/expenses/summary`);
      if (!response.ok) throw new Error('Failed to fetch summary');
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
  }, [filters]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Amount must be a positive number';
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    if (!formData.date) {
      errors.date = 'Date is required';
    } else {
      const expenseDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (expenseDate > today) {
        errors.date = 'Date cannot be in the future';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        note: formData.note
      };

      let response;
      if (editingExpense) {
        response = await fetch(`${API_BASE}/expenses/${editingExpense.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_BASE}/expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save expense');
      }

      setFormData({
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
      setEditingExpense(null);
      setFormErrors({});
      fetchExpenses();
      fetchSummary();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      note: expense.note
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/expenses/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete expense');
      fetchExpenses();
      fetchSummary();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      category: 'All',
      dateRange: 'This Month',
      startDate: '',
      endDate: ''
    });
  };

  const exportCSV = () => {
    const headers = ['Date', 'Category', 'Amount', 'Note'];
    const rows = expenses.map(exp => [
      exp.date,
      exp.category,
      exp.amount.toFixed(2),
      exp.note
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const chartData = CATEGORIES.map(cat => ({
    name: cat,
    value: summary?.totalPerCategory?.[cat] || 0
  })).filter(item => item.value > 0);

  return (
    <div className="app">
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <header style={{
        backgroundColor: '#4A5568',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontFamily: 'Cambria, serif',
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#F7FAFC',
          margin: '0 0 0.5rem 0'
        }}>Expense Tracker</h1>
        <p style={{
          fontFamily: 'Cambria, serif',
          fontSize: '1rem',
          color: '#A0AEC0',
          margin: '0'
        }}>Track your spending efficiently</p>
      </header>

      <section className="summary-panel">
        <div className="summary-card">
          <h3>Total Spent This Month</h3>
          {loading ? <div className="spinner"></div> : <p className="amount">{formatCurrency(summary?.totalThisMonth || 0)}</p>}
        </div>
        <div className="summary-card">
          <h3>Total Per Category</h3>
          {loading ? <div className="spinner"></div> : (
            <ul className="category-list">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <span>{cat}:</span>
                  <span>{formatCurrency(summary?.totalPerCategory?.[cat] || 0)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="summary-card">
          <h3>Highest Single Expense</h3>
          {loading ? <div className="spinner"></div> : summary?.highestSingleExpense ? (
            <div className="highest-expense">
              <p className="amount">{formatCurrency(summary.highestSingleExpense.amount)}</p>
              <p>{summary.highestSingleExpense.category}</p>
              <p className="date">{summary.highestSingleExpense.date}</p>
            </div>
          ) : (
            <p>No expenses yet</p>
          )}
        </div>
      </section>

      <section className="form-section">
        <h2>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label>Amount *</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className={formErrors.amount ? 'error' : ''}
            />
            {formErrors.amount && <span className="error-message">{formErrors.amount}</span>}
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={formErrors.category ? 'error' : ''}
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {formErrors.category && <span className="error-message">{formErrors.category}</span>}
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={formErrors.date ? 'error' : ''}
            />
            {formErrors.date && <span className="error-message">{formErrors.date}</span>}
          </div>

          <div className="form-group">
            <label>Note (Optional)</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows="3"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <div className="spinner"></div> : (editingExpense ? 'Update' : 'Add')}
          </button>
          
          {editingExpense && (
            <button type="button" className="cancel-btn" onClick={() => {
              setEditingExpense(null);
              setFormData({
                amount: '',
                category: 'Food',
                date: new Date().toISOString().split('T')[0],
                note: ''
              });
              setFormErrors({});
            }}>
              Cancel
            </button>
          )}
        </form>
      </section>

      <section className="filter-section">
        <h2>Filters</h2>
        <div className="filter-bar">
          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="All">All</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          {filters.dateRange === 'Custom' && (
            <div className="custom-date-range">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
              <span>to</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          )}

          <button className="clear-btn" onClick={handleClearFilters}>Clear Filters</button>
        </div>
      </section>

      <section className="table-section">
        <div className="table-header">
          <h2>Expenses</h2>
          <button className="export-btn" onClick={exportCSV}>Export CSV</button>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : expenses.length === 0 ? (
          <p className="empty-state">No expenses found.</p>
        ) : (
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <tr key={expense.id}>
                  <td>{expense.date}</td>
                  <td>{expense.category}</td>
                  <td>{formatCurrency(expense.amount)}</td>
                  <td>{expense.note || '-'}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(expense)}>✎</button>
                    <button className="delete-btn" onClick={() => handleDelete(expense.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {chartData.length > 0 && (
        <section className="chart-section">
          <h2>Spending by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
}

export default App;
