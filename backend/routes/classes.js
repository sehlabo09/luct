const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// get all classes (public)
router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cl.*, c.course_name, u.name AS lecturer_name
       FROM classes cl
       LEFT JOIN courses c ON cl.course_id = c.id
       LEFT JOIN users u ON c.lecturer_id = u.id`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// get classes for a lecturer (auth required)
router.get('/lecturer', auth, requireRole('lecturer'), async (req, res) => {
  try {
    const lecturerId = req.user.id; // from JWT
    const [rows] = await pool.query(
      `SELECT cl.*, c.course_name, u.name AS lecturer_name
       FROM classes cl
       JOIN courses c ON cl.course_id = c.id
       JOIN users u ON c.lecturer_id = u.id
       WHERE c.lecturer_id = ?`,
      [lecturerId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// get student's registrations (auth required)
router.get('/registrations', auth, requireRole('student'), async (req, res) => {
  try {
    const studentId = req.user.id; // from token
    const [rows] = await pool.query(
      `SELECT r.id, r.class_id, cl.name as class_name, c.course_name, r.created_at
       FROM registrations r
       JOIN classes cl ON r.class_id = cl.id
       JOIN courses c ON cl.course_id = c.id
       WHERE r.student_id = ?`,
      [studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// register student to a class
router.post('/:classId/register', auth, requireRole('student'), async (req, res) => {
  const { classId } = req.params;
  const studentId = req.user.id; // student id from JWT

  try {
    await pool.query(
      'INSERT INTO registrations (student_id, class_id) VALUES (?, ?)',
      [studentId, classId]
    );
    res.json({ msg: 'Registered successfully!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ msg: 'Already registered for this class.' });
    }
    console.error("DB error:", err);
    res.status(500).json({ msg: 'Server error', error: err.sqlMessage });
  }
});

// ✅ NEW: get registered students + reports for the course this class belongs to
router.get('/:classId/students', auth, requireRole('lecturer'), async (req, res) => {
  const { classId } = req.params;

  try {
    // Get class + course info
    const [[classInfo]] = await pool.query(
      `SELECT cl.id AS class_id, cl.name AS class_name, 
              c.id AS course_id, c.course_name
       FROM classes cl
       JOIN courses c ON cl.course_id = c.id
       WHERE cl.id = ?`,
      [classId]
    );

    if (!classInfo) {
      return res.status(404).json({ msg: "Class not found" });
    }

    // Registered students under this class
    const [students] = await pool.query(
      `SELECT cr.id AS registration_id,
              s.id AS student_id,
              s.name AS student_name,
              s.student_number
       FROM class_registrations cr
       JOIN students s ON cr.student_id = s.id
       WHERE cr.class_id = ?`,
      [classId]
    );

    // Reports under the course
    const [reports] = await pool.query(
      `SELECT sr.id, sr.student_id, sr.student_name, sr.student_number,
              sr.rating, sr.feedback, sr.created_at
       FROM student_reports sr
       WHERE sr.course_id = ?`,
      [classInfo.course_id]
    );

    res.json({
      class: classInfo,
      registered_students: students,
      student_reports: reports
    });

  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ msg: "Server error", error: err.sqlMessage });
  }
});

module.exports = router;
