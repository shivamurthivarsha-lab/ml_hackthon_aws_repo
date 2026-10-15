import React, { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BorrowModal({ resource, onClose, onSuccess }) {
  const { user, refreshNotifications } = useAuth();
  const [purpose, setPurpose] = useState('');
  const [durationDays, setDurationDays] = useState(resource.max_borrow_days || 7);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Calculate return date
  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + Number(durationDays));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purpose.trim()) {
      setError('Please provide a brief purpose or course project context.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await api.createRequest({
        resource_id: resource.id,
        purpose: purpose.trim(),
        duration_days: Number(durationDays),
      });

      // Celebration effect
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });

      await refreshNotifications();
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Failed to submit borrow request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-800 text-base">Submit Borrow Request</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resource Snapshot */}
        <div className="p-6">
          <div className="flex items-start space-x-4 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <img
              src={resource.image_url}
              alt={resource.title}
              className="w-16 h-16 rounded-xl object-cover border border-indigo-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                {resource.category}
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-1 truncate">{resource.title}</h4>
              <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                <MapPin className="w-3 h-3 text-indigo-500" />
                <span>
                  {resource.location?.name || 'Campus Hub'} • {resource.room_details}
                </span>
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Purpose */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Academic Purpose / Project Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={3}
                placeholder="e.g. For IoT Capstone final demo, studying sensor noise on inverter prototype..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder:text-slate-400"
              />
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Requested Duration</label>
                <span className="text-xs font-bold text-indigo-600">{durationDays} Days</span>
              </div>
              <input
                type="range"
                min={1}
                max={resource.max_borrow_days || 14}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>1 day minimum</span>
                <span>Max allowed: {resource.max_borrow_days || 14} days</span>
              </div>
            </div>

            {/* Estimated Return Schedule */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-600">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Estimated Due Date:</span>
              </div>
              <strong className="text-slate-900 font-semibold">
                {returnDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </strong>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {submitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
