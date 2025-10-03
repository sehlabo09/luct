const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

/**
 * GET /api/class-registrations/student
 * Get logged-in student's registered classes
 */
router.get('/student', auth, requireRole('student'), async (req, res) => {
  try {
    const studentId = req.user.id;
    const [rows] = await pool.query(
      `SELECT cr.id AS registration_id, cl.id AS class_id, cl.name AS class_name, c.id AS course_id, c.course_name, c.course_code,
      u.id AS lecturer_id, u.name AS lecturer_name, cr.created_at
      FROM class_registrations cr
      JOIN classes cl ON cr.class_id = cl.id
      JOIN courses c ON cl.course_id = c.id
      LEFT JOIN users u ON c.lecturer_id = u.id
      WHERE cr.student_id = ?
      ORDER BY cr.created_at DESC`,
      [studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error('class-registrations/student error', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * POST /api/class-registrations/:classId/register
 * Register the logged-in student into that class
 */
router.post('/:classId/register', auth, requireRole('student'), async (req, res) => {
  const { classId } = req.params;
  const studentId = req.user.id;

  try {
    const [cls] = await pool.query('SELECT id FROM classes WHERE id = ?', [classId]);
    if (!cls.length) return res.status(400).json({ msg: 'Class not found' });

    await pool.query(
      'INSERT INTO class_registrations (student_id, class_id) VALUES (?, ?)',
      [studentId, classId]
    );

    res.json({ msg: 'Successfully registered to class!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ msg: 'Already registered for this class.' });
    }
    console.error('class-registrations/register error', err);
    res.status(500).json({ msg: 'Server error during registration' });
  }
});

module.exports = router;
