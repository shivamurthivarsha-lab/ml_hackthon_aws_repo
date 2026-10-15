import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Plus,
  Book,
  Wrench,
  Cpu,
  FileSpreadsheet,
  Monitor,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  ArrowUpDown,
  Tag,
} from 'lucide-react';
import BorrowModal from './BorrowModal';

export default function ResourceCatalog({ onAddResourceOpen, activeLocationFilter, onClearLocationFilter }) {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [department, setDepartment] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedResourceForBorrow, setSelectedResourceForBorrow] = useState(null);
  const [inspectModalResource, setInspectModalResource] = useState(null);

  const categories = [
    { id: 'All', label: 'All Resources', icon: null },
    { id: 'Book', label: 'Books & Reference', icon: Book },
    { id: 'Lab Equipment', label: 'Lab Equipment', icon: Wrench },
    { id: 'Electronics / IoT Kit', label: 'IoT & Electronics Kits', icon: Cpu },
    { id: 'Project Materials', label: 'Study Notes & Materials', icon: FileSpreadsheet },
    { id: 'Computing / Media', label: 'Computing & Media', icon: Monitor },
  ];

  const departments = [
    'All',
    'Computer Science',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Central Campus Services',
  ];

  useEffect(() => {
    loadResources();
  }, [category, department, availableOnly, activeLocationFilter]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const res = await api.getResources({
        category: category !== 'All' ? category : undefined,
        department: department !== 'All' ? department : undefined,
        available_only: availableOnly ? 'true' : undefined,
        location_id: activeLocationFilter || undefined,
        search: search.trim() || undefined,
      });
      setResources(res.resources || []);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadResources();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Quick Add & Active Filters */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books, oscilloscopes, Arduino kits, lecture notes..."
              className="w-full pl-10 pr-24 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400 bg-slate-50/50"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Department Filter & Add Button */}
          <div className="flex items-center space-x-3">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Departments' : d}
                </option>
              ))}
            </select>

            <label className="flex items-center space-x-2 text-xs font-medium text-slate-600 cursor-pointer bg-slate-50 px-3 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded text-indigo-600 accent-indigo-600"
              />
              <span>In-Stock Only</span>
            </label>

            {(user?.role === 'faculty' || user?.role === 'admin') && (
              <button
                onClick={onAddResourceOpen}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-100 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Resource</span>
              </button>
            )}
          </div>
        </div>

        {/* Location filter active badge */}
        {activeLocationFilter && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Showing resources located at selected hub</span>
            </span>
            <button
              onClick={onClearLocationFilter}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Clear Hub Filter
            </button>
          </div>
        )}

        {/* Category Pills Bar */}
        <div className="mt-5 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => {
            const Icon = c.icon;
            const active = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading campus resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <Book className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No resources matched your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, removing filters, or adding a new resource as faculty.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => {
            const isAvailable = res.available_quantity > 0;
            const isLowStock = isAvailable && res.available_quantity <= 1;

            return (
              <div
                key={res.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail & Badges */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={res.image_url}
                      alt={res.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur text-slate-800 px-2.5 py-1 rounded-full shadow-xs">
                        {res.category}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      {isAvailable ? (
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs backdrop-blur flex items-center space-x-1 ${
                            isLowStock
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isLowStock ? (
                            <>
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Low Stock: {res.available_quantity} left</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-2.5 h-2.5" />
                              <span>{res.available_quantity} Available</span>
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs bg-slate-800/90 text-white backdrop-blur">
                          All Units Borrowed
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-semibold bg-slate-900/80 text-white px-2 py-0.5 rounded-md backdrop-blur">
                        Condition: {res.condition}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                      {res.department}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>

                    {/* Location detail */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">
                        {res.location?.name || 'Campus Desk'} • {res.room_details}
                      </span>
                    </div>

                    {/* Tags */}
                    {res.tags && res.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {res.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-0 flex items-center space-x-2">
                  <button
                    onClick={() => setInspectModalResource(res)}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Details
                  </button>

                  <button
                    onClick={() => setSelectedResourceForBorrow(res)}
                    disabled={!isAvailable}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm ${
                      isAvailable
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-indigo-100'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{isAvailable ? 'Request to Borrow' : 'Join Waitlist'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Borrow Modal */}
      {selectedResourceForBorrow && (
        <BorrowModal
          resource={selectedResourceForBorrow}
          onClose={() => setSelectedResourceForBorrow(null)}
          onSuccess={() => {
            setSelectedResourceForBorrow(null);
            loadResources();
          }}
        />
      )}

      {/* Inspect Detail Modal */}
      {inspectModalResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {inspectModalResource.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{inspectModalResource.title}</h3>
              </div>
              <button
                onClick={() => setInspectModalResource(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <img
              src={inspectModalResource.image_url}
              alt={inspectModalResource.title}
              className="w-full h-48 object-cover rounded-2xl my-4"
            />

            <p className="text-xs text-slate-600 leading-relaxed">{inspectModalResource.description}</p>

            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Total Fleet</span>
                <strong className="text-slate-800">{inspectModalResource.total_quantity} units</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Currently Available</span>
                <strong className="text-indigo-600">{inspectModalResource.available_quantity} units</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Max Loan Duration</span>
                <strong className="text-slate-800">{inspectModalResource.max_borrow_days} days</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Stored Location</span>
                <strong className="text-slate-800">{inspectModalResource.location?.name || 'Hub'}</strong>
              </div>
            </div>

            <button
              onClick={() => {
                const r = inspectModalResource;
                setInspectModalResource(null);
                setSelectedResourceForBorrow(r);
              }}
              disabled={inspectModalResource.available_quantity <= 0}
              className="mt-5 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Request Borrowing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
