import React, { useState } from 'react';
import {
  History,
  MessageSquare,
  Clock,
  Trash2,
  ArrowRight,
  Search,
  Bot,
  Plus,
} from 'lucide-react';
import type { Conversation, ChatMessage } from '../types';

interface HistoryViewProps {
  conversations: Conversation[];
  onOpenConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => Promise<void>;
  onStartNewChat: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  conversations,
  onOpenConversation,
  onDeleteConversation,
  onStartNewChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((c) => {
    return (
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-950 text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-purple-400" />
            AI Conversation History
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
              {conversations.length} Saved
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse all past multi-turn dialogues, inspect previous reasoning, and resume any session.
          </p>
        </div>

        <button
          onClick={onStartNewChat}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold text-xs shadow-md shadow-purple-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search previous conversations..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-slate-900/30 rounded-2xl border border-slate-900">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No conversations recorded</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Conversations in the AI Workspace are automatically saved to your private Cloud Firestore collection.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-purple-500/40 transition-all flex items-center justify-between gap-4 group"
            >
              <div
                onClick={() => onOpenConversation(conv.id)}
                className="min-w-0 flex-1 cursor-pointer space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                    {conv.title}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {conv.messageCount || 0} messages
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {conv.lastMessage || 'No preview available.'}
                </p>
                <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Updated{' '}
                    {new Date(conv.updatedAt).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                  <span>ID: {conv.id.slice(0, 8)}...</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onOpenConversation(conv.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-slate-700 hover:border-purple-500/40 text-xs font-semibold transition-colors"
                >
                  <span>Resume</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteConversation(conv.id)}
                  title="Delete Conversation"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
