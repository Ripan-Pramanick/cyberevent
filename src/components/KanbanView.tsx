import React, { useState } from 'react';
import { 
  Trello, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  X,
  Clock,
  Filter,
  GripVertical
} from 'lucide-react';
import { KanbanTask, TaskStatus, TaskPriority } from '../types';
import { useEventContext } from '../context/EventContext';
import { formatDate } from '../utils/formatters';

const COLUMNS: { id: TaskStatus; title: string; color: string; border: string; accentColor: string }[] = [
  { id: 'Backlog', title: 'Sprint Backlog', color: 'bg-slate-500/10 text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700', accentColor: 'text-slate-500' },
  { id: 'In Progress', title: 'Active Production', color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300', border: 'border-cyan-500/30', accentColor: 'text-cyan-500' },
  { id: 'Technical Review', title: 'Tech Rigging & Review', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300', border: 'border-amber-500/30', accentColor: 'text-amber-500' },
  { id: 'Completed', title: 'Verified / Complete', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500/30', accentColor: 'text-emerald-500' }
];

export const KanbanView: React.FC = () => {
  const { kanbanTasks, events, addKanbanTask, updateKanbanTask, deleteKanbanTask, moveKanbanTask } = useEventContext();

  const [selectedEventId, setSelectedEventId] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);

  // Drag & Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventId, setEventId] = useState(events[0]?.id || '');
  const [status, setStatus] = useState<TaskStatus>('Backlog');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignedTo, setAssignedTo] = useState('');

  const filteredTasks = kanbanTasks.filter(t => 
    selectedEventId === 'All' || t.eventId === selectedEventId
  );

  const handleOpenAdd = (colStatus: TaskStatus = 'Backlog') => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setEventId(events[0]?.id || '');
    setStatus(colStatus);
    setPriority('Medium');
    setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setAssignedTo('Production Crew');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: KanbanTask) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setEventId(task.eventId);
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setAssignedTo(task.assignedTo || '');
    setIsModalOpen(true);
  };

  const handleDelete = (task: KanbanTask) => {
    if (window.confirm(`Delete task "${task.title}"?`)) {
      deleteKanbanTask(task.id);
    }
  };

  const handleMoveColumn = (task: KanbanTask, direction: 'prev' | 'next') => {
    const colOrder: TaskStatus[] = ['Backlog', 'In Progress', 'Technical Review', 'Completed'];
    const currentIndex = colOrder.indexOf(task.status);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < colOrder.length) {
      moveKanbanTask(task.id, colOrder[nextIndex]);
    }
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: TaskStatus) => {
    // Only reset if leaving the column element itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverCol === colId) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveKanbanTask(taskId, colId);
    }
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const eventObj = events.find(e => e.id === eventId);
    const eventTitle = eventObj ? eventObj.title : 'General Cyber Operation';

    if (editingTask) {
      updateKanbanTask(editingTask.id, {
        title,
        description,
        eventId,
        eventTitle,
        status,
        priority,
        dueDate,
        assignedTo
      });
    } else {
      addKanbanTask({
        title,
        description,
        eventId,
        eventTitle,
        status,
        priority,
        dueDate,
        assignedTo,
        serviceCategory: 'Audio, Visual & Lights',
        sourcing: 'in_house'
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Production Sprints & Tasks</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              {kanbanTasks.length} Deliverable Workflows
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Drag and drop cards across production lanes, assign crew leads, and coordinate deliverable sign-offs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="All">All Active Events</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => handleOpenAdd('Backlog')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Board Columns Grid with Drag and Drop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {COLUMNS.map(column => {
          const tasksInCol = filteredTasks.filter(t => t.status === column.id);
          const isOver = dragOverCol === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={(e) => handleDragLeave(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`rounded-2xl border flex flex-col max-h-[calc(100vh-220px)] shadow-xs transition-all duration-200 ${
                isOver 
                  ? 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/40' 
                  : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                    {column.title}
                  </h3>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${column.color}`}>
                    {tasksInCol.length}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenAdd(column.id)}
                  className="p-1 text-slate-400 hover:text-cyan-600 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={`Add task to ${column.title}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="p-3 overflow-y-auto space-y-3 flex-1 min-h-[160px]">
                {tasksInCol.length === 0 && !isOver ? (
                  <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs italic">
                    Drag tasks here
                  </div>
                ) : (
                  tasksInCol.map(task => {
                    const isDragging = draggedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white dark:bg-slate-800/90 rounded-xl p-3.5 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-cyan-500/50 transition-all space-y-2.5 group cursor-grab active:cursor-grabbing ${
                          isDragging ? 'opacity-40 border-dashed border-cyan-500 scale-95 shadow-none' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors" />
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                              task.priority === 'Urgent' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30' :
                              task.priority === 'High' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                              task.priority === 'Medium' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            }`}>
                              {task.priority}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(task)}
                              className="text-slate-400 hover:text-cyan-600 p-0.5 rounded cursor-pointer"
                              title="Edit task"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(task)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1 text-[11px]">
                          <div className="text-cyan-600 dark:text-cyan-400 font-semibold truncate">
                            {task.eventTitle}
                          </div>
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1 font-mono text-[10px]">
                              <Clock className="w-3 h-3" />
                              {formatDate(task.dueDate)}
                            </span>
                            <span className="font-medium text-slate-700 dark:text-slate-300 text-[10px]">
                              {task.assignedTo || 'Unassigned'}
                            </span>
                          </div>
                        </div>

                        {/* Fast Column Navigation Controls */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                          <button
                            disabled={column.id === 'Backlog'}
                            onClick={() => handleMoveColumn(task, 'prev')}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors cursor-pointer"
                            title="Move to previous column"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>

                          <select
                            value={task.status}
                            onChange={(e) => moveKanbanTask(task.id, e.target.value as TaskStatus)}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            <option value="Backlog">Backlog</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Technical Review">Tech Review</option>
                            <option value="Completed">Completed</option>
                          </select>

                          <button
                            disabled={column.id === 'Completed'}
                            onClick={() => handleMoveColumn(task, 'next')}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors cursor-pointer"
                            title="Move to next column"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Drop Placeholder Slot */}
                {isOver && (
                  <div className="h-16 rounded-xl border-2 border-dashed border-cyan-500/70 bg-cyan-500/10 flex items-center justify-center text-xs font-bold text-cyan-600 dark:text-cyan-400 animate-pulse">
                    Drop task here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trello className="w-5 h-5 text-cyan-500" />
                {editingTask ? 'Edit Task' : 'Create New Sprint Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Rig Curved LED Mainwall & Run Video Signal Test"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Specifications
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Technical details, load-in guidelines, or vendor contacts..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Column *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Backlog">Sprint Backlog</option>
                    <option value="In Progress">Active Production</option>
                    <option value="Technical Review">Tech Rigging & Review</option>
                    <option value="Completed">Verified / Complete</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent (Critical Path)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deadline Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assignee / Crew Lead
                </label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g. Elena Rostova or Cyber NetOps Crew"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  {editingTask ? 'Save Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
