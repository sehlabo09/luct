const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// Student submits rating
router.post('/', auth, requireRole('student'), async (req, res) => {
  const { course_id, lecturer_id, rating, feedback } = req.body;
  try {
    const studentId = req.user.id;
    const [student] = await pool.query('SELECT name FROM users WHERE id = ?', [studentId]);
    await pool.query(
      `INSERT INTO student_reports (student_id, student_name, student_number, course_id, lecturer_id, rating, feedback)
       VALUES (?,?,?,?,?,?,?)`,
      [studentId, student[0].name, req.user.student_number || null, course_id, lecturer_id, rating, feedback]
    );
    res.json({ msg: 'Feedback submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// PR / Lecturer fetch ratings
router.get('/:courseId', auth, requireRole('lecturer', 'pr'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sr.*, u.name as lecturer_name, c.course_name
       FROM student_reports sr
       LEFT JOIN users u ON sr.lecturer_id = u.id
       LEFT JOIN courses c ON sr.course_id = c.id
       WHERE sr.course_id = ?`,
      [req.params.courseId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
