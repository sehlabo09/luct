const express = require('express');
const router = express.Router();
const pool = require('../db');

// ✅ Register student by course
router.post('/register', async (req, res) => {
  try {
    const { student_id, student_name, course_id } = req.body;
    if (!student_id || !student_name || !course_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Insert student if not exists
    await pool.query(
      `INSERT INTO students (student_id, student_name)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE student_name = VALUES(student_name)`,
      [student_id, student_name]
    );

    // Register for course
    await pool.query(
      `INSERT INTO student_courses (student_id, course_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE course_id = VALUES(course_id)`,
      [student_id, course_id]
    );

    res.json({ message: '✅ Student registered successfully by course' });
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ message: 'Error registering student' });
  }
});

// ✅ Fetch registered courses for a student
router.get('/:student_id/courses', async (req, res) => {
  try {
    const { student_id } = req.params;
    const [rows] = await pool.query(
      `SELECT c.course_id, c.course_name, c.course_code
       FROM student_courses sc
       JOIN courses c ON sc.course_id = c.course_id
       WHERE sc.student_id = ?`,
      [student_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Fetch courses error:', err);
    res.status(500).json({ message: 'Error fetching student courses' });
  }
});

// ✅ Rate lecturer by course
router.post('/rate', async (req, res) => {
  try {
    const { student_id, course_id, rating, comments } = req.body;
    if (!student_id || !course_id || !rating) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await pool.query(
      `INSERT INTO course_ratings (student_id, course_id, rating, comments)
       VALUES (?, ?, ?, ?)`,
      [student_id, course_id, rating, comments || null]
    );

    res.json({ message: '✅ Rating submitted successfully (by course)' });
  } catch (err) {
    console.error('❌ Rating error:', err);
    res.status(500).json({ message: 'Error submitting rating' });
  }
});

// ✅ Get average rating per course
router.get('/course/:course_id/ratings', async (req, res) => {
  try {
    const { course_id } = req.params;
    const [rows] = await pool.query(
      `SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_ratings
       FROM course_ratings WHERE course_id = ?`,
      [course_id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Ratings fetch error:', err);
    res.status(500).json({ message: 'Error fetching ratings' });
  }
});

module.exports = router;
