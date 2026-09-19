import React, { useState } from 'react';
import { 
  Tags, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Calendar, 
  DollarSign, 
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { CategoryItem } from '../types';
import { useEventContext } from '../context/EventContext';
import { useCurrency } from '../context/CurrencyContext';

export const CategoriesView: React.FC = () => {
  const { categories, events, addCategory, updateCategory, deleteCategory } = useEventContext();
  const { format, currencyConfig } = useCurrency();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  
  // New state to prevent double clicks and show loading
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('cyan');
  const [icon, setIcon] = useState('Shield');

  const availableColors = [
    { label: 'Cyan / Cyber Blue', value: 'cyan', bgClass: 'bg-cyan-500' },
    { label: 'Violet / Neural Purple', value: 'purple', bgClass: 'bg-purple-500' },
    { label: 'Emerald / Green', value: 'emerald', bgClass: 'bg-emerald-500' },
    { label: 'Amber / Orange', value: 'amber', bgClass: 'bg-amber-500' },
    { label: 'Indigo / Deep Blue', value: 'indigo', bgClass: 'bg-indigo-500' },
    { label: 'Rose / Crimson', value: 'rose', bgClass: 'bg-rose-500' }
  ];

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setColor('cyan');
    setIcon('Shield');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setColor(cat.color);
    setIcon(cat.icon || 'Shield');
    setIsModalOpen(true);
  };

  // ✅ FIXED: Added async/await for Supabase Sync
  const handleDelete = async (cat: CategoryItem) => {
    const associatedEvents = events.filter(e => e.category === cat.name);
    
    if (associatedEvents.length > 0) {
      if (!window.confirm(`There are ${associatedEvents.length} event(s) using category "${cat.name}". Are you sure you want to delete it?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
        return;
      }
    }
    
    await deleteCategory(cat.id);
  };

  // ✅ FIXED: Added async/await and isSaving state
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: name.trim(),
          description: description.trim(),
          color,
          icon
        });
      } else {
        await addCategory({
          name: name.trim(),
          description: description.trim(),
          color,
          icon
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Event Taxonomy & Categories</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              {categories.length} Production Classifications
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Define classifications, technical parameters, and color coding. Everything is editable and deletable.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 via-indigo-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-cyan-500/20 flex items-center gap-1.5 self-start sm:self-auto transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const associatedEvents = events.filter(e => e.category === cat.name);
          const totalCategoryBudget = associatedEvents.reduce((sum, e) => sum + e.budget, 0);

          return (
            <div
              key={cat.id}
              className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3.5 h-3.5 rounded-full ${
                      cat.color === 'cyan' ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' :
                      cat.color === 'purple' ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' :
                      cat.color === 'emerald' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' :
                      cat.color === 'amber' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' :
                      cat.color === 'indigo' ? 'bg-indigo-500 shadow-[0_0_10px_#6366f1]' :
                      'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
                    }`} />
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {cat.name}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {associatedEvents.length} {associatedEvents.length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px]">
                  {cat.description || 'Custom technical production scope and operational staging standard.'}
                </p>

                {/* Metrics */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-sans">Total Pipeline Contract:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {format(totalCategoryBudget)}
                  </span>
                </div>

                {/* Event titles quick list */}
                {associatedEvents.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block font-mono">
                      Associated Summits
                    </span>
                    {associatedEvents.slice(0, 2).map(ev => (
                      <div key={ev.id} className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                        &bull; {ev.title}
                      </div>
                    ))}
                    {associatedEvents.length > 2 && (
                      <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
                        +{associatedEvents.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons: Delete and Edit */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(cat)}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="px-3 py-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Category</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tags className="w-5 h-5 text-cyan-500" />
                <span>{editingCategory ? 'Edit Category' : 'Create New Category'}</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AI Hackathon & DevFest"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Color Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableColors.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs transition-all cursor-pointer ${
                        color === c.value
                          ? 'border-cyan-500 bg-cyan-500/10 font-bold text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${c.bgClass}`} />
                      <span className="truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Description & Scope</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 48-hour continuous coding hackathons, multi-rack cloud servers, and GPU clusters."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2 min-w-[120px]"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    editingCategory ? 'Save Changes' : 'Create Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};