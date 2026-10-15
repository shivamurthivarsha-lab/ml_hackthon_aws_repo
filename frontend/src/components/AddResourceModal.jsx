import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { X, Plus, Package, MapPin, Sparkles, AlertCircle } from 'lucide-react';

export default function AddResourceModal({ isOpen, onClose, onSuccess }) {
  const [locations, setLocations] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Book');
  const [department, setDepartment] = useState('Computer Science');
  const [locationId, setLocationId] = useState('');
  const [roomDetails, setRoomDetails] = useState('');
  const [condition, setCondition] = useState('Excellent');
  const [totalQuantity, setTotalQuantity] = useState(3);
  const [maxBorrowDays, setMaxBorrowDays] = useState(7);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getLocations().then((res) => {
        setLocations(res.locations || []);
        if (res.locations && res.locations.length > 0) {
          setLocationId(res.locations[0].id);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Resource title is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await api.createResource({
        title: title.trim(),
        category,
        department,
        location_id: locationId,
        room_details: roomDetails.trim() || 'Central Stacks',
        condition,
        total_quantity: Number(totalQuantity),
        max_borrow_days: Number(maxBorrowDays),
        description: description.trim(),
        image_url:
          imageUrl.trim() ||
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500',
        tags: [category, department],
      });

      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Failed to create resource.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Plus className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-800 text-base">Add Campus Resource</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Item Title / Model *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Raspberry Pi 5 16GB Bundle, Clean Architecture Book..."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Book">Book / Reference</option>
                <option value="Lab Equipment">Lab Equipment</option>
                <option value="Electronics / IoT Kit">Electronics / IoT Kit</option>
                <option value="Project Materials">Study Notes & Materials</option>
                <option value="Computing / Media">Computing / Media</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics & Communication">Electronics & Comm.</option>
                <option value="Mechanical Engineering">Mechanical Engg.</option>
                <option value="Central Campus Services">Central Campus</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Campus Hub Location</label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Room / Shelf Details</label>
              <input
                type="text"
                value={roomDetails}
                onChange={(e) => setRoomDetails(e.target.value)}
                placeholder="e.g. Cabinet 3, Row B"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Quantity</label>
              <input
                type="number"
                min={1}
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Borrow Days</label>
              <input
                type="number"
                min={1}
                max={60}
                value={maxBorrowDays}
                onChange={(e) => setMaxBorrowDays(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description / Specs</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key specifications, components included in kit..."
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Image URL (Optional)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 cursor-pointer"
          >
            {submitting ? 'Registering...' : 'Register Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
