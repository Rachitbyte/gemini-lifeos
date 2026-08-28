import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Brain,
  Target,
  CheckSquare,
  Sparkles,
  History,
  ShieldCheck,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  user: User | null;
  onSignOut: () => void;
  memoriesCount: number;
  goalsCount: number;
  actionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  user,
  onSignOut,
  memoriesCount,
  goalsCount,
  actionsCount,
}) => {
  const navItems = [
    { id: 'dashboard' as AppView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspace' as AppView, label: 'AI Workspace', icon: Bot, highlight: true },
    { id: 'history' as AppView, label: 'History', icon: History },
    { id: 'memories' as AppView, label: 'Memories', icon: Brain, count: memoriesCount },
    { id: 'goals' as AppView, label: 'Goals', icon: Target, count: goalsCount },
    { id: 'actions' as AppView, label: 'Actions', icon: CheckSquare, count: actionsCount },
    { id: 'insights' as AppView, label: 'Insights', icon: Sparkles },
    { id: 'security' as AppView, label: 'Security & Audit', icon: ShieldCheck },
  ];

  return (
    <aside
      id="sidebar-nav"
      className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between shrink-0 h-screen sticky top-0 text-slate-200 z-30"
    >
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-teal-400 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-1">
                Gemini <span className="text-indigo-300 font-bold">LifeOS</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">PRIVATE AI WORKSPACE</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1.5 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/15 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isActive ? (
                    <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                  ) : (
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-200 shrink-0" />
                  )}
                  <span className={isActive ? 'font-semibold text-white' : ''}>{item.label}</span>
                </div>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="ml-auto text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono font-medium">
                    {item.count}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile & security badge */}
      <div className="p-4 border-t border-white/10 bg-white/[0.02]">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-9 h-9 rounded-full border border-white/20 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border border-white/20 flex items-center justify-center text-slate-300">
                  <span className="text-xs font-semibold">
                    {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'ME'}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {user.displayName || 'Authenticated User'}
                </p>
                <p className="text-[10px] text-teal-400 font-mono flex items-center gap-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                  Pro Workspace Active
                </p>
              </div>
            </div>

            <button
              id="sign-out-btn"
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl border border-white/5 hover:border-red-500/20 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="text-center py-2 text-xs text-slate-400">Not authenticated</div>
        )}
      </div>
    </aside>
  );
};
