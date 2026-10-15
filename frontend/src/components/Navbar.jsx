import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Layers,
  MapPin,
  Clock,
  BarChart3,
  Bell,
  UserCheck,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenNotifications, onResetDemo }) {
  const { user, switchRole, unreadNotifsCount } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const navItems = [
    { id: 'catalog', label: 'Resource Catalog', icon: Layers },
    { id: 'locations', label: 'Campus Map', icon: MapPin },
    {
      id: 'requests',
      label: user?.role === 'student' ? 'My Borrowings' : 'Requests & Approvals',
      icon: Clock,
    },
    { id: 'analytics', label: 'Analytics & Shortages', icon: BarChart3 },
    ...(user?.role === 'admin' || user?.role === 'faculty'
      ? [{ id: 'audit', label: 'Audit Trail', icon: ShieldCheck }]
      : []),
  ];

  const roles = [
    {
      id: 'student',
      title: 'Alice Walker',
      subtitle: 'Student (Computer Science)',
      badge: 'Student',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'faculty',
      title: 'Prof. Alan Vance',
      subtitle: 'Faculty (CS Lab In-Charge)',
      badge: 'Faculty',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
    {
      id: 'admin',
      title: 'Chief Admin',
      subtitle: 'Campus Resource Coordinator',
      badge: 'Admin',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('catalog')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Smart Campus</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Resource Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Sharing & Equipment Lending System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & Role Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notifications & Simulated Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Quick Demo Role Selector */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-left"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                  alt={user?.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-300"
                />
                <div className="hidden lg:block text-xs">
                  <div className="font-semibold text-slate-800 leading-tight">{user?.name}</div>
                  <div className="text-[10px] capitalize text-slate-500">{user?.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Switch Demo Identity
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Test permissions & approvals across campus roles
                    </p>
                  </div>
                  <div className="p-1 space-y-1">
                    {roles.map((r) => {
                      const isCurrent = user?.role === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => {
                            switchRole(r.id);
                            setRoleMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                            isCurrent ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-semibold text-slate-800">{r.title}</div>
                            <div className="text-[11px] text-slate-500">{r.subtitle}</div>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${r.badgeColor}`}>
                            {r.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 px-3 pt-2 mt-1">
                    <button
                      onClick={() => {
                        onResetDemo();
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Demo Database</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 space-x-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
