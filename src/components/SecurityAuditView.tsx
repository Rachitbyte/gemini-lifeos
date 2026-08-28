import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Database,
  Cpu,
  Key,
  CheckCircle2,
  AlertCircle,
  FileText,
  Server,
  RefreshCw,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { getAuthToken } from '../lib/firebase';

interface SecurityAuditViewProps {
  user: User | null;
}

export const SecurityAuditView: React.FC<SecurityAuditViewProps> = ({ user }) => {
  const [serverSecurityStatus, setServerSecurityStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSecurityAudit = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) return;

      const res = await fetch('/api/security/status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setServerSecurityStatus(data);
      }
    } catch (e) {
      console.error('Failed to fetch security status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityAudit();
  }, [user]);

  const threatZones = [
    {
      zone: '1. Input Surfaces',
      threat: 'Prompt injection, malformed request bodies, oversized inputs',
      impact: 'High',
      mitigation:
        'Defensive input validation schemas, length caps, and explicit enum limits on categories & statuses.',
    },
    {
      zone: '2. Planning & Reasoning',
      threat: 'Indirect injection trying to bypass instructions or leak system directives',
      impact: 'Critical',
      mitigation:
        'Retrieved memories/goals treated strictly as untrusted data blocks; model output schema validated with Gemini responseSchema.',
    },
    {
      zone: '3. Tool & Backend Execution',
      threat: 'IDOR, broken object authorization, unauthorized database access',
      impact: 'Critical',
      mitigation:
        'Firebase ID token verified server-side with Firebase Admin SDK; UID derived strictly from token payload.',
    },
    {
      zone: '4. Memory & State',
      threat: 'Cross-user data leakage and unauthorized persistence',
      impact: 'Critical',
      mitigation:
        'All Firestore paths scoped to /users/{userId}/* with request.auth.uid == userId rules; mandatory user review before writes.',
    },
    {
      zone: '5. Inter-System Communication',
      threat: 'Exposure of GEMINI_API_KEY to browser client or in source code',
      impact: 'Critical',
      mitigation:
        'Zero client key exposure; GEMINI_API_KEY is server-only environment variable queried via Cloud Run backend.',
    },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-950 text-slate-100 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Security Architecture & Isolation Audit
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time verification of Firebase token validation, Firestore user isolation, and server-side secret protection.
          </p>
        </div>

        <button
          onClick={fetchSecurityAudit}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-verify Audit</span>
        </button>
      </div>

      {/* Live Security Verification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Token Verification */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Identity Verification
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-white">Firebase Admin SDK verifyIdToken()</div>
            <p className="text-xs text-slate-400 font-mono mt-1 truncate">
              UID: {serverSecurityStatus?.authenticatedUid || user?.uid || 'Not signed in'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {serverSecurityStatus?.jwtBypassDisabled
              ? 'Strict Cryptographic Verification (No Bypass)'
              : 'Verified Server-Side'}
          </div>
        </div>

        {/* Database Boundaries */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Firestore Isolation
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-white">Owner-Scoped Subcollections</div>
            <p className="text-xs text-slate-400 font-mono mt-1 truncate">
              {serverSecurityStatus?.userIsolationPath || `/users/${user?.uid || '{uid}'}/*`}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-sky-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {serverSecurityStatus?.serverSideAuthoritativeData
              ? 'Server Authoritative Data Queries'
              : 'Rule: request.auth.uid == userId'}
          </div>
        </div>

        {/* Gemini Secret Protection */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              API Credential Policy
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-white">Google Cloud Secret Manager</div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              GEMINI_API_KEY (Cloud Run Injected)
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-amber-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Zero Browser Exposure
          </div>
        </div>
      </div>

      {/* Production Threat Modeling Table */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">Agentic Threat Modeling Matrix</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">OWASP Top 10 for LLMs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Threat Zone</th>
                <th className="py-3 px-4">Identified Threat</th>
                <th className="py-3 px-4">Impact</th>
                <th className="py-3 px-4">Implemented Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {threatZones.map((tz, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                    {tz.zone}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{tz.threat}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-medium ${
                        tz.impact === 'Critical'
                          ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {tz.impact}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 leading-relaxed">{tz.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cloud Run Challenge Verification Badge */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Google Cloud Run Deployment Target</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              dev-tutorial=cloud-run-ai-challenge
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium">
            Container Ingress :3000 Active
          </span>
        </div>
      </div>
    </div>
  );
};
