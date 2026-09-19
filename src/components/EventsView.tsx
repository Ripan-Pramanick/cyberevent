import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight,
  Trash2,
  Edit3
} from 'lucide-react';
import { EventItem, EventStatus } from '../types';
import { useEventContext } from '../context/EventContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate, getCategoryBadgeStyle } from '../utils/formatters';

interface EventsViewProps {
  onSelectEvent: (eventId: string) => void;
  onOpenCreateEvent: () => void;
  onOpenEditEvent?: (event: EventItem) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  onSelectEvent,
  onOpenCreateEvent,
  onOpenEditEvent
}) => {
  const { events, categories: ctxCategories, deleteEvent } = useEventContext();
  const { format, currencyConfig } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const categoryNamesSet = new Set<string>(['All']);
  ctxCategories.forEach(c => categoryNamesSet.add(c.name));
  events.forEach(e => {
    if (e.category) categoryNamesSet.add(e.category);
  });
  const categoriesList = Array.from(categoryNamesSet);

  const getBadgeStyle = (catName: string) => {
    const matched = ctxCategories.find(c => c.name.toLowerCase() === catName.toLowerCase());
    return getCategoryBadgeStyle(catName, matched?.color);
  };

  const statuses: (EventStatus | 'All')[] = [
    'All',
    'Planning',
    'Confirmed',
    'In Progress',
    'Completed'
  ];

  const filteredEvents = events.filter(evt => {
    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || evt.status === selectedStatus;
    const matchesSearch = 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleDelete = (e: React.MouseEvent, evt: EventItem) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${evt.title}"? This will remove all associated tasks and invoices.`)) {
      deleteEvent(evt.id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Events Registry</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              {currencyConfig.code} Display
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Oversee event schedules, client contracts, deliverables, and tech partner coordination.
          </p>
        </div>
        <button
          onClick={onOpenCreateEvent}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 via-indigo-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-cyan-500/20 flex items-center gap-1.5 self-start sm:self-auto transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events by title, client, venue..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-hidden text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                {statuses.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-2xs font-bold' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  viewMode === 'table' 
                    ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-2xs font-bold' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Category:</span>
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Display */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">No matching cyber events found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Try adjusting your search query or category filters, or create a new cyber event.
          </p>
          <button
            onClick={onOpenCreateEvent}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            Create Event
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const inHouseServices = evt.services.filter(s => s.sourcing === 'in_house');
            const vendorServices = evt.services.filter(s => s.sourcing === 'external_vendor');
            const totalCost = evt.services.reduce((sum, s) => sum + (s.actualCost || s.estimatedCost || 0), 0);
            const margin = evt.budget - totalCost;
            const marginPct = evt.budget > 0 ? (margin / evt.budget) * 100 : 0;

            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt.id)}
                className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(evt.category)}`}>
                      {evt.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {evt.status}
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, evt)}
                        title="Delete Event"
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Host: <span className="font-medium text-slate-700 dark:text-slate-300">{evt.clientName}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(evt.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{evt.venue || 'Venue TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{evt.guestCount} Attendees Expected</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5 font-mono">
                      Sourcing Breakdown
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        {inHouseServices.length} In-House Crew
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                        {vendorServices.length} Contracted Vendors
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer in Active Currency */}
                <div className="px-5 py-3.5 bg-slate-50/90 dark:bg-slate-950/85 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono transition-colors">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-sans font-medium">Contract Budget</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
                      {format(evt.budget)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-sans font-medium">Est. Profit Yield</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm tracking-tight">
                      {marginPct.toFixed(0)}% ({format(margin)})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">Event Title & Category</th>
                <th className="px-4 py-3 text-left">Host Client</th>
                <th className="px-4 py-3 text-left">Date & Venue</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Sourcing</th>
                <th className="px-4 py-3 text-right">Budget ({currencyConfig.code})</th>
                <th className="px-4 py-3 text-right">Gross Margin</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEvents.map(evt => {
                const inHouseServices = evt.services.filter(s => s.sourcing === 'in_house');
                const vendorServices = evt.services.filter(s => s.sourcing === 'external_vendor');
                const totalCost = evt.services.reduce((sum, s) => sum + (s.actualCost || s.estimatedCost || 0), 0);
                const margin = evt.budget - totalCost;

                return (
                  <tr 
                    key={evt.id}
                    onClick={() => onSelectEvent(evt.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{evt.title}</div>
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border mt-0.5 ${getBadgeStyle(evt.category)}`}>
                        {evt.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                      {evt.clientName}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      <div>{formatDate(evt.date)}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{evt.venue}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {evt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-[11px]">
                      {inHouseServices.length} in-house / {vendorServices.length} vendor
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {format(evt.budget)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {format(margin)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => handleDelete(e, evt)}
                          title="Delete event"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold text-xs flex items-center gap-0.5 ml-1">
                          Manage <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
