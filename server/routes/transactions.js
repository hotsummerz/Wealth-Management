const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all transactions
router.get('/', (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT * FROM transactions ORDER BY created_at DESC
    `).all();
    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET summary (total income, expense, balance)
router.get('/summary', (req, res) => {
  try {
    const income = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income'
    `).get();
    const expense = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense'
    `).get();
    res.json({
      success: true,
      data: {
        totalIncome: income.total,
        totalExpense: expense.total,
        balance: income.total - expense.total,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET monthly cashflow (group by week of current month)
router.get('/cashflow', (req, res) => {
  try {
    const cashflow = db.prepare(`
      SELECT
        CAST((strftime('%d', created_at) - 1) / 7 + 1 AS INTEGER) as week,
        type,
        SUM(amount) as total
      FROM transactions
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime')
      GROUP BY week, type
      ORDER BY week
    `).all();
    res.json({ success: true, data: cashflow });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new transaction
router.post('/', (req, res) => {
  try {
    const { type, amount, category, note } = req.body;
    if (!type || !amount || !category) {
      return res.status(400).json({ success: false, message: 'type, amount, dan category wajib diisi' });
    }
    const result = db.prepare(`
      INSERT INTO transactions (type, amount, category, note)
      VALUES (?, ?, ?, ?)
    `).run(type, amount, category, note || '');

    const newTransaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: newTransaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE transaction
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
