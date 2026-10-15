import express from 'express';
import { db } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/analytics/dashboard
router.get('/dashboard', authenticate, (req, res) => {
  const resources = db.find('resources');
  const requests = db.find('requests');
  const users = db.find('users');
  const transactions = db.find('transactions');

  // Key KPI numbers
  const totalResources = resources.reduce((acc, r) => acc + r.total_quantity, 0);
  const totalAvailable = resources.reduce((acc, r) => acc + r.available_quantity, 0);
  const activeLoans = requests.filter((r) => r.status === 'issued').length;
  const overdueLoans = requests.filter((r) => r.status === 'overdue').length;
  const pendingApprovals = requests.filter((r) => r.status === 'pending').length;
  const totalCompletedLoans = requests.filter((r) => r.status === 'returned').length;

  const totalCatalogItems = resources.length;
  const overallUtilizationRate =
    totalResources > 0 ? Math.round(((totalResources - totalAvailable) / totalResources) * 100) : 0;

  // Most borrowed items calculation
  const borrowCounts = {};
  requests.forEach((req) => {
    borrowCounts[req.resource_id] = (borrowCounts[req.resource_id] || 0) + 1;
  });

  const mostBorrowed = resources
    .map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      department: r.department,
      image_url: r.image_url,
      total_quantity: r.total_quantity,
      available_quantity: r.available_quantity,
      borrow_count: borrowCounts[r.id] || 0,
      utilization_percent: Math.round(((r.total_quantity - r.available_quantity) / r.total_quantity) * 100),
    }))
    .sort((a, b) => b.borrow_count - a.borrow_count)
    .slice(0, 5);

  // Shortage alerts: items with <= 1 available unit and utilization >= 80% or 0 available
  const shortages = resources
    .filter((r) => r.available_quantity <= 1)
    .map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      department: r.department,
      total_quantity: r.total_quantity,
      available_quantity: r.available_quantity,
      severity: r.available_quantity === 0 ? 'CRITICAL_OUT_OF_STOCK' : 'WARNING_LOW_STOCK',
      recommendation:
        r.available_quantity === 0
          ? 'Procure 3-5 additional units or set strict borrow limits.'
          : 'High demand detected. Monitor returns closely.',
    }));

  // Category breakdown
  const categoryStats = {};
  resources.forEach((r) => {
    if (!categoryStats[r.category]) {
      categoryStats[r.category] = { category: r.category, total: 0, borrowed: 0, items_count: 0 };
    }
    categoryStats[r.category].total += r.total_quantity;
    categoryStats[r.category].borrowed += r.total_quantity - r.available_quantity;
    categoryStats[r.category].items_count += 1;
  });

  const categories = Object.values(categoryStats).map((c) => ({
    ...c,
    utilization: c.total > 0 ? Math.round((c.borrowed / c.total) * 100) : 0,
  }));

  // Department distribution
  const departmentStats = {};
  requests.forEach((req) => {
    const dept = req.user_department || 'Other';
    departmentStats[dept] = (departmentStats[dept] || 0) + 1;
  });

  const recentTransactions = transactions.slice(0, 8);

  res.json({
    kpis: {
      total_catalog_items: totalCatalogItems,
      total_inventory_units: totalResources,
      available_units: totalAvailable,
      active_loans: activeLoans,
      overdue_loans: overdueLoans,
      pending_approvals: pendingApprovals,
      completed_returns: totalCompletedLoans,
      utilization_rate: overallUtilizationRate,
    },
    most_borrowed: mostBorrowed,
    shortages,
    category_breakdown: categories,
    department_distribution: departmentStats,
    recent_transactions: recentTransactions,
  });
});

export default router;
