import React from 'react';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate, getCategoryBadgeStyle } from '../utils/formatters';
import { NavigationTab } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { isSupabaseConfigured } from '../lib/supabase';
import { Database, Server } from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onSelectEvent: (eventId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onNavigate, 
  onSelectEvent 
}) => {
  const { 
    events, 
    leads, 
    vendors, 
    vendorBills, 
    kanbanTasks, 
    financialSummary,
    convertLeadToEvent 
  } = useEventContext();
  const { format, currencyConfig } = useCurrency();

  const activeEvents = events.filter(e => e.status !== 'Completed' && e.status !== 'Cancelled');
  const upcomingEvents = [...events]
    .filter(e => e.status !== 'Cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const activeLeads = leads.filter(l => l.status !== 'Won' && l.status !== 'Lost');
  const pipelinePotentialValue = activeLeads.reduce((sum, l) => sum + l.estimatedBudget, 0);

  // Sourcing stats
  let totalServices = 0;
  let inHouseCount = 0;
  let externalCount = 0;
  let inHouseCost = 0;
  let externalCost = 0;

  events.forEach(e => {
    e.services.forEach(s => {
      totalServices++;
      if (s.sourcing === 'in_house') {
        inHouseCount++;
        inHouseCost += s.actualCost || s.estimatedCost;
      } else {
        externalCount++;
        externalCost += s.actualCost || s.estimatedCost;
      }
    });
  });

  const inHousePct = totalServices > 0 ? Math.round((inHouseCount / totalServices) * 100) : 0;
  const externalPct = totalServices > 0 ? 100 - inHousePct : 0;

  // Category distribution
  const categoryCounts: Record<string, number> = {};
  events.forEach(e => {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  });

  // High priority tasks
  const highPriorityTasks = kanbanTasks
    .filter(t => t.status !== 'Completed' && (t.priority === 'Urgent' || t.priority === 'High'))
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Cockpit Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-slate-950 text-white shadow-2xl shadow-cyan-950/20 overflow-hidden border border-cyan-500/30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d412_1px,transparent_1px),linear-gradient(to_bottom,#06b6d412_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>EventFlow Operating System &bull; {currencyConfig.code} Active</span>
            </div>

            <Badge variant={isSupabaseConfigured ? "success" : "cyber"} className="gap-1.5 py-1">
              <Database className="w-3 h-3" />
              <span>{isSupabaseConfigured ? 'Supabase Postgres: Connected' : 'Supabase Postgres: Ready'}</span>
            </Badge>

            <span className="text-[11px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              Vercel Ready
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
            Event Production & Sourcing Cockpit
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Orchestrating in-house operations and contracted vendors across <strong className="text-cyan-300">{events.length} active events & productions</strong>. Integrated with multi-currency billing, linked vendor ledger, and production tracking.
          </p>
        </div>

        {/* Currency-Aware Banner Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 relative z-10 font-mono">
          <div>
            <span className="text-[11px] text-slate-400 block font-sans">Total Pipeline Contract</span>
            <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {format(financialSummary.totalRevenue)}
            </span>
            <span className="text-[10px] text-cyan-400 block font-sans">in {currencyConfig.name}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-sans">Gross Operating Yield</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-400 tracking-tight flex items-center gap-1">
              {financialSummary.grossMarginPercentage.toFixed(1)}%
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </span>
            <span className="text-[10px] text-slate-400 block font-sans">{format(financialSummary.totalGrossMargin)} Margin</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-sans">Active Vendors</span>
            <span className="text-lg sm:text-xl font-bold text-cyan-300 tracking-tight">
              {vendors.length} Vendors
            </span>
            <span className="text-[10px] text-slate-400 block font-sans">AV, Catering, Decor</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-sans">Prospective Leads</span>
            <span className="text-lg sm:text-xl font-bold text-amber-300 tracking-tight">
              {activeLeads.length} Inquiries
            </span>
            <span className="text-[10px] text-amber-400/90 block font-sans">{format(pipelinePotentialValue)}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Events */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Summits
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{activeEvents.length}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">of {events.length} total conferences</span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Next event in 18 days</span>
            <button 
              onClick={() => onNavigate('events')}
              className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Browse <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Client Invoicing in Selected Currency */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>Client Invoiced</span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">({currencyConfig.code})</span>
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {format(financialSummary.totalRevenue)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {format(financialSummary.totalClientPaid)} Paid
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              {format(financialSummary.totalClientOutstanding)} Due
            </span>
          </div>
        </div>

        {/* Direct Costs in Selected Currency */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Direct Event Costs
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {format(financialSummary.totalActualCost)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">
              Vendor: {format(vendorBills.reduce((s, b) => s + b.amount, 0))}
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">
              {format(financialSummary.totalVendorOutstanding)} Unpaid
            </span>
          </div>
        </div>

        {/* Gross Operating Margin */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gross Operating Yield
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {format(financialSummary.totalGrossMargin)}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {financialSummary.grossMarginPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Target: &gt; 35%</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
              Profitable <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Sourcing Strategy & Category Mix Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sourcing Distribution: In-House vs Vendor */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Sourcing Matrix</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">In-house capacity vs external contracted vendors</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {totalServices} Services
            </span>
          </div>
          <div className="space-y-4">
            <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
              <div 
                className="bg-emerald-500 transition-all shadow-[0_0_10px_#10b981]"
                style={{ width: `${inHousePct}%` }}
                title={`In-House: ${inHousePct}%`}
              />
              <div 
                className="bg-cyan-500 transition-all shadow-[0_0_10px_#06b6d4]"
                style={{ width: `${externalPct}%` }}
                title={`Vendor Sourced: ${externalPct}%`}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">In-House Crew</span>
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white">{inHouseCount} Services</div>
                <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {format(inHouseCost)} ({inHousePct}%)
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Higher margin on NetOps, staff check-ins & streaming
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
                  <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300">Vendor Partners</span>
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white">{externalCount} Services</div>
                <div className="text-xs font-mono text-cyan-700 dark:text-cyan-400 mt-0.5">
                  {format(externalCost)} ({externalPct}%)
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Audio-visual rigging, staging, catering, decor & venue logistics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Mix */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Event Category Taxonomy</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Distribution across event formats & types</p>
            </div>
            <button 
              onClick={() => onNavigate('categories')}
              className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
            >
              Taxonomy
            </button>
          </div>
          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / events.length) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{cat}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High Priority Live Tasks */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Urgent Sprints</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Critical deliverables in progress</p>
            </div>
            <button 
              onClick={() => onNavigate('kanban')}
              className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Board <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2.5">
            {highPriorityTasks.map(task => (
              <div 
                key={task.id}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 hover:border-cyan-500/40 transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{task.title}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    task.priority === 'Urgent' 
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span className="truncate max-w-[140px] text-cyan-600 dark:text-cyan-400 font-medium">{task.eventTitle}</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Due {formatDate(task.dueDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Events Roster & Leads CRM Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Cyber Summits List (2 columns) */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Confirmed Event Production Roster</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled events, venues & in-house vs partner breakdown</p>
            </div>
            <button
              onClick={() => onNavigate('events')}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              All Events <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {upcomingEvents.map(evt => {
              const inHouseServiceCount = evt.services.filter(s => s.sourcing === 'in_house').length;
              const vendorServiceCount = evt.services.filter(s => s.sourcing === 'external_vendor').length;

              return (
                <div 
                  key={evt.id}
                  onClick={() => onSelectEvent(evt.id)}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(evt.category)}`}>
                        {evt.category}
                      </span>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {evt.status}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                      {evt.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                        {formatDate(evt.date)}
                      </span>
                      <span>&bull;</span>
                      <span className="truncate">{evt.venue}</span>
                      <span>&bull;</span>
                      <span className="font-mono">{evt.guestCount} Attendees</span>
                    </div>
                  </div>

                  {/* Multi-Currency Price & Sourcing Tags */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 text-right">
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono">
                      {format(evt.budget)}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-medium">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        {inHouseServiceCount} In-House
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                        {vendorServiceCount} Vendor
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CRM Leads Fast Conversion (1 column) */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">Prospective Inquiries</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Direct booking lead pipeline</p>
              </div>
              <button
                onClick={() => onNavigate('leads')}
                className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                CRM Board <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {activeLeads.slice(0, 3).map(lead => (
                <div 
                  key={lead.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 hover:border-cyan-500/30 transition-all space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{lead.clientName}</h4>
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border mt-1 ${getCategoryBadgeStyle(lead.category)}`}>
                        {lead.category}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {format(lead.estimatedBudget)}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                    "{lead.notes}"
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
                    <span className="text-slate-500 font-mono">Target: {formatDate(lead.targetDate)}</span>
                    <button
                      onClick={() => convertLeadToEvent(lead.id)}
                      className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                      title="Convert this lead into an active event with pre-allocated services"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Convert</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate('leads')}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-center cursor-pointer"
            >
              Open Full Leads Pipeline ({leads.length} Leads)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
