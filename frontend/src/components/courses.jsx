const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// get all courses (anyone) OR filter by stream
router.get('/', async (req, res) => {
  try {
    const { stream_id } = req.query;
    let query = `
      SELECT c.*, u.name as lecturer_name, c.stream_id
      FROM courses c 
      LEFT JOIN users u ON c.lecturer_id = u.id
    `;
    let params = [];

    if (stream_id) {
      query += " WHERE c.stream_id = ?";
      params.push(stream_id);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// create course (pr only)
router.post('/', auth, requireRole('pr'), async (req, res) => {
  const { course_name, course_code, lecturer_id, stream_id } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO courses (course_name, course_code, lecturer_id, stream_id) VALUES (?,?,?,?)',
      [course_name, course_code, lecturer_id, stream_id]
    );
    const [row] = await pool.query('SELECT * FROM courses WHERE id = ?', [result.insertId]);
    res.json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
