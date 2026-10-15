import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { authenticate, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = createToken(user);
  const { password_hash, ...safeUser } = user;

  db.logActivity(safeUser, 'LOGIN', 'User Session', `${safeUser.name} logged in as ${safeUser.role}.`);

  res.json({
    message: 'Login successful',
    token,
    user: safeUser,
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role = 'student', department, student_id, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = db.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = {
    id: `u-${uuidv4().slice(0, 8)}`,
    name,
    email: email.toLowerCase(),
    password_hash: passwordHash,
    role: ['student', 'faculty', 'admin'].includes(role) ? role : 'student',
    department: department || 'General Studies',
    student_id: student_id || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
    phone: phone || '',
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
    created_at: new Date().toISOString(),
  };

  db.insert('users', newUser);
  const token = createToken(newUser);
  const { password_hash, ...safeUser } = newUser;

  db.logActivity(safeUser, 'REGISTER', 'User Account', `New account registered for ${safeUser.name}.`);

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: safeUser,
  });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/users
router.get('/users', authenticate, (req, res) => {
  const users = db.find('users').map(({ password_hash, ...safe }) => safe);
  res.json({ users });
});

// POST /api/auth/quick-switch (Demo convenience endpoint)
router.post('/quick-switch', (req, res) => {
  const { role } = req.body;
  const user = db.findOne('users', (u) => u.role === role);
  if (!user) {
    return res.status(404).json({ error: `Demo user for role ${role} not found.` });
  }

  const token = createToken(user);
  const { password_hash, ...safeUser } = user;
  res.json({
    message: `Switched demo identity to ${safeUser.name} (${safeUser.role})`,
    token,
    user: safeUser,
  });
});

export default router;
