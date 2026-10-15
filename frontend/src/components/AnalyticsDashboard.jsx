import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  BarChart3,
  TrendingUp,
  AlertOctagon,
  Package,
  Clock,
  RotateCcw,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  PieChart,
  Activity,
  CheckCircle,
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Computing campus utilization statistics...</p>
      </div>
    );
  }

  const { kpis, most_borrowed, shortages, category_breakdown, recent_transactions } = data;

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Fleet */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inventory</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {kpis.total_inventory_units}
            </span>
            <span className="text-xs text-slate-500">units in catalog</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
            <span>{kpis.available_units} units ready to borrow</span>
          </div>
        </div>

        {/* Active Loans */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Loans</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {kpis.active_loans}
            </span>
            <span className="text-xs text-slate-500">checked out</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {kpis.completed_returns} items successfully returned
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {kpis.pending_approvals}
            </span>
            <span className="text-xs text-slate-500">awaiting faculty</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 font-medium">
            Requires faculty authorization
          </div>
        </div>

        {/* Overdue Items Alert */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">
              {kpis.overdue_loans}
            </span>
            <span className="text-xs text-slate-500">past return date</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-500 font-medium">
            Automated SMS reminders triggered
          </div>
        </div>
      </div>

      {/* Main Two-Column Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Borrowed Items Ranking */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>Most Borrowed Campus Resources</span>
            </h3>
            <span className="text-xs text-slate-400">By loan velocity</span>
          </div>

          <div className="space-y-3">
            {most_borrowed.map((item, index) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center space-x-3.5 hover:bg-slate-100/70 transition-colors"
              >
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  #{index + 1}
                </span>

                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{item.title}</h4>
                  <p className="text-[11px] text-slate-500">{item.category}</p>

                  {/* Utilization Bar */}
                  <div className="mt-1.5 flex items-center space-x-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{ width: `${item.utilization_percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600">
                      {item.utilization_percent}% in use
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-slate-900">
                    {item.borrow_count} loans
                  </span>
                  <div className="text-[10px] text-slate-400">
                    {item.available_quantity}/{item.total_quantity} avail
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shortage & Procurement Alerts */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <AlertOctagon className="w-5 h-5 text-amber-500" />
              <span>Resource Shortages & Inventory Alerts</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {shortages.length} Alert{shortages.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3">
            {shortages.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-semibold">Inventory levels are healthy across all hubs!</p>
              </div>
            ) : (
              shortages.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border text-xs ${
                    item.severity === 'CRITICAL_OUT_OF_STOCK'
                      ? 'bg-rose-50/60 border-rose-200'
                      : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 font-bold text-sm truncate">{item.title}</strong>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.severity === 'CRITICAL_OUT_OF_STOCK'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {item.available_quantity === 0 ? '0 Units Available' : '1 Unit Remaining'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1">
                    Department: {item.department} • Total Fleet: {item.total_quantity}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center space-x-1.5 text-slate-700 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Action: {item.recommendation}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category Utilization & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <span>Category Utilization</span>
          </h3>

          <div className="space-y-3">
            {category_breakdown.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800">{cat.category}</span>
                  <span className="text-indigo-600 font-bold">{cat.utilization}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${cat.utilization}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  {cat.borrowed} of {cat.total} in circulation
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Transaction Audit Stream */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <span>Real-Time Activity Audit Trail</span>
            </h3>
            <span className="text-xs text-slate-400">Tamper-evident logs</span>
          </div>

          <div className="space-y-2.5">
            {recent_transactions.map((txn) => (
              <div
                key={txn.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between text-xs hover:bg-slate-100/60 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[10px]">
                      {txn.action}
                    </span>
                    <strong className="text-slate-800">{txn.user_name}</strong>
                  </div>
                  <p className="text-slate-600 mt-1">{txn.note}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 ml-3">
                  {new Date(txn.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
