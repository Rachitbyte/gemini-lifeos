import React, { useState } from 'react';
import {
  Brain,
  Plus,
  Search,
  Trash2,
  Edit3,
  Sparkles,
  Tag,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import type { Memory, MemoryCategory } from '../types';

interface MemoriesViewProps {
  memories: Memory[];
  onAddMemory: (memory: Omit<Memory, 'id' | 'uid' | 'createdAt'>) => Promise<void>;
  onUpdateMemory: (id: string, updates: Partial<Omit<Memory, 'id' | 'uid'>>) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
}

export const MemoriesView: React.FC<MemoriesViewProps> = ({
  memories,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('personal');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'personal', label: 'Personal' },
    { id: 'work', label: 'Work' },
    { id: 'education', label: 'Education' },
    { id: 'project', label: 'Project' },
    { id: 'idea', label: 'Idea' },
    { id: 'preference', label: 'Preference' },
    { id: 'other', label: 'Other' },
  ];

  const filteredMemories = memories.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await onAddMemory({
      title: title.trim(),
      content: content.trim(),
      category,
    });

    setTitle('');
    setContent('');
    setCategory('personal');
    setIsCreating(false);
  };

  const handleEditSave = async (id: string) => {
    if (!title.trim() || !content.trim()) return;
    await onUpdateMemory(id, {
      title: title.trim(),
      content: content.trim(),
      category,
    });
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const startEdit = (m: Memory) => {
    setEditingId(m.id);
    setTitle(m.title);
    setContent(m.content);
    setCategory(m.category);
  };

  const getCategoryBadgeClass = (cat: MemoryCategory) => {
    switch (cat) {
      case 'personal':
        return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
      case 'work':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'education':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'project':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'idea':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'preference':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="flex-1 min-h-0 p-8 overflow-y-auto bg-transparent text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Brain className="w-6 h-6 text-teal-400" />
            Approved Memories & Context
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-mono">
              {memories.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Durable knowledge approved by you to help Gemini understand your life, work, and preferences.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
            setTitle('');
            setContent('');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Memory</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:bg-white/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      {/* Add Memory Modal/Form Card */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-5 rounded-2xl bg-white/5 border border-indigo-500/40 backdrop-blur-xl shadow-xl space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Create New Memory
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Memory Title (e.g., Prefers async communication)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                required
              />
            </div>
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 capitalize focus:outline-none focus:border-indigo-400"
              >
                {categories.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Detailed memory content, facts, rules, or personal context..."
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-400 resize-none"
            required
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
            >
              Save Memory
            </button>
          </div>
        </form>
      )}

      {/* Memories Grid */}
      {filteredMemories.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white/[0.02] rounded-2xl border border-white/5 backdrop-blur-md">
          <Brain className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No memories found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Extract memories seamlessly through conversations in the AI Workspace or manually add them above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMemories.map((mem) => {
            const isEditing = editingId === mem.id;

            if (isEditing) {
              return (
                <div
                  key={mem.id}
                  className="p-5 rounded-2xl bg-white/5 border border-indigo-500/50 backdrop-blur-xl space-y-3 shadow-lg"
                >
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-slate-300 capitalize"
                  >
                    {categories.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white resize-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditSave(mem.id)}
                      className="px-3 py-1 bg-indigo-500 text-white font-bold text-xs rounded-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={mem.id}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 backdrop-blur-md flex flex-col justify-between space-y-4 group transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border capitalize ${getCategoryBadgeClass(
                        mem.category
                      )}`}
                    >
                      {mem.category}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(mem)}
                        title="Edit Memory"
                        className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-white/10"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMemory(mem.id)}
                        title="Delete Memory"
                        className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-white/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                    {mem.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-4">
                    {mem.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(mem.createdAt).toLocaleDateString()}
                  </span>
                  {mem.sourceConversationId && (
                    <span className="text-indigo-300/80">From Chat</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
