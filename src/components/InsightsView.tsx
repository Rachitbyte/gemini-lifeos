import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Brain,
  Trash2,
  Calendar,
  Layers,
  CheckCircle,
  Copy,
  Check,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Insight, InsightType, Memory, Goal, ActionItem } from '../types';

interface InsightsViewProps {
  insights: Insight[];
  memories: Memory[];
  goals: Goal[];
  actions: ActionItem[];
  onGenerateInsight: (type: InsightType) => Promise<void>;
  onDeleteInsight: (id: string) => Promise<void>;
  isGenerating: boolean;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  insights,
  memories,
  goals,
  actions,
  onGenerateInsight,
  onDeleteInsight,
  isGenerating,
}) => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [targetType, setTargetType] = useState<InsightType>('recommendation');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const insightTypes: { id: InsightType; label: string; desc: string }[] = [
    {
      id: 'recommendation',
      label: 'Strategic Recommendation',
      desc: 'Actionable high-leverage guidance and prioritization',
    },
    {
      id: 'pattern',
      label: 'Pattern & Habit Analysis',
      desc: 'Synthesize recurring themes and behavioral tendencies',
    },
    {
      id: 'summary',
      label: 'Holistic Status Summary',
      desc: 'Executive overview of current projects, progress, and goals',
    },
  ];

  const handleGenerate = async () => {
    setErrorMessage(null);
    try {
      await onGenerateInsight(targetType);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to synthesize insights. Please ensure you have approved memories or goals.');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredInsights = insights.filter((i) => {
    if (selectedTypeFilter === 'all') return true;
    return i.type === selectedTypeFilter;
  });

  const getTypeBadgeClass = (type: InsightType) => {
    switch (type) {
      case 'recommendation':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'pattern':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'summary':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const totalDataItems = memories.length + goals.length + actions.length;

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-950 text-slate-100 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-sky-400" />
            AI Synthesized Personal Insights
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-mono">
              {insights.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Higher-level strategic observations and patterns generated strictly from your approved personal data.
          </p>
        </div>
      </div>

      {/* Insight Generation Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-sky-500/30 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Generate On-Demand Personal Insight</h2>
              <p className="text-xs text-slate-400">
                Grounded on {memories.length} Memories, {goals.length} Goals, and {actions.length} Actions.
              </p>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> 100% Client Secret Safe
            </span>
          </div>
        </div>

        {totalDataItems === 0 ? (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              You haven't approved any memories, goals, or actions yet. Converse in the AI Workspace or add items first to provide context for insights.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {insightTypes.map((it) => (
                <button
                  key={it.id}
                  onClick={() => setTargetType(it.id)}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
                    targetType === it.id
                      ? 'bg-sky-500/15 border-sky-500 text-white shadow-md shadow-sky-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{it.label}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        targetType === it.id ? 'bg-sky-400' : 'bg-slate-700'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">{it.desc}</p>
                </button>
              ))}
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end">
              <button
                id="generate-insight-btn"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50 hover:scale-[1.01]"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing Observations with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Synthesize {targetType.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedTypeFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedTypeFilter === 'all'
              ? 'bg-sky-500 text-slate-950 font-semibold'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All ({insights.length})
        </button>
        {insightTypes.map((it) => (
          <button
            key={it.id}
            onClick={() => setSelectedTypeFilter(it.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              selectedTypeFilter === it.id
                ? 'bg-sky-500 text-slate-950 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {it.id}
          </button>
        ))}
      </div>

      {/* Insights List */}
      {filteredInsights.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-slate-900/30 rounded-2xl border border-slate-900">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No synthesized insights yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the synthesize button above to generate higher-level patterns and recommendations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInsights.map((insight) => (
            <div
              key={insight.id}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all space-y-4 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border uppercase ${getTypeBadgeClass(
                      insight.type
                    )}`}
                  >
                    {insight.type}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {insight.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(insight.content, insight.id)}
                    title="Copy insight"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    {copiedId === insight.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteInsight(insight.id)}
                    title="Delete insight"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {insight.content}
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Synthesized on{' '}
                  {new Date(insight.createdAt).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
                <span>Server Grounded</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
