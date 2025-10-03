const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 4 }),
  body('role').isIn(['student','lecturer','pr','pl'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;

  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const [result] = await pool.query('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)', [name, email, hashed, role]);

    const payload = { id: result.insertId, name, email, role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });

    res.json({ token, user: payload });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
  body('role').optional().isIn(['student','lecturer','pr','pl'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, role } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ msg: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password).catch(() => false);
    if (!match) {
      if (user.password === password) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
      } else {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
    }

    if (role && user.role !== role) return res.status(403).json({ msg: 'Role mismatch' });

    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });

    res.json({ token, user: payload });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
