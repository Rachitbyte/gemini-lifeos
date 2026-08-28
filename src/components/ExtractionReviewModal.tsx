import React, { useState } from 'react';
import {
  Brain,
  Target,
  CheckSquare,
  Check,
  X,
  Sparkles,
  AlertCircle,
  Save,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type {
  ExtractionResult,
  ExtractedMemoryProposal,
  ExtractedGoalProposal,
  ExtractedActionProposal,
  MemoryCategory,
} from '../types';

interface ExtractionReviewModalProps {
  extraction: ExtractionResult;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (approved: {
    memories: ExtractedMemoryProposal[];
    goals: ExtractedGoalProposal[];
    actions: ExtractedActionProposal[];
  }) => Promise<void>;
}

export const ExtractionReviewModal: React.FC<ExtractionReviewModalProps> = ({
  extraction,
  isOpen,
  onClose,
  onApprove,
}) => {
  const [memories, setMemories] = useState<ExtractedMemoryProposal[]>(() =>
    extraction.memories.map((m) => ({ ...m, approved: true }))
  );
  const [goals, setGoals] = useState<ExtractedGoalProposal[]>(() =>
    extraction.goals.map((g) => ({ ...g, approved: true }))
  );
  const [actions, setActions] = useState<ExtractedActionProposal[]>(() =>
    extraction.actions.map((a) => ({ ...a, approved: true }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update internal state when extraction prop changes
  React.useEffect(() => {
    setMemories(extraction.memories.map((m) => ({ ...m, approved: true })));
    setGoals(extraction.goals.map((g) => ({ ...g, approved: true })));
    setActions(extraction.actions.map((a) => ({ ...a, approved: true })));
  }, [extraction]);

  if (!isOpen) return null;

  const totalItems = memories.length + goals.length + actions.length;
  const approvedCount =
    memories.filter((m) => m.approved).length +
    goals.filter((g) => g.approved).length +
    actions.filter((a) => a.approved).length;

  const handleSaveApproved = async () => {
    try {
      setIsSubmitting(true);
      await onApprove({
        memories: memories.filter((m) => m.approved),
        goals: goals.filter((g) => g.approved),
        actions: actions.filter((a) => a.approved),
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: MemoryCategory[] = [
    'personal',
    'work',
    'education',
    'project',
    'idea',
    'preference',
    'other',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Review Extracted Knowledge
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  {approvedCount} of {totalItems} Selected
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Gemini identified potential personal items. Only approved items will be committed to your Firestore database.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Items */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-200">
          {totalItems === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-500" />
              <p>No actionable memories, goals, or tasks were detected in the recent conversation.</p>
            </div>
          ) : null}

          {/* Memories Section */}
          {memories.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-300">
                <Brain className="w-4 h-4" />
                <span>Memories & Context ({memories.length})</span>
              </div>
              <div className="space-y-3">
                {memories.map((mem, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      mem.approved
                        ? 'bg-white/5 border-teal-500/30 shadow-sm'
                        : 'bg-white/[0.02] border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <input
                        type="text"
                        value={mem.title}
                        onChange={(e) => {
                          const copy = [...memories];
                          copy[idx].title = e.target.value;
                          setMemories(copy);
                        }}
                        className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-sm font-medium text-white flex-1 focus:outline-none focus:border-teal-400"
                        placeholder="Memory Title"
                      />
                      <select
                        value={mem.category}
                        onChange={(e) => {
                          const copy = [...memories];
                          copy[idx].category = e.target.value as MemoryCategory;
                          setMemories(copy);
                        }}
                        className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-300 capitalize focus:outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const copy = [...memories];
                          copy[idx].approved = !copy[idx].approved;
                          setMemories(copy);
                        }}
                        className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                          mem.approved
                            ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        {mem.approved ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </div>
                    <textarea
                      value={mem.content}
                      onChange={(e) => {
                        const copy = [...memories];
                        copy[idx].content = e.target.value;
                        setMemories(copy);
                      }}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-teal-400 resize-none"
                      placeholder="Memory content..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goals Section */}
          {goals.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                <Target className="w-4 h-4" />
                <span>Goals & Milestones ({goals.length})</span>
              </div>
              <div className="space-y-3">
                {goals.map((g, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      g.approved
                        ? 'bg-white/5 border-indigo-500/30 shadow-sm'
                        : 'bg-white/[0.02] border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <input
                        type="text"
                        value={g.title}
                        onChange={(e) => {
                          const copy = [...goals];
                          copy[idx].title = e.target.value;
                          setGoals(copy);
                        }}
                        className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-sm font-medium text-white flex-1 focus:outline-none focus:border-indigo-400"
                        placeholder="Goal Title"
                      />
                      <input
                        type="date"
                        value={g.deadline || ''}
                        onChange={(e) => {
                          const copy = [...goals];
                          copy[idx].deadline = e.target.value;
                          setGoals(copy);
                        }}
                        className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const copy = [...goals];
                          copy[idx].approved = !copy[idx].approved;
                          setGoals(copy);
                        }}
                        className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                          g.approved
                            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        {g.approved ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </div>
                    <textarea
                      value={g.description}
                      onChange={(e) => {
                        const copy = [...goals];
                        copy[idx].description = e.target.value;
                        setGoals(copy);
                      }}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-400 resize-none"
                      placeholder="Goal description and success criteria..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions Section */}
          {actions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
                <CheckSquare className="w-4 h-4" />
                <span>Action Items & Tasks ({actions.length})</span>
              </div>
              <div className="space-y-3">
                {actions.map((act, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      act.approved
                        ? 'bg-white/5 border-amber-500/30 shadow-sm'
                        : 'bg-white/[0.02] border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <input
                        type="text"
                        value={act.title}
                        onChange={(e) => {
                          const copy = [...actions];
                          copy[idx].title = e.target.value;
                          setActions(copy);
                        }}
                        className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-sm font-medium text-white flex-1 focus:outline-none focus:border-amber-400"
                        placeholder="Action title"
                      />
                      <input
                        type="date"
                        value={act.dueDate || ''}
                        onChange={(e) => {
                          const copy = [...actions];
                          copy[idx].dueDate = e.target.value;
                          setActions(copy);
                        }}
                        className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const copy = [...actions];
                          copy[idx].approved = !copy[idx].approved;
                          setActions(copy);
                        }}
                        className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                          act.approved
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        {act.approved ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </div>
                    {act.description && (
                      <textarea
                        value={act.description}
                        onChange={(e) => {
                          const copy = [...actions];
                          copy[idx].description = e.target.value;
                          setActions(copy);
                        }}
                        rows={1}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-amber-400 resize-none"
                        placeholder="Optional task details..."
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
          >
            Dismiss All
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveApproved}
              disabled={isSubmitting || approvedCount === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Commit {approvedCount} Selected to Firestore</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
