import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Send,
  Sparkles,
  RefreshCw,
  Plus,
  Brain,
  Target,
  CheckSquare,
  AlertTriangle,
  History,
  ShieldCheck,
  Zap,
  Sliders,
} from 'lucide-react';
import type {
  ChatMessage,
  ExtractionResult,
  Memory,
  Goal,
  ActionItem,
  ExtractedMemoryProposal,
  ExtractedGoalProposal,
  ExtractedActionProposal,
} from '../types';
import { ExtractionReviewModal } from './ExtractionReviewModal';

interface AIWorkspaceViewProps {
  currentConversationId: string | null;
  messages: ChatMessage[];
  memories: Memory[];
  goals: Goal[];
  actions: ActionItem[];
  onSendMessage: (
    content: string,
    useContext: boolean
  ) => Promise<{ reply: string; extraction?: ExtractionResult }>;
  onNewConversation: () => void;
  onApproveKnowledge: (approved: {
    memories: ExtractedMemoryProposal[];
    goals: ExtractedGoalProposal[];
    actions: ExtractedActionProposal[];
  }) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export const AIWorkspaceView: React.FC<AIWorkspaceViewProps> = ({
  currentConversationId,
  messages,
  memories,
  goals,
  actions,
  onSendMessage,
  onNewConversation,
  onApproveKnowledge,
  isLoading,
  error,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [usePersonalContext, setUsePersonalContext] = useState(true);
  const [activeExtraction, setActiveExtraction] = useState<ExtractionResult | null>(null);
  const [isExtractingManual, setIsExtractingManual] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      if (smooth) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }
  };

  useEffect(() => {
    // Only scroll the internal messages container; never call window.scrollTo or scrollIntoView on document
    scrollToBottom(true);
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    setInputValue('');
    // Instant scroll on user submit
    setTimeout(() => scrollToBottom(false), 20);
    try {
      const response = await onSendMessage(trimmed, usePersonalContext);
      if (
        response.extraction &&
        (response.extraction.memories.length > 0 ||
          response.extraction.goals.length > 0 ||
          response.extraction.actions.length > 0)
      ) {
        setActiveExtraction(response.extraction);
      }
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickPrompts = [
    {
      title: 'Plan Weekly Objectives',
      prompt: 'Help me prioritize my top 3 strategic focus areas for this week based on my active goals and pending actions.',
    },
    {
      title: 'Brainstorm Project Roadmap',
      prompt: "Let's structure a concrete milestone roadmap for my upcoming personal project, breaking down key phases and immediate actions.",
    },
    {
      title: 'Log Personal Preferences & Habits',
      prompt: 'I want to document my core work productivity routines, deep-work habits, and tech stack preferences.',
    },
    {
      title: 'Analyze Life Balance & Goals',
      prompt: 'Review my active goals and give me an honest assessment of potential blind spots or overburdened priorities.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-slate-950 text-slate-100 overflow-hidden">
      {/* Workspace Header */}
      <header className="px-6 py-3.5 border-b border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              Gemini Intelligent AI Workspace
              {currentConversationId && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                  ID: {currentConversationId.slice(0, 8)}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Multi-turn dialogue with automatic personal knowledge extraction
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Grounding Context Toggle */}
          <button
            onClick={() => setUsePersonalContext(!usePersonalContext)}
            title="When active, Gemini accesses your approved memories and active goals for personalized strategic reasoning"
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              usePersonalContext
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Personal Context {usePersonalContext ? 'Active' : 'Off'}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                usePersonalContext ? 'bg-teal-400 shadow-sm shadow-teal-400/50' : 'bg-slate-500'
              }`}
            />
          </button>

          <button
            onClick={onNewConversation}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white text-xs font-medium border border-white/10 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>New Chat</span>
          </button>
        </div>
      </header>

      {/* Main Dialogue Scroll Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 space-y-6"
      >
        {messages.length === 0 ? (
          /* Empty / Starter State */
          <div className="max-w-2xl mx-auto py-10 space-y-8 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-teal-500/20 to-purple-500/20 border border-white/15 flex items-center justify-center text-indigo-300 mx-auto shadow-xl shadow-indigo-500/10 backdrop-blur-md">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                How can Gemini LifeOS assist you today?
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Engage in deep strategic planning, brain dumps, or problem solving. Important memories, goals, and actions will be extracted for your review.
              </p>
            </div>

            {/* Quick Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputValue(qp.prompt);
                  }}
                  className="p-4 text-left rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group shadow-sm backdrop-blur-md"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {qp.title}
                    </span>
                    <Zap className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {qp.prompt}
                  </p>
                </button>
              ))}
            </div>

            {/* Context Status pill */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>
                  Loaded Knowledge Context: {memories.length} Memories, {goals.length} Goals, {actions.length} Actions
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">Owner-Locked UID</span>
            </div>
          </div>
        ) : (
          /* Message Flow */
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id || index}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 rounded-tr-sm'
                        : 'bg-white/5 border border-white/10 backdrop-blur-md text-slate-200 shadow-sm rounded-tl-sm'
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div className="markdown-content text-slate-200 text-sm leading-relaxed">
                        <Markdown
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-base font-bold text-white mt-3 mb-1.5 first:mt-0">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-sm font-bold text-white mt-2.5 mb-1 first:mt-0">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-xs font-semibold text-slate-200 mt-2 mb-1 first:mt-0 uppercase tracking-wider">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-5 space-y-1 mb-2 last:mb-0 text-slate-200">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-5 space-y-1 mb-2 last:mb-0 text-slate-200">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="leading-relaxed">{children}</li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-white">{children}</strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic text-slate-200">{children}</em>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-indigo-400 pl-3 my-2 text-slate-300 italic">
                                {children}
                              </blockquote>
                            ),
                            hr: () => <hr className="my-3 border-white/10" />,
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                              >
                                {children}
                              </a>
                            ),
                            code: ({ className, children, ...props }: any) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const isCodeBlock = match || String(children).includes('\n');
                              return isCodeBlock ? (
                                <div className="my-2.5 rounded-xl overflow-hidden border border-white/10 bg-slate-900/90 shadow-inner">
                                  {match && (
                                    <div className="px-3 py-1 bg-white/5 border-b border-white/10 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                      {match[1]}
                                    </div>
                                  )}
                                  <pre className="p-3 text-xs font-mono text-slate-200 overflow-x-auto">
                                    <code>{children}</code>
                                  </pre>
                                </div>
                              ) : (
                                <code
                                  className="bg-slate-800/90 text-teal-300 font-mono text-xs px-1.5 py-0.5 rounded border border-white/10"
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                            pre: ({ children }) => <>{children}</>,
                          }}
                        >
                          {msg.content}
                        </Markdown>
                      </div>
                    )}
                    <div
                      className={`text-[10px] font-mono mt-2 flex items-center justify-end gap-1 ${
                        isUser ? 'text-indigo-200' : 'text-slate-500'
                      }`}
                    >
                      <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-slate-300 shrink-0 shadow-sm mt-0.5">
                      <span className="text-xs font-bold font-mono">YOU</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Model Thinking state */}
            {isLoading && (
              <div className="flex gap-3.5 justify-start">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm p-4 text-sm text-slate-400 flex items-center gap-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-xs font-medium text-slate-300">
                    Gemini reasoning & extracting personal knowledge...
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <div>
                  <p className="font-semibold">Generation Notice:</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Prompt Input Form */}
      <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-xl shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-2">
          <div className="relative flex items-end bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-indigo-400 focus-within:bg-white/10 shadow-inner transition-all">
            <textarea
              id="ai-workspace-chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Gemini anything, discuss projects, or log personal decisions... (Shift+Enter for newline)"
              rows={2}
              className="w-full bg-transparent px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-32"
            />
            <button
              id="ai-workspace-send-btn"
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-all disabled:opacity-30 disabled:hover:bg-indigo-500 shadow-md shadow-indigo-500/25 shrink-0 ml-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              Server-Side Gemini 3.6 Flash • Firebase Admin Verified
            </span>
            <span>Press Enter to send</span>
          </div>
        </form>
      </div>

      {/* Knowledge Extraction Review Modal */}
      {activeExtraction && (
        <ExtractionReviewModal
          extraction={activeExtraction}
          isOpen={Boolean(activeExtraction)}
          onClose={() => setActiveExtraction(null)}
          onApprove={onApproveKnowledge}
        />
      )}
    </div>
  );
};
