import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/locations
router.get('/', (req, res) => {
  const locations = db.find('locations');
  const resources = db.find('resources');

  const enriched = locations.map((loc) => {
    const locResources = resources.filter((r) => r.location_id === loc.id);
    const totalInventory = locResources.reduce((sum, r) => sum + r.total_quantity, 0);
    const availableInventory = locResources.reduce((sum, r) => sum + r.available_quantity, 0);

    return {
      ...loc,
      resource_types_count: locResources.length,
      total_items: totalInventory,
      available_items: availableInventory,
      utilization_rate:
        totalInventory > 0
          ? Math.round(((totalInventory - availableInventory) / totalInventory) * 100)
          : 0,
    };
  });

  res.json({ locations: enriched });
});

export default router;
