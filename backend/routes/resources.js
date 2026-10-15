import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Haversine formula to compute distance in meters/kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters
}

// GET /api/resources
router.get('/', (req, res) => {
  const { search, category, department, location_id, available_only, user_lat, user_lng } = req.query;

  let list = db.find('resources');
  const locations = db.find('locations');
  const locationMap = Object.fromEntries(locations.map((loc) => [loc.id, loc]));

  // Apply filters
  if (category && category !== 'All') {
    list = list.filter((r) => r.category.toLowerCase() === category.toLowerCase());
  }

  if (department && department !== 'All') {
    list = list.filter((r) => r.department.toLowerCase() === department.toLowerCase());
  }

  if (location_id && location_id !== 'All') {
    list = list.filter((r) => r.location_id === location_id);
  }

  if (available_only === 'true') {
    list = list.filter((r) => r.available_quantity > 0);
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Enrich with location details & distance if user coordinates provided
  const enriched = list.map((item) => {
    const loc = locationMap[item.location_id] || null;
    let distance_meters = null;

    if (loc && user_lat && user_lng) {
      distance_meters = calculateDistance(
        parseFloat(user_lat),
        parseFloat(user_lng),
        loc.lat,
        loc.lng
      );
    }

    return {
      ...item,
      location: loc,
      distance_meters,
      distance_label: distance_meters !== null ? `${distance_meters}m away` : null,
      status: item.available_quantity > 0 ? 'available' : 'borrowed',
    };
  });

  // Sort by nearest if user location provided
  if (user_lat && user_lng) {
    enriched.sort((a, b) => (a.distance_meters || 999999) - (b.distance_meters || 999999));
  }

  res.json({
    total: enriched.length,
    resources: enriched,
  });
});

// GET /api/resources/:id
router.get('/:id', (req, res) => {
  const resource = db.findById('resources', req.params.id);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  const location = db.findById('locations', resource.location_id);
  const activeRequests = db.find(
    'requests',
    (req) => req.resource_id === resource.id && ['approved', 'issued', 'pending'].includes(req.status)
  );

  res.json({
    resource: {
      ...resource,
      location,
      active_loans_count: activeRequests.filter((r) => r.status === 'issued').length,
      pending_requests_count: activeRequests.filter((r) => r.status === 'pending').length,
    },
  });
});

// POST /api/resources (Faculty & Admin)
router.post('/', authenticate, authorize(['faculty', 'admin']), (req, res) => {
  const {
    title,
    category,
    department,
    location_id,
    room_details,
    condition = 'Excellent',
    total_quantity = 1,
    image_url,
    description,
    tags = [],
    max_borrow_days = 7,
  } = req.body;

  if (!title || !category || !location_id) {
    return res.status(400).json({ error: 'Title, category, and location are required.' });
  }

  const newResource = {
    id: `res-${uuidv4().slice(0, 8)}`,
    title,
    category,
    department: department || req.user.department || 'General',
    location_id,
    room_details: room_details || 'Main Desk',
    condition,
    total_quantity: Number(total_quantity) || 1,
    available_quantity: Number(total_quantity) || 1,
    image_url:
      image_url ||
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500',
    description: description || 'No detailed description provided.',
    tags: Array.isArray(tags) ? tags : [tags],
    max_borrow_days: Number(max_borrow_days) || 7,
    owner_id: req.user.id,
    created_at: new Date().toISOString(),
  };

  db.insert('resources', newResource);
  db.logActivity(
    req.user,
    'ADD_RESOURCE',
    newResource.title,
    `Added ${newResource.total_quantity} unit(s) of ${newResource.title} in ${newResource.category}.`
  );

  res.status(201).json({
    message: 'Resource registered successfully',
    resource: newResource,
  });
});

// PUT /api/resources/:id (Faculty & Admin)
router.put('/:id', authenticate, authorize(['faculty', 'admin']), (req, res) => {
  const resource = db.findById('resources', req.params.id);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  const updates = { ...req.body };
  delete updates.id; // Prevent id overwrite

  if (updates.total_quantity !== undefined) {
    const diff = Number(updates.total_quantity) - resource.total_quantity;
    updates.available_quantity = Math.max(0, resource.available_quantity + diff);
  }

  const updated = db.update('resources', req.params.id, updates);
  db.logActivity(
    req.user,
    'UPDATE_RESOURCE',
    updated.title,
    `Updated resource metadata or stock.`
  );

  res.json({
    message: 'Resource updated successfully',
    resource: updated,
  });
});

// DELETE /api/resources/:id (Admin only)
router.delete('/:id', authenticate, authorize(['admin']), (req, res) => {
  const resource = db.findById('resources', req.params.id);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  db.delete('resources', req.params.id);
  db.logActivity(
    req.user,
    'DELETE_RESOURCE',
    resource.title,
    `Archived/deleted resource permanently.`
  );

  res.json({ message: 'Resource deleted successfully' });
});

export default router;
