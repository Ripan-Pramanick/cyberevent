import React from 'react';
import { 
  Calendar, 
  Layers, 
  Users, 
  Store, 
  Receipt, 
  Trello, 
  BarChart3, 
  Plus, 
  RotateCcw, 
  X, 
  TrendingUp, 
  Activity,
  Tags,
  LogOut,
  Sun,
  Moon,
  Settings as SettingsIcon,
  Briefcase // Added icon for Services module
} from 'lucide-react';
import { NavigationTab } from '../types';
import { useEventContext } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { CyberLogo } from './CyberLogo';
import { CurrencySwitcher } from './CurrencySwitcher';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenNewEvent: () => void;
  onOpenNewLead: () => void;
  onResetDemo: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewEvent,
  onOpenNewLead,
  onResetDemo,
  isOpenMobile,
  onCloseMobile
}) => {
  const { events, leads, categories, vendors, kanbanTasks, financialSummary } = useEventContext();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { format } = useCurrency();

  const activeEventsCount = events.filter(e => e.status !== 'Completed' && e.status !== 'Cancelled').length;
  const activeLeadsCount = leads.filter(l => l.status !== 'Won' && l.status !== 'Lost').length;
  const pendingTasksCount = kanbanTasks.filter(t => t.status !== 'Completed').length;

  const navItems = [
    { 
      id: 'dashboard' as NavigationTab, 
      label: 'Cockpit Overview', 
      icon: BarChart3,
      badge: null 
    },
    { 
      id: 'events' as NavigationTab, 
      label: 'Events & Summits', 
      icon: Calendar,
      badge: activeEventsCount > 0 ? `${activeEventsCount}` : null 
    },
    { 
      id: 'leads' as NavigationTab, 
      label: 'Inquiries & CRM', 
      icon: Users,
      badge: activeLeadsCount > 0 ? `${activeLeadsCount}` : null 
    },
    { 
      id: 'categories' as NavigationTab, 
      label: 'Taxonomies', 
      icon: Tags,
      badge: categories.length > 0 ? `${categories.length}` : null 
    },
    { 
      id: 'vendors' as NavigationTab, 
      label: 'Vendors', 
      icon: Store,
      badge: `${vendors.length}` 
    },
    // NEW: Services Module added here
    { 
      id: 'services' as NavigationTab, 
      label: 'Services', 
      icon: Briefcase,
      badge: null 
    },
    { 
      id: 'billing' as NavigationTab, 
      label: 'Ledger & Billing', 
      icon: Receipt,
      badge: null 
    },
    { 
      id: 'kanban' as NavigationTab, 
      label: 'Production Sprints', 
      icon: Trello,
      badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : null 
    },
    { 
      id: 'gantt' as NavigationTab, 
      label: 'Timeline & Milestones', 
      icon: Layers,
      badge: null 
    },
    { 
      id: 'settings' as NavigationTab, 
      label: 'Settings', 
      icon: SettingsIcon,
      badge: null 
    }
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  React.useEffect(() => {
    if (!isOpenMobile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpenMobile, onCloseMobile]);

  return (
    <>
      {/* Mobile & Tablet Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Glassmorphic Cyber Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 shrink-0 flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 flex shadow-2xl' : '-translate-x-full lg:flex hidden'
        } bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-r border-slate-200/80 dark:border-slate-800/80 select-none transition-colors duration-200`}
      >
        {/* Top Header & CyberEvents Brand */}
        <div className="p-4 sm:p-5 border-b border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between">
          <CyberLogo size="md" />
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600" />}
            </button>
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Currency Switcher & Quick Actions Strip in Sidebar */}
        <div className="px-4 pt-3.5 pb-2 space-y-2.5">
          {/* Currency Switcher Bar */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Currency:
            </span>
            <CurrencySwitcher id="sidebar-currency-switcher" />
          </div>

          <button
            id="btn-sidebar-create-event"
            onClick={() => {
              onOpenNewEvent();
              onCloseMobile();
            }}
            className="w-full px-3.5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 rounded-xl transition-all shadow-md shadow-cyan-500/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create an Event</span>
          </button>
          
          <button
            id="btn-sidebar-new-lead"
            onClick={() => {
              onOpenNewLead();
              onCloseMobile();
            }}
            className="w-full px-3 py-2 text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-cyan-500" />
            <span>Add New Lead</span>
          </button>
        </div>

        {/* Primary Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
            Navigation Matrix
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 font-bold shadow-xs border border-cyan-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-900/60 border border-transparent font-medium'
                }`}
              >
                {isActive && (
                  <span className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
                )}
                <div className="flex items-center gap-2.5 pl-1.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-500' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Operations Summary & User Profile */}
        <div className="p-3 border-t border-slate-200/70 dark:border-slate-800/80 space-y-2">
          {/* User Profile */}
          {user && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg ${user.avatarBg || 'bg-cyan-600'} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}>
                  {user.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">{user.name}</p>
                  <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium truncate leading-tight">{user.role}</p>
                </div>
              </div>
              <button
                id="btn-sidebar-sign-out"
                onClick={logout}
                title="Sign out to Login Screen"
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mini Financial Health Metric */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                <Activity className="w-3 h-3 text-emerald-500" />
                Gross Margin
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                {financialSummary.grossMarginPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 font-mono">
              <span>Pipeline:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {format(financialSummary.totalRevenue)}
              </span>
            </div>
          </div>

          {/* Reset Demo and Status */}
          <div className="flex items-center justify-between px-1 pt-0.5">
            <button
              id="btn-sidebar-reset-demo"
              onClick={onResetDemo}
              title="Reset sample data"
              className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Reset Data</span>
            </button>
            <div className="flex items-center gap-1 text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>System Online</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};