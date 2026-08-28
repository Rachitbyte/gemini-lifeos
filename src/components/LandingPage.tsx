import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Brain,
  Target,
  CheckSquare,
  Lock,
  ArrowRight,
  Database,
  Cpu,
  UserCheck,
} from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSignIn,
  isLoading,
  error,
}) => {
  const [signingIn, setSigningIn] = useState(false);

  const handleSignInClick = async () => {
    try {
      setSigningIn(true);
      await onSignIn();
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-10 w-[500px] h-[300px] bg-gradient-to-t from-teal-500/15 to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              Gemini <span className="text-indigo-400">LifeOS</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              id="landing-signin-header-btn"
              onClick={handleSignInClick}
              disabled={isLoading || signingIn}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold text-sm transition-all shadow-md hover:shadow-indigo-500/10 disabled:opacity-50 backdrop-blur-md"
            >
              {isLoading || signingIn ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserCheck className="w-4 h-4 text-teal-400" />
              )}
              <span>Sign In with Google</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-medium tracking-wide backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Authenticated Private AI Workspace • Firestore Isolated</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Turn Conversations into <br />
            <span className="bg-gradient-to-r from-indigo-300 via-teal-200 to-purple-300 bg-clip-text text-transparent">
              User-Controlled Personal Knowledge
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Gemini LifeOS provides an intelligent executive workspace. Engage in deep multi-turn dialogue with Gemini, extract structured memories, track goals, prioritize action items, and synthesize strategic personal insights—all with user approval and airtight data isolation.
          </p>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm text-left max-w-md mx-auto backdrop-blur-md">
              <p className="font-semibold text-red-200">Authentication Note:</p>
              <p>{error}</p>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="landing-hero-signin-btn"
              onClick={handleSignInClick}
              disabled={isLoading || signingIn}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white font-bold text-base shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading || signingIn ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Launch Workspace with Google</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/40 backdrop-blur-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 mb-3">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Human-Approved Memories</h3>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Gemini extracts key context, but nothing becomes permanent without your explicit review and sign-off.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-400/40 backdrop-blur-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 mb-3">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Goal & Task Execution</h3>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Turn open-ended strategy into structured milestones with statuses, deadlines, and actionable steps.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 backdrop-blur-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">AI Synthesis & Insights</h3>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Generate pattern recognitions, progress summaries, and strategic recommendations from your data.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/40 backdrop-blur-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Zero Secret Exposure</h3>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              All Gemini API calls remain server-side. Firestore rules enforce strictly isolated owner-only permissions.
            </p>
          </div>
        </div>

        {/* Technology stack architecture badge bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Gemini 3.6 Flash
          </span>
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-teal-400" /> Cloud Firestore
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Firebase Auth
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" /> Cloud Run Ready
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-400 bg-white/[0.02]">
        Gemini LifeOS • Private Personal Intelligence Architecture
      </footer>
    </div>
  );
};
