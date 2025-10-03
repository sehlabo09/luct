// backend/routes/lectures.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// 📌 Get all lectures (accessible to student, pr, lecturer)
router.get('/', auth, requireRole('student', 'pr', 'lecturer'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.*, 
              u.name AS lecturer_name, 
              c.course_name, 
              cl.name AS class_name
       FROM lectures l
       LEFT JOIN users u ON l.lecturer_id = u.id
       LEFT JOIN courses c ON l.course_id = c.id
       LEFT JOIN classes cl ON l.class_id = cl.id
       ORDER BY l.date_of_lecture DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
