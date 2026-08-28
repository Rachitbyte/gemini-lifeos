import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Archive,
  Trash2,
  Edit3,
  Clock,
  X,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Goal, GoalStatus } from '../types';

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'uid' | 'createdAt'>) => Promise<void>;
  onUpdateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'uid'>>) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<GoalStatus>('active');
  const [deadline, setDeadline] = useState('');

  const statuses: { id: string; label: string }[] = [
    { id: 'all', label: 'All Goals' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'archived', label: 'Archived' },
  ];

  const filteredGoals = goals.filter((g) => {
    if (selectedStatus === 'all') return true;
    return g.status === selectedStatus;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onAddGoal({
      title: title.trim(),
      description: description.trim(),
      status,
      deadline: deadline || undefined,
    });

    setTitle('');
    setDescription('');
    setStatus('active');
    setDeadline('');
    setIsCreating(false);
  };

  const handleEditSave = async (id: string) => {
    if (!title.trim()) return;
    await onUpdateGoal(id, {
      title: title.trim(),
      description: description.trim(),
      status,
      deadline: deadline || undefined,
    });
    setEditingId(null);
  };

  const startEdit = (g: Goal) => {
    setEditingId(g.id);
    setTitle(g.title);
    setDescription(g.description);
    setStatus(g.status);
    setDeadline(g.deadline || '');
  };

  const handleToggleComplete = async (g: Goal) => {
    const nextStatus = g.status === 'completed' ? 'active' : 'completed';
    await onUpdateGoal(g.id, { status: nextStatus });
    if (nextStatus === 'completed') {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.7 },
      });
    }
  };

  const handleToggleArchive = async (g: Goal) => {
    const nextStatus = g.status === 'archived' ? 'active' : 'archived';
    await onUpdateGoal(g.id, { status: nextStatus });
  };

  return (
    <div className="flex-1 min-h-0 p-8 overflow-y-auto bg-transparent text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Target className="w-6 h-6 text-indigo-400" />
            Strategic Goals & Milestones
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
              {goals.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track key objectives, set deadlines, and align AI advice with your long-term vision.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
            setTitle('');
            setDescription('');
            setDeadline('');
            setStatus('active');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Filter status pills */}
      <div className="flex items-center gap-2">
        {statuses.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedStatus(s.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedStatus === s.id
                ? 'bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-500/20'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:bg-white/10'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Create Goal Card */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-5 rounded-2xl bg-white/5 border border-indigo-500/40 backdrop-blur-xl shadow-xl space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Define New Strategic Goal
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
                placeholder="Goal Title (e.g., Master TypeScript & Cloud Architecture)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                required
              />
            </div>
            <div>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Specific deliverables, success criteria, and motivations..."
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-400 resize-none"
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
              Save Goal
            </button>
          </div>
        </form>
      )}

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white/[0.02] rounded-2xl border border-white/5 backdrop-blur-md">
          <Target className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No goals found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create goals above or converse with Gemini to extract strategic milestones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((g) => {
            const isEditing = editingId === g.id;

            if (isEditing) {
              return (
                <div
                  key={g.id}
                  className="p-5 rounded-2xl bg-white/5 border border-indigo-500/50 backdrop-blur-xl space-y-3 shadow-lg"
                >
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-slate-300 focus:outline-none"
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                      onClick={() => handleEditSave(g.id)}
                      className="px-3 py-1 bg-indigo-500 text-white font-bold text-xs rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                </div>
              );
            }

            const isCompleted = g.status === 'completed';
            const isArchived = g.status === 'archived';

            return (
              <div
                key={g.id}
                className={`p-5 rounded-2xl border backdrop-blur-md flex flex-col justify-between space-y-4 group transition-all ${
                  isCompleted
                    ? 'bg-teal-500/10 border-teal-500/20'
                    : isArchived
                    ? 'bg-white/[0.02] border-white/5 opacity-50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border uppercase ${
                        isCompleted
                          ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                          : isArchived
                          ? 'bg-white/10 text-slate-400 border-white/10'
                          : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      {g.status}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleComplete(g)}
                        title={isCompleted ? 'Mark Active' : 'Mark Completed'}
                        className={`p-1 rounded ${
                          isCompleted
                            ? 'text-teal-400 hover:bg-white/10'
                            : 'text-slate-400 hover:text-teal-400 hover:bg-white/10'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleArchive(g)}
                        title={isArchived ? 'Unarchive' : 'Archive'}
                        className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-white/10"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => startEdit(g)}
                        title="Edit"
                        className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-white/10"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteGoal(g.id)}
                        title="Delete"
                        className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-white/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3
                    className={`text-sm font-bold transition-colors ${
                      isCompleted
                        ? 'text-slate-300 line-through'
                        : 'text-white group-hover:text-indigo-300'
                    }`}
                  >
                    {g.title}
                  </h3>

                  {g.description && (
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {g.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  {g.deadline ? (
                    <span className="flex items-center gap-1 text-indigo-300 font-medium">
                      <Clock className="w-3 h-3" /> Target: {g.deadline}
                    </span>
                  ) : (
                    <span>Flexible Timeline</span>
                  )}
                  <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
