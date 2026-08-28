/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  handleRedirectResult,
  syncUserProfile,
  signOutUser,
  getAuthToken,
  fetchMemories,
  saveMemory,
  updateMemory,
  deleteMemoryDoc,
  fetchGoals,
  saveGoal,
  updateGoal,
  deleteGoalDoc,
  fetchActions,
  saveAction,
  updateAction,
  deleteActionDoc,
  fetchInsights,
  saveInsightDoc,
  deleteInsightDoc,
  fetchConversations,
  fetchConversationMessages,
  saveConversationMeta,
  saveMessageDoc,
  deleteConversationDoc,
} from './lib/firebase';
import type {
  AppView,
  Memory,
  Goal,
  ActionItem,
  Insight,
  InsightType,
  Conversation,
  ChatMessage,
  ExtractionResult,
  ExtractedMemoryProposal,
  ExtractedGoalProposal,
  ExtractedActionProposal,
} from './types';

// Subcomponents
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { AIWorkspaceView } from './components/AIWorkspaceView';
import { MemoriesView } from './components/MemoriesView';
import { GoalsView } from './components/GoalsView';
import { ActionsView } from './components/ActionsView';
import { InsightsView } from './components/InsightsView';
import { HistoryView } from './components/HistoryView';
import { SecurityAuditView } from './components/SecurityAuditView';
import { Menu, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // App Navigation
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Personal Data
  const [memories, setMemories] = useState<Memory[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Active AI Conversation State
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  // Listen to Auth State and process any incoming redirect result without race condition
  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const initAuth = async () => {
      try {
        // 1. Process redirect result first if returning from Google OAuth redirect
        const redirectUser = await handleRedirectResult();
        if (redirectUser && isMounted) {
          setUser(redirectUser);
          setAuthLoading(false);
        }
      } catch (err: any) {
        console.error('Redirect sign-in error:', err);
        if (isMounted) {
          setAuthError(err.message || 'Failed to authenticate via Google redirect');
        }
      }

      // 2. Subscribe to auth state changes to detect persisted or updated sessions
      if (isMounted) {
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          if (!isMounted) return;
          setUser(currentUser);
          if (currentUser) {
            syncUserProfile(currentUser);
          }
          setAuthLoading(false);
        });
      }
    };

    initAuth();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Load all user data when user changes
  const loadUserData = useCallback(async (uid: string) => {
    try {
      const [mems, gls, acts, ins, convs] = await Promise.all([
        fetchMemories(uid).catch(() => []),
        fetchGoals(uid).catch(() => []),
        fetchActions(uid).catch(() => []),
        fetchInsights(uid).catch(() => []),
        fetchConversations(uid).catch(() => []),
      ]);
      setMemories(mems);
      setGoals(gls);
      setActions(acts);
      setInsights(ins);
      setConversations(convs);
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadUserData(user.uid);
    } else {
      setMemories([]);
      setGoals([]);
      setActions([]);
      setInsights([]);
      setConversations([]);
      setMessages([]);
      setCurrentConversationId(null);
    }
  }, [user, loadUserData]);

  // Handle Google Sign-in
  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err.message || 'Failed to authenticate with Google');
    }
  };

  // Handle Sign-out
  const handleSignOut = async () => {
    try {
      await signOutUser();
      setCurrentView('dashboard');
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  // ==================== CHAT & AI CONVERSATION ====================

  const handleSendMessage = async (
    content: string,
    useContext: boolean
  ): Promise<{ reply: string; extraction?: ExtractionResult }> => {
    if (!user) throw new Error('User not authenticated');
    setIsChatLoading(true);
    setChatError(null);

    const token = await getAuthToken();
    if (!token) {
      setIsChatLoading(false);
      setChatError('Authentication token missing. Please sign in again.');
      throw new Error('No auth token');
    }

    // Determine or generate conversation ID
    const convId = currentConversationId || `conv-${Date.now()}`;
    if (!currentConversationId) {
      setCurrentConversationId(convId);
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update message state
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      // Save user message to Firestore
      await saveMessageDoc(user.uid, convId, {
        role: 'user',
        content,
      });

      // Call Cloud Run / Express backend API with strictly validated payload
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          useContext,
          autoExtract: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const modelReply = data.reply || 'No response generated.';

      const modelMessage: ChatMessage = {
        id: `msg-${Date.now()}-model`,
        role: 'model',
        content: modelReply,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, modelMessage]);

      // Save model reply to Firestore
      await saveMessageDoc(user.uid, convId, {
        role: 'model',
        content: modelReply,
      });

      // Determine conversation title (from first user message)
      const convTitle =
        messages.length === 0
          ? content.slice(0, 36) + (content.length > 36 ? '...' : '')
          : conversations.find((c) => c.id === convId)?.title || 'AI Workspace Session';

      // Update conversation metadata
      await saveConversationMeta(user.uid, convId, {
        title: convTitle,
        lastMessage: modelReply.slice(0, 60),
        messageCount: updatedMessages.length + 1,
      });

      // Refresh conversations list in background
      fetchConversations(user.uid).then(setConversations);

      return {
        reply: modelReply,
        extraction: data.extraction,
      };
    } catch (err: any) {
      console.error('Chat error:', err);
      setChatError(err.message || 'Failed to communicate with Gemini AI');
      throw err;
    } finally {
      setIsChatLoading(false);
    }
  };

  // Start a fresh conversation
  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setChatError(null);
    setCurrentView('workspace');
  };

  // Open an existing conversation from history
  const handleOpenConversation = async (conversationId: string) => {
    if (!user) return;
    try {
      setCurrentConversationId(conversationId);
      setIsChatLoading(true);
      setCurrentView('workspace');
      const loadedMessages = await fetchConversationMessages(user.uid, conversationId);
      setMessages(loadedMessages);
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (conversationId: string) => {
    if (!user) return;
    await deleteConversationDoc(user.uid, conversationId);
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setMessages([]);
    }
  };

  // ==================== KNOWLEDGE APPROVAL WORKFLOW ====================

  const handleApproveKnowledge = async (approved: {
    memories: ExtractedMemoryProposal[];
    goals: ExtractedGoalProposal[];
    actions: ExtractedActionProposal[];
  }) => {
    if (!user) return;

    // Save approved memories
    for (const mem of approved.memories) {
      await saveMemory(user.uid, {
        title: mem.title,
        content: mem.content,
        category: mem.category,
        sourceConversationId: currentConversationId || undefined,
      });
    }

    // Save approved goals
    for (const g of approved.goals) {
      await saveGoal(user.uid, {
        title: g.title,
        description: g.description,
        status: 'active',
        deadline: g.deadline,
      });
    }

    // Save approved actions
    for (const a of approved.actions) {
      await saveAction(user.uid, {
        title: a.title,
        description: a.description,
        status: 'pending',
        dueDate: a.dueDate,
        goalTitle: a.goalTitle,
      });
    }

    // Reload state
    await loadUserData(user.uid);
  };

  // ==================== MEMORIES CRUD ====================

  const handleAddMemory = async (memory: Omit<Memory, 'id' | 'uid' | 'createdAt'>) => {
    if (!user) return;
    const newId = await saveMemory(user.uid, memory);
    const updated = await fetchMemories(user.uid);
    setMemories(updated);
  };

  const handleUpdateMemory = async (id: string, updates: Partial<Omit<Memory, 'id' | 'uid'>>) => {
    if (!user) return;
    await updateMemory(user.uid, id, updates);
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleDeleteMemory = async (id: string) => {
    if (!user) return;
    await deleteMemoryDoc(user.uid, id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  // ==================== GOALS CRUD ====================

  const handleAddGoal = async (goal: Omit<Goal, 'id' | 'uid' | 'createdAt'>) => {
    if (!user) return;
    await saveGoal(user.uid, goal);
    const updated = await fetchGoals(user.uid);
    setGoals(updated);
  };

  const handleUpdateGoal = async (id: string, updates: Partial<Omit<Goal, 'id' | 'uid'>>) => {
    if (!user) return;
    await updateGoal(user.uid, id, updates);
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const handleDeleteGoal = async (id: string) => {
    if (!user) return;
    await deleteGoalDoc(user.uid, id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // ==================== ACTIONS CRUD ====================

  const handleAddAction = async (action: Omit<ActionItem, 'id' | 'uid' | 'createdAt'>) => {
    if (!user) return;
    await saveAction(user.uid, action);
    const updated = await fetchActions(user.uid);
    setActions(updated);
  };

  const handleUpdateAction = async (id: string, updates: Partial<Omit<ActionItem, 'id' | 'uid'>>) => {
    if (!user) return;
    await updateAction(user.uid, id, updates);
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const handleDeleteAction = async (id: string) => {
    if (!user) return;
    await deleteActionDoc(user.uid, id);
    setActions((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleAction = async (action: ActionItem) => {
    const nextStatus = action.status === 'completed' ? 'pending' : 'completed';
    await handleUpdateAction(action.id, { status: nextStatus });
  };

  // ==================== INSIGHTS ====================

  const handleGenerateInsight = async (type: InsightType) => {
    if (!user) return;
    setIsGeneratingInsight(true);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Authentication required');

      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          insightType: type,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to generate insight');
      }

      const generated = await response.json();
      await saveInsightDoc(user.uid, {
        title: generated.title,
        content: generated.content,
        type: generated.type || type,
      });

      const updated = await fetchInsights(user.uid);
      setInsights(updated);
    } catch (err: any) {
      console.error('Insight generation error:', err);
      // Safe state handling without blocking alert dialogs
      throw err;
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const handleDeleteInsight = async (id: string) => {
    if (!user) return;
    await deleteInsightDoc(user.uid, id);
    setInsights((prev) => prev.filter((i) => i.id !== id));
  };

  // ==================== RENDER ====================

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-wider">INITIALIZING GEMINI LIFEOS...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LandingPage
        onSignIn={handleSignIn}
        isLoading={authLoading}
        error={authError}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#030712] text-slate-200 overflow-hidden font-sans relative">
      {/* Ambient background glow orbs for frosted glass reflections */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Desktop Persistent Sidebar Navigation */}
      <div className="hidden md:block z-20">
        <Navbar
          currentView={currentView}
          onSelectView={setCurrentView}
          user={user}
          onSignOut={handleSignOut}
          memoriesCount={memories.length}
          goalsCount={goals.filter((g) => g.status === 'active').length}
          actionsCount={actions.filter((a) => a.status === 'pending').length}
        />
      </div>

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden z-10">
        {/* Mobile Header */}
        <div className="md:hidden px-4 py-3 border-b border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20">
              G
            </div>
            <span className="font-semibold text-sm text-white tracking-tight">Gemini LifeOS</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors border border-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-[#030712]/90 backdrop-blur-2xl pt-14">
            <Navbar
              currentView={currentView}
              onSelectView={(v) => {
                setCurrentView(v);
                setMobileMenuOpen(false);
              }}
              user={user}
              onSignOut={handleSignOut}
              memoriesCount={memories.length}
              goalsCount={goals.filter((g) => g.status === 'active').length}
              actionsCount={actions.filter((a) => a.status === 'pending').length}
            />
          </div>
        )}

        {/* View Switcher */}
        {currentView === 'dashboard' && (
          <DashboardView
            memories={memories}
            goals={goals}
            actions={actions}
            insights={insights}
            conversations={conversations}
            onNavigate={setCurrentView}
            onOpenConversation={handleOpenConversation}
            onOpenNewChat={handleNewConversation}
            onToggleAction={handleToggleAction}
            onGenerateInsightClick={() => setCurrentView('insights')}
          />
        )}

        {currentView === 'workspace' && (
          <AIWorkspaceView
            currentConversationId={currentConversationId}
            messages={messages}
            memories={memories}
            goals={goals}
            actions={actions}
            onSendMessage={handleSendMessage}
            onNewConversation={handleNewConversation}
            onApproveKnowledge={handleApproveKnowledge}
            isLoading={isChatLoading}
            error={chatError}
          />
        )}

        {currentView === 'memories' && (
          <MemoriesView
            memories={memories}
            onAddMemory={handleAddMemory}
            onUpdateMemory={handleUpdateMemory}
            onDeleteMemory={handleDeleteMemory}
          />
        )}

        {currentView === 'goals' && (
          <GoalsView
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {currentView === 'actions' && (
          <ActionsView
            actions={actions}
            goals={goals}
            onAddAction={handleAddAction}
            onUpdateAction={handleUpdateAction}
            onDeleteAction={handleDeleteAction}
          />
        )}

        {currentView === 'insights' && (
          <InsightsView
            insights={insights}
            memories={memories}
            goals={goals}
            actions={actions}
            onGenerateInsight={handleGenerateInsight}
            onDeleteInsight={handleDeleteInsight}
            isGenerating={isGeneratingInsight}
          />
        )}

        {currentView === 'history' && (
          <HistoryView
            conversations={conversations}
            onOpenConversation={handleOpenConversation}
            onDeleteConversation={handleDeleteConversation}
            onStartNewChat={handleNewConversation}
          />
        )}

        {currentView === 'security' && <SecurityAuditView user={user} />}
      </div>
    </div>
  );
}
