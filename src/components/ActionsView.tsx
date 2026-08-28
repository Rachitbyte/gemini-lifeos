import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit3,
  Calendar,
  X,
  Target,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ActionItem, ActionStatus, Goal } from '../types';

interface ActionsViewProps {
  actions: ActionItem[];
  goals: Goal[];
  onAddAction: (action: Omit<ActionItem, 'id' | 'uid' | 'createdAt'>) => Promise<void>;
  onUpdateAction: (id: string, updates: Partial<Omit<ActionItem, 'id' | 'uid'>>) => Promise<void>;
  onDeleteAction: (id: string) => Promise<void>;
}

export const ActionsView: React.FC<ActionsViewProps> = ({
  actions,
  goals,
  onAddAction,
  onUpdateAction,
  onDeleteAction,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ActionStatus>('pending');
  const [dueDate, setDueDate] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState('');

  const statuses: { id: string; label: string }[] = [
    { id: 'all', label: 'All Actions' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
    { id: 'dismissed', label: 'Dismissed' },
  ];

  const filteredActions = actions.filter((a) => {
    if (selectedStatus === 'all') return true;
    return a.status === selectedStatus;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedGoal = goals.find((g) => g.id === selectedGoalId);

    await onAddAction({
      title: title.trim(),
      description: description.trim(),
      status,
      dueDate: dueDate || undefined,
      goalId: selectedGoalId || undefined,
      goalTitle: matchedGoal?.title || undefined,
    });

    setTitle('');
    setDescription('');
    setStatus('pending');
    setDueDate('');
    setSelectedGoalId('');
    setIsCreating(false);
  };

  const handleEditSave = async (id: string) => {
    if (!title.trim()) return;
    const matchedGoal = goals.find((g) => g.id === selectedGoalId);

    await onUpdateAction(id, {
      title: title.trim(),
      description: description.trim(),
      status,
      dueDate: dueDate || undefined,
      goalId: selectedGoalId || undefined,
      goalTitle: matchedGoal?.title || undefined,
    });
    setEditingId(null);
  };

  const startEdit = (a: ActionItem) => {
    setEditingId(a.id);
    setTitle(a.title);
    setDescription(a.description);
    setStatus(a.status);
    setDueDate(a.dueDate || '');
    setSelectedGoalId(a.goalId || '');
  };

  const handleToggleComplete = async (a: ActionItem) => {
    const nextStatus = a.status === 'completed' ? 'pending' : 'completed';
    await onUpdateAction(a.id, { status: nextStatus });
    if (nextStatus === 'completed') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const handleDismiss = async (a: ActionItem) => {
    const nextStatus = a.status === 'dismissed' ? 'pending' : 'dismissed';
    await onUpdateAction(a.id, { status: nextStatus });
  };

  return (
    <div className="flex-1 min-h-0 p-8 overflow-y-auto bg-transparent text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-teal-400" />
            Execution Action Items
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-mono">
              {actions.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Concrete tasks derived from Gemini discussions and linked to your strategic goals.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
            setTitle('');
            setDescription('');
            setDueDate('');
            setSelectedGoalId('');
            setStatus('pending');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Action</span>
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

      {/* Create Action Card */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-5 rounded-2xl bg-white/5 border border-indigo-500/40 backdrop-blur-xl shadow-xl space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Create Action Item
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
                placeholder="Action Title (e.g., Deploy backend service to Cloud Run)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                required
              />
            </div>
            <div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-400"
              >
                <option value="">-- Associate with Goal (Optional) --</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional task notes..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

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
              Save Action
            </button>
          </div>
        </form>
      )}

      {/* Actions List */}
      {filteredActions.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white/[0.02] rounded-2xl border border-white/5 backdrop-blur-md">
          <CheckSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No actions found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add task items above or let Gemini identify next action steps during AI Workspace sessions.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActions.map((act) => {
            const isEditing = editingId === act.id;

            if (isEditing) {
              return (
                <div
                  key={act.id}
                  className="p-4 rounded-2xl bg-white/5 border border-indigo-500/50 backdrop-blur-xl space-y-3 shadow-lg"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="sm:col-span-2 bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                    />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-slate-300"
                    />
                  </div>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Task details"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditSave(act.id)}
                      className="px-3 py-1 bg-indigo-500 text-white font-bold text-xs rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                </div>
              );
            }

            const isCompleted = act.status === 'completed';
            const isDismissed = act.status === 'dismissed';

            return (
              <div
                key={act.id}
                className={`p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between gap-4 group transition-all ${
                  isCompleted
                    ? 'bg-teal-500/10 border-teal-500/20'
                    : isDismissed
                    ? 'bg-white/[0.02] border-white/5 opacity-50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleComplete(act)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                      isCompleted
                        ? 'bg-teal-500 border-teal-400 text-slate-950'
                        : 'bg-white/10 border-white/20 hover:border-teal-400'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isCompleted
                            ? 'text-slate-400 line-through'
                            : isDismissed
                            ? 'text-slate-500 line-through'
                            : 'text-white group-hover:text-teal-300'
                        }`}
                      >
                        {act.title}
                      </p>
                      {act.goalTitle && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 truncate max-w-[140px]">
                          {act.goalTitle}
                        </span>
                      )}
                    </div>
                    {act.description && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{act.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {act.dueDate && (
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {act.dueDate}
                    </span>
                  )}

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDismiss(act)}
                      title={isDismissed ? 'Reactivate' : 'Dismiss'}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/10"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => startEdit(act)}
                      title="Edit"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-white/10"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteAction(act.id)}
                      title="Delete"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
