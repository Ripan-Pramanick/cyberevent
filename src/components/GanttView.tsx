import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  CheckCircle2, 
  X, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Sparkles,
  Building2,
  Users
} from 'lucide-react';
import { GanttTask, SourcingType } from '../types';
import { useEventContext } from '../context/EventContext';
import { formatDate } from '../utils/formatters';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export const GanttView: React.FC = () => {
  const { ganttTasks, events, addGanttTask, updateGanttTask, deleteGanttTask } = useEventContext();

  const [selectedEventId, setSelectedEventId] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<GanttTask | null>(null);

  // Active viewing month (defaults to September 2026 to match image.png)
  const [viewYear, setViewYear] = useState<number>(2026);
  const [viewMonth, setViewMonth] = useState<number>(8); // 0-indexed: 8 = September

  // Form State for Adding / Editing
  const [title, setTitle] = useState('');
  const [eventId, setEventId] = useState(events[0]?.id || '');
  const [sourcing, setSourcing] = useState<SourcingType>('external_vendor');
  const [startDate, setStartDate] = useState('2026-09-10');
  const [endDate, setEndDate] = useState('2026-09-16');
  const [progress, setProgress] = useState(50);
  const [status, setStatus] = useState<GanttTask['status']>('In Progress');
  const [owner, setOwner] = useState('Production Crew');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0.35);

  // Generate days in current month
  const daysInMonth = useMemo(() => {
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days = [];
    const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const dayOfWeek = date.getDay();
      days.push({
        dayNum: d,
        dateStr: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        dayLetter: dayLetters[dayOfWeek],
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isToday: viewYear === 2026 && viewMonth === 8 && d === 17 // Day 17 T in September 2026 is today in screenshot
      });
    }
    return days;
  }, [viewYear, viewMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter tasks based on selected event
  const filteredTasks = useMemo(() => {
    return ganttTasks.filter(t => 
      selectedEventId === 'All' || t.eventId === selectedEventId
    );
  }, [ganttTasks, selectedEventId]);

  // Initial horizontal scroll alignment to day 8 so days 8 - 30 are visible as in image.png
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Day 8 offset approx (7 * 46px = 322px)
      scrollContainerRef.current.scrollLeft = 320;
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const maxScroll = target.scrollWidth - target.clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(target.scrollLeft / maxScroll);
    }
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setViewYear(2026);
    setViewMonth(8); // September
    if (scrollContainerRef.current) {
      // Scroll to day 17
      scrollContainerRef.current.scrollTo({ left: 14 * 46, behavior: 'smooth' });
    }
  };

  const handleOpenAdd = () => {
    setEditingTask(null);
    setTitle('');
    setEventId(events[0]?.id || '');
    setSourcing('external_vendor');
    setStartDate('2026-09-10');
    setEndDate('2026-09-16');
    setProgress(50);
    setStatus('In Progress');
    setOwner('Production Rigging Crew');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: GanttTask) => {
    setEditingTask(task);
    setTitle(task.title);
    setEventId(task.eventId);
    setSourcing(task.sourcing || 'external_vendor');
    setStartDate(task.startDate);
    setEndDate(task.endDate);
    setProgress(task.progress);
    setStatus(task.status);
    setOwner(task.owner || task.assignee || 'Production Crew');
    setIsModalOpen(true);
  };

  const handleDelete = (task: GanttTask, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete milestone "${task.title}"?`)) {
      deleteGanttTask(task.id);
    }
  };

  const handleQuickProgress = (taskId: string, newProgress: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const clamped = Math.max(0, Math.min(100, newProgress));
    const newStatus = clamped === 100 ? 'Completed' : clamped > 0 ? 'In Progress' : 'Not Started';
    updateGanttTask(taskId, { progress: clamped, status: newStatus });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const eventObj = events.find(e => e.id === eventId);
    const eventTitle = eventObj ? eventObj.title : 'Claire & Julian Wedding';

    const color = sourcing === 'in_house' ? '#10b981' : '#6366f1';

    if (editingTask) {
      updateGanttTask(editingTask.id, {
        title,
        eventId,
        eventTitle,
        startDate,
        endDate,
        progress: Number(progress),
        status,
        sourcing,
        owner,
        assignee: owner,
        color
      });
    } else {
      addGanttTask({
        title,
        eventId,
        eventTitle,
        startDate,
        endDate,
        progress: Number(progress),
        status,
        sourcing,
        owner,
        assignee: owner,
        color,
        category: 'Milestone'
      });
    }
    setIsModalOpen(false);
  };

  // Helper to format date cleanly: "Sep 10, 2026"
  const formatShortRange = (startStr: string, endStr: string) => {
    try {
      const s = new Date(startStr);
      const e = new Date(endStr);
      const sMonth = s.toLocaleString('default', { month: 'short' });
      const eMonth = e.toLocaleString('default', { month: 'short' });
      const sDay = s.getDate();
      const eDay = e.getDate();
      const year = s.getFullYear();

      return `${sMonth} ${sDay}, ${year} → ${eMonth} ${eDay}, ${e.getFullYear()}`;
    } catch {
      return `${startStr} → ${endStr}`;
    }
  };

  const colWidth = 46; // width in pixels of each day column

  return (
    <div className="space-y-5 pb-14">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Production Milestones & Gantt Timeline</span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold">
              {filteredTasks.length} Milestones
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronized stage rigging, catering tasting signoffs, ambient lighting, and execution windows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Navigation */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold font-mono px-2 text-slate-800 dark:text-slate-200 whitespace-nowrap min-w-[125px] text-center">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpToToday}
            className="text-xs font-bold h-9"
          >
            Jump to Today
          </Button>

          {/* Event Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="h-9 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Events</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleOpenAdd}
            className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </Button>
        </div>
      </div>

      {/* Main Gantt Card - Matched 1:1 to image.png */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="flex overflow-hidden">
          {/* Left Column: Task & Production Milestone Table */}
          <div className="w-[340px] sm:w-[380px] lg:w-[410px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex flex-col">
            {/* Header */}
            <div className="h-[62px] px-5 flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-tight">
                Task & Production Milestone
              </span>
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic">
                  No milestones found.
                </div>
              ) : (
                filteredTasks.map(task => {
                  const isVendor = task.sourcing === 'external_vendor' || (!task.sourcing && task.assignee?.includes('Vendor'));
                  
                  return (
                    <div
                      key={task.id}
                      className="h-[88px] px-5 py-3 flex flex-col justify-between group hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors relative"
                    >
                      {/* Line 1: Title & Pill Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span 
                          onClick={() => handleOpenEdit(task)}
                          className="font-bold text-slate-900 dark:text-white text-[13px] tracking-tight truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                          title={task.title}
                        >
                          {task.title}
                        </span>

                        {isVendor ? (
                          <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/70">
                            Vendor
                          </span>
                        ) : (
                          <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70">
                            In-House
                          </span>
                        )}
                      </div>

                      {/* Line 2: Event Title & Date Range */}
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium truncate text-[11px] hover:underline cursor-pointer">
                          {task.eventTitle}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] font-normal whitespace-nowrap">
                          {formatShortRange(task.startDate, task.endDate)}
                        </span>
                      </div>

                      {/* Line 3: Progress percentage, bar, +25% stepper, and completion icon */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-8 font-mono">
                          {task.progress}%
                        </span>

                        {/* Progress track */}
                        <div className="h-2 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isVendor ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-emerald-500 dark:bg-emerald-400'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>

                        {/* Quick Action Steppers */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => handleQuickProgress(task.id, task.progress + 25 > 100 ? 0 : task.progress + 25, e)}
                            className="text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Increment progress by 25%"
                          >
                            +25%
                          </button>

                          <button
                            onClick={(e) => handleQuickProgress(task.id, 100, e)}
                            className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 p-0.5 transition-transform hover:scale-110 cursor-pointer"
                            title="Mark 100% complete"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          {/* Action icons shown on hover */}
                          <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                            <button
                              onClick={() => handleOpenEdit(task)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                              title="Edit milestone"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(task, e)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Delete milestone"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Scrollable Calendar Grid */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-x-auto relative"
          >
            <div style={{ width: `${daysInMonth.length * colWidth}px` }} className="relative select-none">
              {/* Header: Day Numbers and Day of Week Letters */}
              <div className="h-[62px] border-b border-slate-200 dark:border-slate-800 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-20">
                {/* Days row */}
                <div className="flex h-full">
                  {daysInMonth.map((day) => {
                    return (
                      <div
                        key={day.dayNum}
                        style={{ width: `${colWidth}px` }}
                        className={`h-full shrink-0 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800/80 transition-colors ${
                          day.isToday 
                            ? 'bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold' 
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className={`text-[12px] leading-tight ${day.isToday ? 'font-black text-indigo-700 dark:text-indigo-300' : 'font-semibold'}`}>
                          {day.dayNum}
                        </span>
                        <span className={`text-[10px] uppercase mt-0.5 ${day.isToday ? 'font-bold text-indigo-700 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500'}`}>
                          {day.dayLetter}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Scrubber indicator bar underneath dates (matching screenshot) */}
                <div className="w-full px-2 pb-1">
                  <div className="h-1.5 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full relative overflow-hidden">
                    <div 
                      className="h-full bg-slate-400/80 dark:bg-slate-500 rounded-full transition-all duration-150"
                      style={{ 
                        width: '35%', 
                        marginLeft: `${scrollProgress * 65}%` 
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Grid Body Rows */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 relative">
                {/* Vertical Today line guideline indicator */}
                {daysInMonth.map((day, idx) => {
                  if (!day.isToday) return null;
                  return (
                    <div
                      key={`today-col-${idx}`}
                      style={{ 
                        left: `${idx * colWidth}px`, 
                        width: `${colWidth}px` 
                      }}
                      className="absolute top-0 bottom-0 bg-indigo-500/5 dark:bg-indigo-500/10 pointer-events-none z-0"
                    />
                  );
                })}

                {/* Vertical column lines background */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {daysInMonth.map((day) => (
                    <div
                      key={`grid-line-${day.dayNum}`}
                      style={{ width: `${colWidth}px` }}
                      className="h-full shrink-0 border-r border-slate-100 dark:border-slate-800/80"
                    />
                  ))}
                </div>

                {/* Milestone Bars */}
                {filteredTasks.map((task) => {
                  const isVendor = task.sourcing === 'external_vendor' || (!task.sourcing && task.assignee?.includes('Vendor'));

                  // Calculate start and end day index in currently viewed month
                  const sDate = new Date(task.startDate);
                  const eDate = new Date(task.endDate);

                  let startIdx = 0;
                  let endIdx = 0;

                  // Compute day of month index
                  if (sDate.getFullYear() === viewYear && sDate.getMonth() === viewMonth) {
                    startIdx = sDate.getDate() - 1;
                  } else if (sDate < new Date(viewYear, viewMonth, 1)) {
                    startIdx = 0; // Starts prior to this month
                  } else {
                    startIdx = daysInMonth.length - 1; // Future
                  }

                  if (eDate.getFullYear() === viewYear && eDate.getMonth() === viewMonth) {
                    endIdx = eDate.getDate() - 1;
                  } else if (eDate > new Date(viewYear, viewMonth + 1, 0)) {
                    endIdx = daysInMonth.length - 1; // Spills into next month
                  } else if (eDate < new Date(viewYear, viewMonth, 1)) {
                    endIdx = 0;
                  } else {
                    endIdx = startIdx;
                  }

                  // Clamp indices
                  const validStart = Math.max(0, Math.min(daysInMonth.length - 1, startIdx));
                  const validEnd = Math.max(validStart, Math.min(daysInMonth.length - 1, endIdx));
                  const spanDays = Math.max(1, validEnd - validStart + 1);

                  // Calculate capsule layout
                  const leftPos = validStart * colWidth + 4;
                  const barWidth = spanDays * colWidth - 8;

                  // 0% Progress look (as seen in row 4 and row 7 of screenshot)
                  const isZeroProgress = task.progress === 0;

                  return (
                    <div
                      key={`grid-row-${task.id}`}
                      className="h-[88px] relative flex items-center z-10"
                    >
                      {isZeroProgress ? (
                        /* Compact 0% Capsule Badge */
                        <div
                          style={{
                            left: `${leftPos}px`,
                            minWidth: '46px'
                          }}
                          onClick={() => handleOpenEdit(task)}
                          className={`absolute h-8 px-2.5 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs cursor-pointer transition-transform hover:scale-105 select-none ${
                            isVendor 
                              ? 'bg-indigo-600 hover:bg-indigo-500' 
                              : 'bg-emerald-600 hover:bg-emerald-500'
                          }`}
                          title={`${task.title} (0%) - Starts ${task.startDate}`}
                        >
                          0%
                        </div>
                      ) : (
                        /* Multi-day Capsule with Dual Tone Progress Fill */
                        <div
                          style={{
                            left: `${leftPos}px`,
                            width: `${Math.max(barWidth, 60)}px`
                          }}
                          onClick={() => handleOpenEdit(task)}
                          className={`absolute h-[38px] rounded-xl overflow-hidden shadow-xs cursor-pointer transition-all hover:brightness-105 select-none ${
                            isVendor 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-emerald-600 text-white'
                          }`}
                          title={`${task.title} - ${task.progress}% Complete (${task.startDate} to ${task.endDate})`}
                        >
                          {/* Darker Filled Progress Portion on Left */}
                          <div
                            className={`h-full transition-all duration-300 ${
                              isVendor ? 'bg-indigo-700/90' : 'bg-emerald-700/90'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />

                          {/* Centered / Text Content inside pill */}
                          <div className="absolute inset-0 px-3 flex items-center justify-between text-xs font-bold text-white pointer-events-none truncate">
                            <span className="truncate pr-2 drop-shadow-xs">
                              {task.title}
                            </span>
                            <span className="font-mono text-[11px] shrink-0 font-extrabold ml-1">
                              {task.progress}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Milestone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{editingTask ? 'Edit Milestone' : 'New Production Milestone'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Floral Canopy Architecture & Rigging"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Event *
                  </label>
                  <select
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    {events.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sourcing Type *
                  </label>
                  <select
                    value={sourcing}
                    onChange={(e) => setSourcing(e.target.value as SourcingType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="external_vendor">Vendor (Purple Capsule)</option>
                    <option value="in_house">In-House (Emerald Capsule)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Completion Progress
                  </label>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {progress}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>0% (Not Started)</span>
                  <span>50% (Mid-flight)</span>
                  <span>100% (Signed Off)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Owner / Crew
                  </label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="e.g. Neon Matrix Botanical Crew"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as GanttTask['status'])}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  {editingTask ? 'Save Milestone Changes' : 'Create Milestone'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
