// backend/routes/streams.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// GET all streams (PR can access)
router.get('/', auth, requireRole('pr'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM streams ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching streams:', err);
    res.status(500).send('Server error');
  }
});

// Optional: Create a new stream (PR only)
router.post('/', auth, requireRole('pr'), async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Stream name is required' });

  try {
    const [result] = await pool.query('INSERT INTO streams (name, description) VALUES (?, ?)', [name, description || null]);
    const [row] = await pool.query('SELECT * FROM streams WHERE id = ?', [result.insertId]);
    res.json(row[0]);
  } catch (err) {
    console.error('Error creating stream:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
