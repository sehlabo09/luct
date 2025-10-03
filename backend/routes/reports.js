const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// create report (lecturer or pr)
router.post('/', auth, requireRole('lecturer','pr'), async (req, res) => {
  const {
    faculty_name, class_id, week_of_reporting, date_of_lecture, course_name, course_code,
    lecturer_name, actual_students_present, venue, scheduled_time, topic_taught,
    learning_outcomes, lecturer_recommendations
  } = req.body;

  try {
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM class_registrations WHERE class_id = ?',
      [class_id]
    );

    const total_registered_students = total || 0;

    const [result] = await pool.query(
      `INSERT INTO reports
       (faculty_name, class_id, week_of_reporting, date_of_lecture, course_name, course_code, lecturer_name,
        actual_students_present, total_registered_students, venue, scheduled_time, topic_taught,
        learning_outcomes, lecturer_recommendations)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        faculty_name, class_id, week_of_reporting, date_of_lecture, course_name, course_code,
        lecturer_name, actual_students_present, total_registered_students, venue,
        scheduled_time, topic_taught, learning_outcomes, lecturer_recommendations
      ]
    );

    const [row] = await pool.query('SELECT * FROM reports WHERE id = ?', [result.insertId]);
    res.json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// get all reports (any authenticated user; frontend will decide what to show)
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, cl.name as class_name
       FROM reports r
       LEFT JOIN classes cl ON r.class_id = cl.id
       ORDER BY r.date_of_lecture DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// PR adds feedback/recommendation to a report
router.post('/:id/feedback', auth, requireRole('pr'), async (req, res) => {
  const reportId = req.params.id;
  const { feedback } = req.body; // expect text

  try {
    await pool.query(
      'UPDATE reports SET lecturer_recommendations = ? WHERE id = ?',
      [feedback, reportId]
    );

    const [row] = await pool.query('SELECT * FROM reports WHERE id = ?', [reportId]);
    res.json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
