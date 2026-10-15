import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  X,
  CheckCheck,
  Mail,
  Smartphone,
  Calendar,
  Sparkles,
  Send,
  AlertCircle,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function NotificationCenter({ isOpen, onClose }) {
  const { user, refreshNotifications } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simChannel, setSimChannel] = useState('SMS');
  const [simType, setSimType] = useState('DEADLINE_ALERT');
  const [customMsg, setCustomMsg] = useState('');
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      await refreshNotifications();
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await refreshNotifications();
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateEvent = async (e) => {
    e.preventDefault();
    try {
      setSimulating(true);
      await api.simulateEvent({
        channel: simChannel,
        event_type: simType,
        custom_message: customMsg.trim() || undefined,
      });

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.5 },
      });

      setCustomMsg('');
      await refreshNotifications();
      await loadNotifications();
    } catch (err) {
      alert(err.message || 'Simulation failed.');
    } finally {
      setSimulating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Notifications & Alerts</h3>
                <p className="text-[11px] text-slate-400">In-app, SMS, and Email dispatches</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold p-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-320px)] space-y-3">
            {loading ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading alerts...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No notifications right now.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = n.status === 'unread';
                return (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-2xl border text-xs transition-all ${
                      isUnread
                        ? 'bg-indigo-50/70 border-indigo-200 shadow-xs'
                        : 'bg-white border-slate-100 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                        {n.channel === 'EMAIL' ? (
                          <Mail className="w-3.5 h-3.5 text-indigo-600" />
                        ) : n.channel === 'SMS' ? (
                          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Bell className="w-3.5 h-3.5 text-slate-600" />
                        )}
                        <span>{n.title}</span>
                      </div>

                      <span className="text-[10px] text-slate-400">
                        {new Date(n.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>

                    <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px]">
                      <span className="font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500">
                        Channel: {n.channel}
                      </span>
                      {isUnread && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="text-indigo-600 font-bold hover:underline"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Event-driven notification simulator section */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Simulate Automated Event Dispatch</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Trigger an automated email/SMS deadline or pickup alert to test event delivery.
          </p>

          <form onSubmit={handleSimulateEvent} className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={simChannel}
                onChange={(e) => setSimChannel(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-xs"
              >
                <option value="SMS">SMS Gateway</option>
                <option value="EMAIL">Email Dispatch</option>
                <option value="IN_APP">In-App Alert</option>
              </select>

              <select
                value={simType}
                onChange={(e) => setSimType(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-xs"
              >
                <option value="DEADLINE_ALERT">Deadline Due Alert</option>
                <option value="FACULTY_NOTE">Faculty Desk Update</option>
                <option value="RETURN_REMINDER">Urgent Return Warning</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={simulating}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{simulating ? 'Dispatching...' : 'Dispatch Simulated Alert'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
