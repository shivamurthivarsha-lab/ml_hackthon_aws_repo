import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Calendar,
  AlertTriangle,
  RotateCcw,
  User,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RequestsManager() {
  const { user, refreshNotifications } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionRemarks, setActionRemarks] = useState({});
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadRequests();
  }, [statusFilter, user]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await api.getRequests({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setRequests(res.requests || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusAction = async (requestId, action) => {
    try {
      setProcessingId(requestId);
      const remarks = actionRemarks[requestId] || '';
      await api.updateRequestStatus(requestId, action, remarks);

      if (action === 'approve' || action === 'return') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      await refreshNotifications();
      await loadRequests();
    } catch (err) {
      alert(err.message || 'Action failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleExtension = async (requestId) => {
    try {
      setProcessingId(requestId);
      await api.extendRequest(requestId, 3);
      await refreshNotifications();
      await loadRequests();
    } catch (err) {
      alert(err.message || 'Extension failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending Review',
          className: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Clock,
        };
      case 'approved':
        return {
          label: 'Approved (Pickup Ready)',
          className: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: CheckCircle2,
        };
      case 'issued':
        return {
          label: 'Active Loan',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: Package,
        };
      case 'overdue':
        return {
          label: 'Overdue Return',
          className: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
          icon: ShieldAlert,
        };
      case 'returned':
        return {
          label: 'Returned & Closed',
          className: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: RotateCcw,
        };
      case 'rejected':
        return {
          label: 'Declined',
          className: 'bg-rose-50 text-rose-600 border-rose-200',
          icon: XCircle,
        };
      default:
        return {
          label: status,
          className: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: Clock,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>
              {user?.role === 'student' ? 'My Borrowing History & Active Loans' : 'Borrow Requests & Issue Desk'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {user?.role === 'student'
              ? 'Track review status, active loans, and scheduled return dates.'
              : `Review pending requests, authorize equipment check-out, and log returned items as ${user?.role}.`}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {['all', 'pending', 'approved', 'issued', 'overdue', 'returned'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No requests found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {statusFilter === 'all'
              ? 'No borrow records exist under this view.'
              : `No requests with status '${statusFilter}'.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const badge = getStatusBadge(req.status);
            const StatusIcon = badge.icon;
            const isProcessing = processingId === req.id;

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left: Resource and borrower info */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${badge.className}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                      <span className="text-[11px] text-slate-400">Request #{req.id}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{req.resource_title}</h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          <strong>{req.user_name}</strong> ({req.user_department})
                        </span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>Duration: {req.duration_days} Days</span>
                      {req.due_date && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span
                            className={`flex items-center space-x-1 font-semibold ${
                              req.status === 'overdue' ? 'text-rose-600' : 'text-slate-700'
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Due: {new Date(req.due_date).toLocaleDateString()}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Purpose Statement */}
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                      "{req.purpose}"
                    </p>

                    {/* Faculty remarks / review trail */}
                    {req.remarks && (
                      <div className="text-xs text-slate-700 flex items-start space-x-2 pt-1">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-indigo-900">
                            {req.faculty_name ? `${req.faculty_name}: ` : 'Note: '}
                          </strong>
                          <span>{req.remarks}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Role-based Action Triggers */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                    {/* Faculty/Admin Review Actions on 'pending' */}
                    {req.status === 'pending' && (user?.role === 'faculty' || user?.role === 'admin') && (
                      <div className="flex items-center space-x-2 w-full lg:w-auto">
                        <button
                          onClick={() => handleStatusAction(req.id, 'approve')}
                          disabled={isProcessing}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleStatusAction(req.id, 'reject')}
                          disabled={isProcessing}
                          className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {/* Admin/Faculty Issue Action on 'approved' */}
                    {req.status === 'approved' && (user?.role === 'faculty' || user?.role === 'admin') && (
                      <button
                        onClick={() => handleStatusAction(req.id, 'issue')}
                        disabled={isProcessing}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-md shadow-indigo-100"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Issue & Hand Over</span>
                      </button>
                    )}

                    {/* Return Action on 'issued' or 'overdue' */}
                    {(req.status === 'issued' || req.status === 'overdue') && (
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Student extension option */}
                        {user?.role === 'student' && req.status === 'issued' && (
                          <button
                            onClick={() => handleExtension(req.id)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                          >
                            +3 Days Extension
                          </button>
                        )}

                        {/* Return Confirmation (Faculty or Admin) */}
                        {(user?.role === 'faculty' || user?.role === 'admin') && (
                          <button
                            onClick={() => handleStatusAction(req.id, 'return')}
                            disabled={isProcessing}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Confirm Return</span>
                          </button>
                        )}
                      </div>
                    )}

                    {req.status === 'returned' && (
                      <span className="text-xs text-slate-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Archived</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
