import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ShieldCheck, Filter, Search, Clock, FileText, User, RefreshCw } from 'lucide-react';

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getLogs();
      setLogs(res.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (filterAction === 'ALL') return true;
    return l.action === filterAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span>Immutable Audit Trail & System Activity</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete compliance logs for equipment handling, faculty approvals, and automatic overdue checks.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
          >
            <option value="ALL">All Actions</option>
            <option value="REQUEST_RESOURCE">Resource Requests</option>
            <option value="APPROVE_REQUEST">Approvals</option>
            <option value="ISSUE_RESOURCE">Issues / Handover</option>
            <option value="RETURN_RESOURCE">Returns</option>
            <option value="DEADLINE_CHECK">Automated Checks</option>
          </select>

          <button
            onClick={loadLogs}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Table / List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Retrieving audit records...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching audit entries</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[10px]">
                      {log.action}
                    </span>
                    <strong className="text-slate-900">{log.target}</strong>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Actor: {log.actor_name}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 text-left sm:text-right shrink-0">
                  <Clock className="w-3 h-3 inline mr-1 text-slate-400" />
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
