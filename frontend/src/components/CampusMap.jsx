import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
  User,
  Package,
  Layers,
  ArrowRight,
  Sparkles,
  Building2,
  Compass,
} from 'lucide-react';

export default function CampusMap({ onSelectLocationFilter }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHub, setSelectedHub] = useState(null);

  // Simulated User Location
  const userPresets = [
    { name: 'Academic Quad (Block A)', lat: 12.9715, lng: 77.5945 },
    { name: 'Engineering Lawn (Block E)', lat: 12.9712, lng: 77.5939 },
    { name: 'Student Dormitories (North)', lat: 12.9735, lng: 77.5970 },
    { name: 'Campus Cafeteria Plaza', lat: 12.9702, lng: 77.5940 },
  ];

  const [currentUserLoc, setCurrentUserLoc] = useState(userPresets[0]);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const res = await api.getLocations();
      setLocations(res.locations || []);
      if (res.locations && res.locations.length > 0) {
        setSelectedHub(res.locations[0]);
      }
    } catch (err) {
      console.error('Failed to load campus locations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance in meters using Haversine
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  return (
    <div className="space-y-6">
      {/* Location Banner & User Spot Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Campus Geo-Inventory & Proximity Matching</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Location-Aware Resource Matching
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Find lab apparatus, textbooks, and hardware kits closest to your current lecture hall or workshop.
            Pick up materials right where you are.
          </p>

          {/* User Location Simulator */}
          <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <Navigation className="w-3.5 h-3.5 text-indigo-400" />
              <span>Simulate Your Location:</span>
            </span>
            {userPresets.map((preset) => {
              const active = currentUserLoc.name === preset.name;
              return (
                <button
                  key={preset.name}
                  onClick={() => setCurrentUserLoc(preset)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Interactive Hubs and Selected Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hubs List sorted by nearest distance */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>Campus Resource Hubs ({locations.length})</span>
            </h3>
            <span className="text-xs text-slate-500">Sorted by walking distance</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {locations
              .map((loc) => {
                const distanceMeters = getDistance(
                  currentUserLoc.lat,
                  currentUserLoc.lng,
                  loc.lat,
                  loc.lng
                );
                return { ...loc, distanceMeters };
              })
              .sort((a, b) => a.distanceMeters - b.distanceMeters)
              .map((loc, idx) => {
                const isSelected = selectedHub?.id === loc.id;
                const isClosest = idx === 0;

                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedHub(loc)}
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {isClosest && (
                      <span className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center space-x-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Closest Hub</span>
                      </span>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                        {loc.code.split('-')[0]}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-indigo-600">
                          {loc.distanceMeters}m
                        </div>
                        <div className="text-[10px] text-slate-400">~{Math.ceil(loc.distanceMeters / 75)} min walk</div>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 mt-3 text-base">{loc.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {loc.building} • {loc.floor}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1 text-slate-600">
                        <Package className="w-3.5 h-3.5 text-indigo-500" />
                        <span>
                          <strong className="text-slate-800">{loc.available_items}</strong> / {loc.total_items} in stock
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-indigo-600 hover:underline flex items-center space-x-0.5">
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Selected Hub Detail Card */}
        {selectedHub && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {selectedHub.code}
                </span>
                <span className="text-xs text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedHub.hours}</span>
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mt-4">{selectedHub.name}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {selectedHub.building}, {selectedHub.floor}
              </p>

              <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center space-x-3 text-xs text-slate-700">
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Manager / In-Charge</span>
                    <strong className="text-slate-800">{selectedHub.manager}</strong>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Campus Extension</span>
                    <span className="text-slate-800 font-medium">{selectedHub.phone}</span>
                  </div>
                </div>
              </div>

              {/* Inventory Capacity meter */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">Inventory Utilization</span>
                  <span className="text-indigo-600 font-bold">{selectedHub.utilization_rate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${selectedHub.utilization_rate}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  {selectedHub.available_items} units ready for immediate physical collection.
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectLocationFilter(selectedHub.id)}
              className="mt-6 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Filter Catalog for This Hub</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
