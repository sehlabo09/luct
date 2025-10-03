const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

/**
 * GET /api/student-reports/student
 * Get logged-in student's own reports
 */
router.get('/student', auth, requireRole('student'), async (req, res) => {
  try {
    const studentId = req.user.id;
    const [rows] = await pool.query(
      `SELECT sr.*, c.course_name, c.course_code, u.name AS lecturer_name
       FROM student_reports sr
       LEFT JOIN courses c ON sr.course_id = c.id
       LEFT JOIN users u ON sr.lecturer_id = u.id
       WHERE sr.student_id = ?
       ORDER BY sr.created_at DESC`,
      [studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error('student-reports/student error', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * POST /api/student-reports
 * Submit a new student report (rating + comments)
 * body: { course_id, lecturer_id, rating, feedback }
 */
router.post('/', auth, requireRole('student'), async (req, res) => {
  try {
    const studentId = req.user.id;
    const { course_id, lecturer_id, rating, feedback } = req.body;

    // fetch student info
    const [[studentInfo]] = await pool.query(
      'SELECT name, student_number FROM users WHERE id = ?',
      [studentId]
    );
    if (!studentInfo) return res.status(404).json({ msg: 'Student not found' });

    await pool.query(
      `INSERT INTO student_reports
       (student_id, student_name, student_number, course_id, lecturer_id, rating, feedback, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        studentId, studentInfo.name, studentInfo.student_number || null,
        course_id, lecturer_id, rating || null, feedback || null
      ]
    );
    res.json({ msg: 'Report saved' });
  } catch (err) {
    console.error('student-reports/post error', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
