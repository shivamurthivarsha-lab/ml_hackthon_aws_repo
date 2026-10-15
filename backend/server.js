import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import authRoutes from './routes/auth.js';
import resourceRoutes from './routes/resources.js';
import requestRoutes from './routes/requests.js';
import analyticsRoutes from './routes/analytics.js';
import notificationRoutes from './routes/notifications.js';
import locationRoutes from './routes/locations.js';
import logRoutes from './routes/logs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIST = path.join(__dirname, '../frontend/dist');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Background daemon to check overdue requests periodically
function checkOverdueLoans() {
  try {
    const now = new Date();
    const issuedRequests = db.find('requests', (r) => r.status === 'issued');

    issuedRequests.forEach((req) => {
      if (req.due_date && new Date(req.due_date) < now) {
        db.update('requests', req.id, { status: 'overdue' });

        // Add overdue transaction
        db.insert('transactions', {
          id: `txn-auto-${Date.now()}-${req.id}`,
          request_id: req.id,
          resource_id: req.resource_id,
          user_id: req.user_id,
          user_name: req.user_name,
          action: 'OVERDUE_FLAGGED',
          timestamp: now.toISOString(),
          note: `Loan exceeded due date (${new Date(req.due_date).toLocaleDateString()}). Flagged overdue.`,
        });

        // Push overdue notification
        const existingOverdueNotif = db.findOne(
          'notifications',
          (n) => n.user_id === req.user_id && n.type === 'OVERDUE' && n.title.includes(req.resource_title)
        );

        if (!existingOverdueNotif) {
          db.insert('notifications', {
            id: `notif-overdue-${Date.now()}-${req.id}`,
            user_id: req.user_id,
            type: 'OVERDUE',
            title: `URGENT: Overdue Return - ${req.resource_title}`,
            message: `Your loan for "${req.resource_title}" was due on ${new Date(req.due_date).toLocaleDateString()}. Please return immediately to campus desk.`,
            channel: 'SMS',
            status: 'unread',
            created_at: now.toISOString(),
          });
        }
      }
    });
  } catch (err) {
    console.error('Error during automated overdue check:', err);
  }
}

// Run check on startup and every 5 minutes
checkOverdueLoans();
setInterval(checkOverdueLoans, 5 * 60 * 1000);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/logs', logRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Smart Campus Resource Hub API',
    version: '1.0.0',
    stats: {
      resources_count: db.getTable('resources').length,
      users_count: db.getTable('users').length,
      requests_count: db.getTable('requests').length,
      locations_count: db.getTable('locations').length,
    },
  });
});

// Serve frontend production build statically if available
if (fs.existsSync(FRONTEND_DIST)) {
  console.log(`📦 Serving production frontend build from ${FRONTEND_DIST}`);
  app.use(express.static(FRONTEND_DIST));

  // SPA fallback for all non-API GET routes
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
    }
    next();
  });
}

// 404 Handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found.` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Smart Campus Resource Hub running on http://localhost:${PORT}`);
  console.log(`🌐 Full-Stack Application is live!`);
});
