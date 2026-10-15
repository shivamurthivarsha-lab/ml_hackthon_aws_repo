import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './api';
import Navbar from './components/Navbar';
import ResourceCatalog from './components/ResourceCatalog';
import CampusMap from './components/CampusMap';
import RequestsManager from './components/RequestsManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AuditTrail from './components/AuditTrail';
import NotificationCenter from './components/NotificationCenter';
import AddResourceModal from './components/AddResourceModal';
import {
  Layers,
  MapPin,
  Clock,
  BarChart3,
  ShieldCheck,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

function MainApp() {
  const { user, refreshNotifications } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [activeLocationFilter, setActiveLocationFilter] = useState(null);

  const handleSelectLocationFilter = (locId) => {
    setActiveLocationFilter(locId);
    setActiveTab('catalog');
  };

  const handleClearLocationFilter = () => {
    setActiveLocationFilter(null);
  };

  const handleResetDemo = async () => {
    if (window.confirm('Reset all demo data back to default values?')) {
      try {
        await api.resetDemoData();
        confetti({ particleCount: 40, spread: 50 });
        await refreshNotifications();
        window.location.reload();
      } catch (err) {
        alert('Failed to reset demo: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setIsNotifOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'catalog' && (
          <ResourceCatalog
            onAddResourceOpen={() => setIsAddResourceOpen(true)}
            activeLocationFilter={activeLocationFilter}
            onClearLocationFilter={handleClearLocationFilter}
          />
        )}

        {activeTab === 'locations' && (
          <CampusMap onSelectLocationFilter={handleSelectLocationFilter} />
        )}

        {activeTab === 'requests' && <RequestsManager />}

        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {activeTab === 'audit' && <AuditTrail />}
      </main>

      {/* Notification Center Drawer */}
      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Add Resource Modal */}
      <AddResourceModal
        isOpen={isAddResourceOpen}
        onClose={() => setIsAddResourceOpen(false)}
        onSuccess={() => {
          setIsAddResourceOpen(false);
          setActiveTab('catalog');
        }}
      />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center text-[10px] font-semibold ${
            activeTab === 'catalog' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span>Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          className={`flex flex-col items-center text-[10px] font-semibold ${
            activeTab === 'locations' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span>Hubs</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex flex-col items-center text-[10px] font-semibold ${
            activeTab === 'requests' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span>Borrow</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center text-[10px] font-semibold ${
            activeTab === 'analytics' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span>Stats</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mb-12 sm:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">Smart Campus Resource Hub</span>
            <span>• Sharing & Equipment Lending Platform</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Node.js / Express REST API • React + Vite + Tailwind CSS • JWT & RBAC
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
