import express from 'express';
import { db } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/logs (Audit log - faculty and admin)
router.get('/', authenticate, authorize(['faculty', 'admin']), (req, res) => {
  const logs = db.find('logs');
  res.json({
    total: logs.length,
    logs: logs.slice(0, 50),
  });
});

// POST /api/logs/reset-demo (Reset DB to initial demo state)
router.post('/reset-demo', (req, res) => {
  db.reset();
  res.json({ message: 'Demo database has been successfully reset to factory seed values.' });
});

export default router;
