import React, { useState } from 'react';
import { 
  Menu, 
  Plus, 
  Users, 
  RotateCcw, 
  BarChart3, 
  Calendar, 
  Store, 
  Receipt, 
  Trello, 
  Layers,
  Tags,
  LogOut,
  ChevronDown,
  Shield,
  Cpu,
  Sun,
  Moon,
  Settings as SettingsIcon
} from 'lucide-react';
import { NavigationTab } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { CurrencySwitcher } from './CurrencySwitcher';

interface TopNavProps {
  currentTab: NavigationTab;
  onOpenMobileMenu: () => void;
  onOpenNewEvent: () => void;
  onOpenNewLead: () => void;
  onResetDemo: () => void;
}

const TAB_INFO: Record<string, { title: string; subtitle: string; icon: React.ElementType }> = {
  dashboard: {
    title: 'Operations Cockpit',
    subtitle: 'High-level metrics, multi-currency revenue & cyber event schedules',
    icon: BarChart3
  },
  events: {
    title: 'Events & Summits',
    subtitle: 'Manage production scopes, attendees, venues & technical rigging',
    icon: Calendar
  },
  leads: {
    title: 'Client Inquiries & Pipeline',
    subtitle: 'Track incoming summit bids, enterprise RFPs & prospective hosts',
    icon: Users
  },
  vendors: {
    title: 'Vendors & Partners',
    subtitle: 'Manage event vendors, catering, AV, staging and external suppliers',
    icon: Store
  },
  billing: {
    title: 'Multi-Currency Billing & Ledger',
    subtitle: 'Live exchange rates, client invoices, vendor purchase orders & profit yields',
    icon: Receipt
  },
  kanban: {
    title: 'Production Sprints & Tasks',
    subtitle: 'Execution run-sheets, staging milestones & rig assignments',
    icon: Trello
  },
  categories: {
    title: 'Event Taxonomy & Scopes',
    subtitle: 'Event classifications, disciplines, and technical requirements',
    icon: Tags
  },
  gantt: {
    title: 'Timeline & Production Windows',
    subtitle: 'Rigging schedules, rehearsal windows, load-ins & execution milestones',
    icon: Layers
  },
  settings: {
    title: 'Settings & Company Profile',
    subtitle: 'Currency preferences, company billing details & invoice formatting',
    icon: SettingsIcon
  }
};

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onOpenMobileMenu,
  onOpenNewEvent,
  onOpenNewLead,
  onResetDemo
}) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const currentInfo = TAB_INFO[currentTab] || TAB_INFO.dashboard;
  const CurrentIcon = currentInfo.icon;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 transition-colors duration-200 overflow-hidden">
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-full">
        {/* Left: Mobile Trigger + Adaptive Brand / Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink">
          {/* Mobile & Tablet Sidebar Hamburger */}
          <button
            id="btn-mobile-menu-trigger"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all shrink-0 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile & Tablet Compact Logo & Title */}
          <div className="lg:hidden flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-slate-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-xs">
                <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
              <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white truncate">
                Cyber<span className="text-cyan-500">Events</span>
              </span>
            </div>
            {/* Breadcrumb on tablet (>= 768px) */}
            <div className="hidden md:flex items-center pl-2 border-l border-slate-200 dark:border-slate-800 min-w-0">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                {currentInfo.title}
              </span>
            </div>
          </div>

          {/* Desktop Full Title with Icon Box */}
          <div className="hidden lg:flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/60 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-xs shrink-0">
              <CurrentIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-none truncate">
                {currentInfo.title}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden xl:block mt-0.5 truncate">
                {currentInfo.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
          {/* Global Currency Switcher */}
          <div className="flex items-center">
            <CurrencySwitcher id="topnav-currency-switcher" />
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            id="topnav-theme-toggle"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/70 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-center cursor-pointer shrink-0"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-600 transition-transform -rotate-12 hover:rotate-0" />
            )}
          </button>

          {/* Quick Lead Button (Large Desktop only) */}
          <button
            id="topnav-btn-new-lead"
            onClick={onOpenNewLead}
            className="hidden xl:flex px-2.5 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl transition-colors items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-cyan-500" />
            <span>Lead</span>
          </button>

          {/* Create Cyber Event Button */}
          <button
            id="topnav-btn-new-event"
            onClick={onOpenNewEvent}
            title="Create New Event"
            className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Event</span>
          </button>

          {/* User Account / Profile Avatar Button */}
          {user && (
            <div className="relative">
              <button
                id="btn-topnav-user-profile"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 bg-white/70 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-all text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer shrink-0"
                aria-label="User Account Menu"
              >
                <div className={`w-7 h-7 rounded-lg ${user.avatarBg || 'bg-cyan-600'} text-white flex items-center justify-center font-bold text-[11px] shadow-xs shrink-0`}>
                  {user.initials}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[90px] xl:max-w-[120px]">
                    {user.name}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsUserMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-cyan-950/20 py-2 z-50 text-xs animate-in fade-in zoom-in-95">
                    <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{user.email}</p>
                      <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                        <Shield className="w-3 h-3 text-cyan-500" />
                        <span>{user.roleTitle}</span>
                      </div>
                    </div>
                    <div className="p-1.5 space-y-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors font-semibold cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out / Switch Account</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
