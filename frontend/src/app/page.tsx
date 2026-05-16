'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SecurityConsole } from '@/components/SecurityConsole';
import { HiveCell } from '@/components/HiveCell';

interface AuditResult {
  txHash: string;
  consensusScore: number;
  breakdown: {
    agent_402_a: number;
    agent_402_b: number;
    agent_402_c: number;
  };
  action: string;
}

export default function HiveGuardSecurityLab() {
  const [activeTab, setActiveTab] = useState<'lab' | 'history'>('lab');
  const [logs, setLogs] = useState<string[]>([]);
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agentScores, setAgentScores] = useState({
    a: 0,
    b: 0,
    c: 0,
  });

  const pushLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  const handleActivate = () => {
    pushLog('🔐 Initializing EIP-7702 Authorization flow...');
    setIsActivated(true);
    pushLog('✅ HiveGuard Security Framework Active');
  };

  const handleTestProtocol = async (isMalicious: boolean) => {
    if (!isActivated) return;

    setIsLoading(true);
    const targetName = isMalicious ? 'MockMaliciousDrainer' : 'MockValidStakingPool';
    const targetAddr = isMalicious ? '0xmalicious123' : '0xvalid456';

    pushLog(`\n📤 Initiating interaction with: ${targetName}`);
    pushLog(`   Target Address: ${targetAddr}`);
    pushLog(`   Forwarding to Swarm backend for evaluation...`);

    try {
      const txHash = `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`;

      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/audit' || 'http://localhost:8000/api/v1/audit',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txHash,
            targetContract: targetAddr,
            payloadData: '0xstakecall',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const result: AuditResult = await response.json();

      setAgentScores({
        a: result.breakdown.agent_402_a,
        b: result.breakdown.agent_402_b,
        c: result.breakdown.agent_402_c,
      });

      pushLog(`\n🤖 Agent 402-A (Code Review): ${result.breakdown.agent_402_a}/100`);
      pushLog(`🤖 Agent 402-B (Social Voice): ${result.breakdown.agent_402_b}/100`);
      pushLog(`🤖 Agent 402-C (Fork Simulation): ${result.breakdown.agent_402_c}/100`);
      pushLog(`───────────────────────────────`);
      pushLog(`📊 CONSENSUS SCORE: ${result.consensusScore}/100`);

      if (result.action === 'PASS') {
        pushLog(`✅ FIREWALL CLEARANCE: Protocol verified safe. Executing transaction.`);
      } else {
        pushLog(`❌ FIREWALL ALERT: Malicious behavior detected. Transaction REVERTED.`);
      }
    } catch (err) {
      pushLog(`⚠️  Execution Error: ${String(err)}`);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">🛡️ HIVEGUARD FIREWALL</h1>
          <p className="text-slate-400 text-sm">
            AI-powered transaction security framework • Monad Testnet
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('lab')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'lab'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            🔬 Live Lab
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'history'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            📋 History
          </button>
        </div>

        {/* Live Lab Tab */}
        {activeTab === 'lab' && (
          <>
            {/* Control Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button
                onClick={handleActivate}
                disabled={isActivated}
                className={`p-4 rounded font-bold transition-colors ${
                  isActivated
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isActivated ? '🔒 HiveGuard Active' : '🔓 Activate EIP-7702'}
              </button>

              <button
                onClick={() => handleTestProtocol(false)}
                disabled={!isActivated || isLoading}
                className={`p-4 rounded font-bold transition-colors ${
                  !isActivated || isLoading
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                ✅ Test Valid Protocol
              </button>

              <button
                onClick={() => handleTestProtocol(true)}
                disabled={!isActivated || isLoading}
                className={`p-4 rounded font-bold transition-colors ${
                  !isActivated || isLoading
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                ❌ Test Malicious Protocol
              </button>
            </div>

            {/* Swarm Status Grid */}
            {isActivated && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-amber-400 mb-4">🐝 AI AGENT SWARM STATUS</h2>
                <div className="flex justify-center gap-8">
                  <HiveCell agentName="402-A" statusScore={agentScores.a} role="Code" />
                  <HiveCell agentName="402-B" statusScore={agentScores.b} role="Social" />
                  <HiveCell agentName="402-C" statusScore={agentScores.c} role="Simulation" />
                </div>
              </div>
            )}

            {/* Security Console */}
            <SecurityConsole logs={logs} />

            {/* Info Box */}
            <div className="bg-slate-900 border border-slate-700 rounded p-4 text-sm text-slate-400">
              <p>
                💡 <strong>How it works:</strong> Click "Activate EIP-7702" to enable the firewall, then test with
                valid or malicious protocols. The AI swarm evaluates each transaction across three agents and returns a
                consensus score.
              </p>
            </div>
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">View your transaction history and rate agent accuracy</p>
            <Link
              href="/history"
              className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
            >
              Go to History →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
