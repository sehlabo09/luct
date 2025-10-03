const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// get all courses (anyone)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.name as lecturer_name, c.stream_id
       FROM courses c
       LEFT JOIN users u ON c.lecturer_id = u.id`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// get all course registrations (admin or pr)
router.get('/:courseId/students', auth, async (req, res) => {
  const { courseId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.student_number, c.course_name, r.created_at
       FROM registrations r
       JOIN users u ON r.student_id = u.id
       JOIN courses c ON r.course_id = c.id
       WHERE r.course_id = ?`,
      [courseId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// student: get their own registrations
router.get('/registrations/me', auth, requireRole('student'), async (req, res) => {
  try {
    const studentId = req.user.id;
    const [rows] = await pool.query(
      `SELECT r.id, r.course_id, c.course_name, r.created_at
       FROM registrations r
       JOIN courses c ON r.course_id = c.id
       WHERE r.student_id = ?`,
      [studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// student: register into a course using student number
router.post('/:courseId/register', async (req, res) => {
  const { courseId } = req.params;
  const { student_number, name } = req.body;

  try {
    const [users] = await pool.query(
      "SELECT id FROM users WHERE student_number = ? AND role = 'student'",
      [student_number]
    );

    if (users.length === 0) {
      return res.status(400).json({ msg: 'Student not found. Make sure you entered the correct student number.' });
    }

    const studentId = users[0].id;

    await pool.query(
      'INSERT INTO registrations (student_id, course_id) VALUES (?, ?)',
      [studentId, courseId]
    );

    res.json({ msg: `Student ${name} registered successfully to course.` });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ msg: 'Already registered for this course.' });
    }
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
