import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications
router.get('/', authenticate, (req, res) => {
  const user = req.user;
  const notifs = db.find('notifications', (n) => n.user_id === user.id);
  const unreadCount = notifs.filter((n) => n.status === 'unread').length;

  res.json({
    total: notifs.length,
    unread_count: unreadCount,
    notifications: notifs,
  });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, (req, res) => {
  const notif = db.findById('notifications', req.params.id);
  if (!notif) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  const updated = db.update('notifications', req.params.id, { status: 'read' });
  res.json({ message: 'Marked as read', notification: updated });
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, (req, res) => {
  const user = req.user;
  const list = db.find('notifications', (n) => n.user_id === user.id);
  list.forEach((n) => {
    db.update('notifications', n.id, { status: 'read' });
  });

  res.json({ message: 'All notifications marked as read' });
});

// POST /api/notifications/simulate-event (Event-driven notification tester)
router.post('/simulate-event', authenticate, (req, res) => {
  const { channel = 'SMS', event_type = 'DEADLINE_ALERT', custom_message } = req.body;
  const user = req.user;

  const sampleMessages = {
    DEADLINE_ALERT: `[SMS Alert] Reminder: Your borrowed item is due in 24 hours. Return or renew via Smart Campus Hub.`,
    FACULTY_NOTE: `[Email Dispatch] Prof. Alan Vance posted an update regarding CS-304 lab access hours this Friday.`,
    RETURN_REMINDER: `[Automated Call/SMS] Campus Library: Please return the borrowed manual at desk 4B today.`,
  };

  const message = custom_message || sampleMessages[event_type] || 'Event notification triggered.';

  const newNotif = {
    id: `notif-${uuidv4().slice(0, 8)}`,
    user_id: user.id,
    type: event_type,
    title: `Simulated ${channel} Dispatch`,
    message,
    channel,
    status: 'unread',
    created_at: new Date().toISOString(),
  };

  db.insert('notifications', newNotif);
  db.logActivity(user, 'SIMULATE_NOTIF', `${channel} Event`, `Simulated event notification sent.`);

  res.status(201).json({
    message: `Event-driven notification dispatched via simulated ${channel} gateway!`,
    notification: newNotif,
  });
});

export default router;
