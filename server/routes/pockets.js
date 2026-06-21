const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all pockets
router.get('/', (req, res) => {
  try {
    const pockets = db.prepare('SELECT * FROM pockets ORDER BY created_at DESC').all();
    res.json({ success: true, data: pockets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single pocket with savings history
router.get('/:id', (req, res) => {
  try {
    const pocket = db.prepare('SELECT * FROM pockets WHERE id = ?').get(req.params.id);
    if (!pocket) return res.status(404).json({ success: false, message: 'Pocket tidak ditemukan' });

    const savings = db.prepare('SELECT * FROM pocket_savings WHERE pocket_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json({ success: true, data: { ...pocket, savings } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new pocket
router.post('/', (req, res) => {
  try {
    const { name, target, platform, instrument, frequency, routine_amount, estimated_date } = req.body;
    if (!name || !target || !platform || !instrument || !frequency || !routine_amount) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    }
    const result = db.prepare(`
      INSERT INTO pockets (name, target, platform, instrument, frequency, routine_amount, estimated_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, target, platform, instrument, frequency, routine_amount, estimated_date);

    const newPocket = db.prepare('SELECT * FROM pockets WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: newPocket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add savings to a pocket
router.post('/:id/savings', (req, res) => {
  try {
    const { amount, note } = req.body;
    const pocket = db.prepare('SELECT * FROM pockets WHERE id = ?').get(req.params.id);
    if (!pocket) return res.status(404).json({ success: false, message: 'Pocket tidak ditemukan' });

    // Add to pocket_savings
    db.prepare('INSERT INTO pocket_savings (pocket_id, amount, note) VALUES (?, ?, ?)').run(req.params.id, amount, note || '');

    // Update current_amount in pockets
    const newAmount = pocket.current_amount + amount;
    if (newAmount < 0) {
      return res.status(400).json({ success: false, message: 'Insufficient balance in pocket' });
    }
    db.prepare('UPDATE pockets SET current_amount = ? WHERE id = ?').run(newAmount, req.params.id);

    const updatedPocket = db.prepare('SELECT * FROM pockets WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updatedPocket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE pocket
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM pockets WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Pocket berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
