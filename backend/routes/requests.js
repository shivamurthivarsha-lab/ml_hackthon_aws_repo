import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper to push in-app notification & log simulated SMS/Email dispatch
function notifyUser(userId, type, title, message, channel = 'IN_APP') {
  const notif = {
    id: `notif-${uuidv4().slice(0, 8)}`,
    user_id: userId,
    type,
    title,
    message,
    channel,
    status: 'unread',
    created_at: new Date().toISOString(),
  };
  db.insert('notifications', notif);
  return notif;
}

// GET /api/requests (Role-filtered: students see theirs; faculty/admin see relevant or all)
router.get('/', authenticate, (req, res) => {
  const { status } = req.query;
  const user = req.user;

  let list = db.find('requests');

  // Role scoping
  if (user.role === 'student') {
    list = list.filter((r) => r.user_id === user.id);
  } else if (user.role === 'faculty') {
    // Faculty can see requests by students in their department or where they are designated reviewer
    list = list.filter(
      (r) =>
        r.user_department === user.department ||
        r.faculty_reviewer_id === user.id ||
        r.user_id === user.id
    );
  }
  // Admin sees all requests

  if (status && status !== 'all') {
    list = list.filter((r) => r.status === status);
  }

  // Enrich with current resource snapshot
  const resources = db.find('resources');
  const resMap = Object.fromEntries(resources.map((r) => [r.id, r]));

  const enriched = list.map((r) => ({
    ...r,
    resource: resMap[r.resource_id] || null,
  }));

  res.json({
    total: enriched.length,
    requests: enriched,
  });
});

// POST /api/requests (Create borrow request)
router.post('/', authenticate, (req, res) => {
  const { resource_id, purpose, duration_days = 7 } = req.body;
  const user = req.user;

  if (!resource_id || !purpose) {
    return res.status(400).json({ error: 'Resource ID and borrowing purpose are required.' });
  }

  const resource = db.findById('resources', resource_id);
  if (!resource) {
    return res.status(404).json({ error: 'Selected resource not found.' });
  }

  if (resource.available_quantity <= 0) {
    return res.status(400).json({
      error: 'Resource currently has 0 available units. You may join the waitlist or choose an alternative.',
    });
  }

  // Check if student already has active loan for this item
  const existingActive = db.findOne(
    'requests',
    (r) =>
      r.user_id === user.id &&
      r.resource_id === resource_id &&
      ['pending', 'approved', 'issued'].includes(r.status)
  );

  if (existingActive) {
    return res.status(400).json({
      error: `You already have an active or pending request (${existingActive.status}) for this item.`,
    });
  }

  const requestedDays = Math.min(
    Number(duration_days) || 7,
    resource.max_borrow_days || 14
  );

  const newRequest = {
    id: `req-${uuidv4().slice(0, 8)}`,
    resource_id: resource.id,
    resource_title: resource.title,
    user_id: user.id,
    user_name: user.name,
    user_email: user.email,
    user_role: user.role,
    user_department: user.department,
    purpose,
    duration_days: requestedDays,
    status: 'pending',
    faculty_reviewer_id: null,
    faculty_name: null,
    remarks: null,
    start_date: null,
    due_date: null,
    return_date: null,
    created_at: new Date().toISOString(),
  };

  db.insert('requests', newRequest);

  // Record transaction
  db.insert('transactions', {
    id: `txn-${uuidv4().slice(0, 8)}`,
    request_id: newRequest.id,
    resource_id: resource.id,
    user_id: user.id,
    user_name: user.name,
    action: 'REQUESTED',
    timestamp: new Date().toISOString(),
    note: `Borrow request submitted for ${requestedDays} days.`,
  });

  // Notify faculty / admins of new pending request
  const faculties = db.find(
    'users',
    (u) => u.role === 'faculty' && u.department === user.department
  );
  faculties.forEach((fac) => {
    notifyUser(
      fac.id,
      'NEW_REQUEST',
      'New Resource Request',
      `${user.name} submitted a request for "${resource.title}".`,
      'IN_APP'
    );
  });

  db.logActivity(
    user,
    'REQUEST_RESOURCE',
    resource.title,
    `Submitted request for ${requestedDays} days. Reason: "${purpose.slice(0, 50)}..."`
  );

  res.status(201).json({
    message: 'Borrow request submitted successfully and queued for review.',
    request: newRequest,
  });
});

// PUT /api/requests/:id/status (Approval, Rejection, Issue, Return lifecycle)
router.put('/:id/status', authenticate, (req, res) => {
  const { action, remarks } = req.body; // action: 'approve' | 'reject' | 'issue' | 'return'
  const user = req.user;

  const request = db.findById('requests', req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  const resource = db.findById('resources', request.resource_id);

  if (action === 'approve') {
    if (!['faculty', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only faculty or admins can approve requests.' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Cannot approve request with status '${request.status}'.` });
    }

    const updated = db.update('requests', request.id, {
      status: 'approved',
      faculty_reviewer_id: user.id,
      faculty_name: user.name,
      remarks: remarks || `Approved by ${user.name}. Please collect at designated lab desk.`,
    });

    notifyUser(
      request.user_id,
      'APPROVAL',
      'Request Approved! 🎉',
      `Your request for "${request.resource_title}" was approved by ${user.name}. Ready for collection!`,
      'EMAIL'
    );

    db.insert('transactions', {
      id: `txn-${uuidv4().slice(0, 8)}`,
      request_id: request.id,
      resource_id: request.resource_id,
      user_id: user.id,
      user_name: user.name,
      action: 'APPROVED',
      timestamp: new Date().toISOString(),
      note: `Approved by ${user.name}. Remarks: ${remarks || 'None'}`,
    });

    db.logActivity(user, 'APPROVE_REQUEST', request.resource_title, `Approved for ${request.user_name}.`);
    return res.json({ message: 'Request approved successfully.', request: updated });
  }

  if (action === 'reject') {
    if (!['faculty', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only faculty or admins can reject requests.' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Cannot reject request with status '${request.status}'.` });
    }

    const updated = db.update('requests', request.id, {
      status: 'rejected',
      faculty_reviewer_id: user.id,
      faculty_name: user.name,
      remarks: remarks || 'Request was not approved at this time.',
    });

    notifyUser(
      request.user_id,
      'REJECTED',
      'Request Update',
      `Your request for "${request.resource_title}" could not be approved. Reason: ${remarks || 'Capacity limitations.'}`,
      'EMAIL'
    );

    db.insert('transactions', {
      id: `txn-${uuidv4().slice(0, 8)}`,
      request_id: request.id,
      resource_id: request.resource_id,
      user_id: user.id,
      user_name: user.name,
      action: 'REJECTED',
      timestamp: new Date().toISOString(),
      note: `Rejected by ${user.name}. Reason: ${remarks || 'Not specified.'}`,
    });

    db.logActivity(user, 'REJECT_REQUEST', request.resource_title, `Rejected request for ${request.user_name}.`);
    return res.json({ message: 'Request rejected.', request: updated });
  }

  if (action === 'issue') {
    if (!['faculty', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only lab in-charge or admin can mark items as issued.' });
    }
    if (request.status !== 'approved') {
      return res.status(400).json({ error: 'Item must be approved before it can be marked as issued.' });
    }

    if (!resource || resource.available_quantity <= 0) {
      return res.status(400).json({ error: 'No stock available to issue this resource.' });
    }

    const startDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (request.duration_days || 7));

    // Decrement resource availability
    db.update('resources', resource.id, {
      available_quantity: Math.max(0, resource.available_quantity - 1),
    });

    const updated = db.update('requests', request.id, {
      status: 'issued',
      start_date: startDate.toISOString(),
      due_date: dueDate.toISOString(),
      remarks: remarks || `Issued by ${user.name}. Return due by ${dueDate.toLocaleDateString()}.`,
    });

    notifyUser(
      request.user_id,
      'ISSUED',
      'Resource Checked Out 📦',
      `You have checked out "${request.resource_title}". Due date: ${dueDate.toLocaleDateString()}. Handle with care!`,
      'SMS'
    );

    db.insert('transactions', {
      id: `txn-${uuidv4().slice(0, 8)}`,
      request_id: request.id,
      resource_id: request.resource_id,
      user_id: user.id,
      user_name: user.name,
      action: 'ISSUED',
      timestamp: new Date().toISOString(),
      note: `Item physically collected. Due on ${dueDate.toLocaleDateString()}.`,
    });

    db.logActivity(user, 'ISSUE_RESOURCE', request.resource_title, `Issued to ${request.user_name}.`);
    return res.json({ message: 'Resource issued successfully.', request: updated });
  }

  if (action === 'return') {
    if (request.status !== 'issued' && request.status !== 'overdue') {
      return res.status(400).json({ error: `Cannot return request with status '${request.status}'.` });
    }

    // Restore resource availability
    if (resource) {
      db.update('resources', resource.id, {
        available_quantity: Math.min(resource.total_quantity, resource.available_quantity + 1),
      });
    }

    const returnDate = new Date().toISOString();
    const updated = db.update('requests', request.id, {
      status: 'returned',
      return_date: returnDate,
      remarks: remarks || `Returned and verified in good condition by ${user.name}.`,
    });

    notifyUser(
      request.user_id,
      'RETURN_CONFIRMED',
      'Return Confirmed ✅',
      `"${request.resource_title}" has been successfully returned and verified. Thank you!`,
      'EMAIL'
    );

    db.insert('transactions', {
      id: `txn-${uuidv4().slice(0, 8)}`,
      request_id: request.id,
      resource_id: request.resource_id,
      user_id: user.id,
      user_name: user.name,
      action: 'RETURNED',
      timestamp: returnDate,
      note: `Returned to inventory. Remarks: ${remarks || 'Verified.'}`,
    });

    db.logActivity(user, 'RETURN_RESOURCE', request.resource_title, `Return verified for ${request.user_name}.`);
    return res.json({ message: 'Resource returned successfully.', request: updated });
  }

  return res.status(400).json({ error: `Unknown action '${action}'. Valid: approve, reject, issue, return.` });
});

// PUT /api/requests/:id/extend (Request loan extension)
router.put('/:id/extend', authenticate, (req, res) => {
  const { extra_days = 3 } = req.body;
  const request = db.findById('requests', req.params.id);

  if (!request) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  if (request.user_id !== req.user.id && !['faculty', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Unauthorized to extend this loan.' });
  }

  if (request.status !== 'issued') {
    return res.status(400).json({ error: 'Only currently active issued items can be extended.' });
  }

  const currentDue = new Date(request.due_date);
  currentDue.setDate(currentDue.getDate() + Number(extra_days));

  const updated = db.update('requests', request.id, {
    due_date: currentDue.toISOString(),
    remarks: `${request.remarks || ''} [Extended by ${extra_days} days]`,
  });

  notifyUser(
    request.user_id,
    'EXTENSION',
    'Loan Extension Approved',
    `Your loan for "${request.resource_title}" has been extended to ${currentDue.toLocaleDateString()}.`,
    'IN_APP'
  );

  db.logActivity(req.user, 'EXTEND_LOAN', request.resource_title, `Extended by ${extra_days} days.`);

  res.json({
    message: `Loan extended by ${extra_days} days. New due date: ${currentDue.toLocaleDateString()}`,
    request: updated,
  });
});

export default router;
