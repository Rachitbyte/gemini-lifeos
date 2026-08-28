import React from 'react';
import {
  Brain,
  Target,
  CheckSquare,
  Sparkles,
  Bot,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import type {
  Memory,
  Goal,
  ActionItem,
  Insight,
  Conversation,
  AppView,
} from '../types';

interface DashboardViewProps {
  memories: Memory[];
  goals: Goal[];
  actions: ActionItem[];
  insights: Insight[];
  conversations: Conversation[];
  onNavigate: (view: AppView) => void;
  onOpenConversation: (id: string) => void;
  onOpenNewChat: () => void;
  onToggleAction: (action: ActionItem) => void;
  onGenerateInsightClick: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  memories,
  goals,
  actions,
  insights,
  conversations,
  onNavigate,
  onOpenConversation,
  onOpenNewChat,
  onToggleAction,
  onGenerateInsightClick,
}) => {
  const activeGoals = goals.filter((g) => g.status === 'active');
  const pendingActions = actions.filter((a) => a.status === 'pending');
  const latestInsight = insights[0];
  const recentConversations = conversations.slice(0, 4);

  return (
    <div className="flex-1 min-h-0 p-6 md:p-8 overflow-y-auto bg-transparent text-slate-200 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Gemini LifeOS Dashboard
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              OWNER-ISOLATED
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">
            Your private, authenticated intelligence center for memories, strategic goals, actions, and synthesized insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="dashboard-start-chat-btn"
            onClick={onOpenNewChat}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Bot className="w-4 h-4" />
            <span>Launch AI Workspace</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Memories Counter */}
        <div
          onClick={() => onNavigate('memories')}
          className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 cursor-pointer transition-all hover:bg-white/[0.08] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Approved Memories
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 group-hover:scale-110 transition-transform">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {memories.length}
            </span>
            <span className="text-xs text-teal-400 font-medium">Durable Context</span>
          </div>
        </div>

        {/* Goals Counter */}
        <div
          onClick={() => onNavigate('goals')}
          className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 cursor-pointer transition-all hover:bg-white/[0.08] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Goals
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {activeGoals.length}
            </span>
            <span className="text-xs text-indigo-300 font-medium">Of {goals.length} Total</span>
          </div>
        </div>

        {/* Actions Counter */}
        <div
          onClick={() => onNavigate('actions')}
          className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 cursor-pointer transition-all hover:bg-white/[0.08] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Actions
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {pendingActions.length}
            </span>
            <span className="text-xs text-amber-400 font-medium">Open Tasks</span>
          </div>
        </div>

        {/* Conversations Counter */}
        <div
          onClick={() => onNavigate('history')}
          className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 cursor-pointer transition-all hover:bg-white/[0.08] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Conversations
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {conversations.length}
            </span>
            <span className="text-xs text-purple-300 font-medium">Saved Sessions</span>
          </div>
        </div>
      </div>

      {/* Center 2-Column Split: Latest Insight + Pending Action Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Insight Card */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Latest Strategic AI Insight</h3>
              </div>
              {latestInsight ? (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase">
                  {latestInsight.type}
                </span>
              ) : (
                <button
                  onClick={onGenerateInsightClick}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Generate First Insight
                </button>
              )}
            </div>

            {latestInsight ? (
              <div className="mt-4 space-y-2">
                <h4 className="text-base font-semibold text-white">{latestInsight.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line line-clamp-4">
                  {latestInsight.content}
                </p>
                <p className="text-[10px] text-slate-400 font-mono pt-2">
                  Generated {new Date(latestInsight.createdAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Gemini synthesizes overarching patterns, goal alignment, and recommendations from your approved memories.
                </p>
                <button
                  onClick={onGenerateInsightClick}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium hover:bg-indigo-500/30 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Synthesize Insights
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Synthesized from {memories.length} memories & {goals.length} goals
            </span>
            <button
              onClick={() => onNavigate('insights')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All Insights</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Priority Pending Actions Checklist */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Priority Action Items</h3>
              </div>
              <button
                onClick={() => onNavigate('actions')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Manage All ({actions.length})
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {pendingActions.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-teal-500/50 mx-auto mb-2" />
                  No pending action items! All tasks are clear.
                </div>
              ) : (
                pendingActions.slice(0, 4).map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 group hover:border-white/15 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={act.status === 'completed'}
                        onChange={() => onToggleAction(act)}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-teal-400 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate group-hover:text-teal-300 transition-colors">
                          {act.title}
                        </p>
                        {act.dueDate && (
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" /> Due {act.dueDate}
                          </p>
                        )}
                      </div>
                    </div>

                    {act.goalTitle && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 truncate max-w-[120px]">
                        {act.goalTitle}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {pendingActions.length} pending • {actions.filter((a) => a.status === 'completed').length} completed
            </span>
            <button
              onClick={() => onNavigate('actions')}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              <span>Go to Actions</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Conversations & Active Goals Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversations */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Recent AI Conversations</h3>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Full History
            </button>
          </div>

          <div className="space-y-2">
            {recentConversations.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No saved conversations yet. Start a new dialogue in the AI Workspace!
              </div>
            ) : (
              recentConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onOpenConversation(conv.id)}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/[0.08] cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                      {conv.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {conv.lastMessage || 'No messages'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {conv.messageCount || 0} msgs
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Strategic Goals */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Active Strategic Goals</h3>
            </div>
            <button
              onClick={() => onNavigate('goals')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Manage Goals
            </button>
          </div>

          <div className="space-y-2">
            {activeGoals.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No active goals set. Create one or extract goals from AI conversations!
              </div>
            ) : (
              activeGoals.slice(0, 3).map((g) => (
                <div
                  key={g.id}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-white">{g.title}</h4>
                    {g.deadline && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        Target: {g.deadline}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {g.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
