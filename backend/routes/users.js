const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT id, name, email, role, student_number FROM users WHERE id = ?',
      [userId]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error('users/me error', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/users/lecturers (authenticated users)
router.get('/lecturers', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email FROM users WHERE role = 'lecturer' ORDER BY name"
    );
    res.json(rows);
  } catch (err) {
    console.error('users/lecturers error', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
