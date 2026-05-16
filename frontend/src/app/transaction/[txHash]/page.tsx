'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTransactionDetails, TransactionRecord } from '@/utils/etherscan';
import { AgentRating } from '@/components/AgentRating';
import { HiveCell } from '@/components/HiveCell';

interface PageProps {
  params: { txHash: string };
}

export default function TransactionDetailPage({ params }: PageProps) {
  const { txHash } = params;
  const [transaction, setTransaction] = useState<TransactionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({ a: 0, b: 0, c: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      // MVP: Use mock data
      const mockTx: TransactionRecord = {
        txHash: `0x${txHash}`,
        timestamp: Math.floor(Date.now() / 1000) - 3600,
        target: '0x55EbeF0C36eb9BD23821CA35916Ca59d148F394B',
        value: '0.1',
        status: 'Released',
        consensusScore: 92,
        agentScores: {
          agent_402_a: 95,
          agent_402_b: 88,
          agent_402_c: 92,
        },
      };
      setTransaction(mockTx);
      setLoading(false);
    };

    fetchDetails();
  }, [txHash]);

  const handleRateAgent = async (agentId: number, rating: number) => {
    setRatings((prev) => ({
      ...prev,
      [agentId === 1 ? 'a' : agentId === 2 ? 'b' : 'c']: rating,
    }));
  };

  const handleSubmitRatings = async () => {
    if (!transaction || Object.values(ratings).some((r) => r === 0)) {
      alert('Please rate all agents before submitting');
      return;
    }

    setSubmitting(true);
    try {
      // Call backend to record ratings on-chain
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/record-ratings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txHash: transaction.txHash,
            agentRatings: [ratings.a, ratings.b, ratings.c],
          }),
        }
      );

      if (response.ok) {
        alert('✅ Ratings submitted successfully!');
        setRatings({ a: 0, b: 0, c: 0 });
      } else {
        alert('❌ Failed to submit ratings');
      }
    } catch (error) {
      console.error('Error submitting ratings:', error);
      alert('Error submitting ratings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8 font-mono flex items-center justify-center">
        <p className="text-slate-400">Loading transaction details...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8 font-mono">
        <div className="max-w-6xl mx-auto">
          <p className="text-red-400 mb-4">Transaction not found</p>
          <Link href="/history" className="text-amber-400 hover:text-amber-300">
            ← Back to History
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = transaction.status === 'Released' ? 'emerald' : 'red';

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/history" className="text-amber-400 hover:text-amber-300 mb-4 inline-block">
            ← Back to History
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Transaction Details</h1>
          <code className="text-sm text-amber-400">{transaction.txHash}</code>
        </div>

        {/* Transaction Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-amber-400 mb-4">📊 Transaction Info</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-400">Target Contract</p>
                <code className="text-slate-300">{transaction.target}</code>
              </div>
              <div>
                <p className="text-slate-400">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded bg-${statusColor}-900 text-${statusColor}-300`}
                >
                  {transaction.status === 'Released' ? '✅ Released' : '❌ Refunded'}
                </span>
              </div>
              <div>
                <p className="text-slate-400">Value</p>
                <p className="text-slate-300">{transaction.value} MON</p>
              </div>
            </div>
          </div>

          {/* Score Summary */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-amber-400 mb-4">🎯 Score Breakdown</h2>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-emerald-400 mb-2">
                {transaction.consensusScore}%
              </div>
              <p className="text-slate-400">Consensus Score</p>
            </div>
            <p className="text-xs text-slate-400">
              Threshold: 80% • Result:{' '}
              <span className={transaction.consensusScore >= 80 ? 'text-emerald-400' : 'text-red-400'}>
                {transaction.consensusScore >= 80 ? 'PASS ✅' : 'FAIL ❌'}
              </span>
            </p>
          </div>
        </div>

        {/* Agent Scores Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-amber-400 mb-4">🤖 Agent Scores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HiveCell
              agentName="Agent 402-A"
              statusScore={transaction.agentScores.agent_402_a}
              role="Code Review"
            />
            <HiveCell
              agentName="Agent 402-B"
              statusScore={transaction.agentScores.agent_402_b}
              role="Social Scan"
            />
            <HiveCell
              agentName="Agent 402-C"
              statusScore={transaction.agentScores.agent_402_c}
              role="Blacklist Check"
            />
          </div>
        </div>

        {/* Rating Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-amber-400 mb-4">⭐ Rate Agent Accuracy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AgentRating
              agentId={1}
              agentName="Agent 402-A: Code Review"
              score={transaction.agentScores.agent_402_a}
              onRateChange={(rating) => handleRateAgent(1, rating)}
            />
            <AgentRating
              agentId={2}
              agentName="Agent 402-B: Social Scan"
              score={transaction.agentScores.agent_402_b}
              onRateChange={(rating) => handleRateAgent(2, rating)}
            />
            <AgentRating
              agentId={3}
              agentName="Agent 402-C: Blacklist Check"
              score={transaction.agentScores.agent_402_c}
              onRateChange={(rating) => handleRateAgent(3, rating)}
            />
          </div>

          <button
            onClick={handleSubmitRatings}
            disabled={submitting || Object.values(ratings).some((r) => r === 0)}
            className="mt-6 w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Ratings'}
          </button>
        </div>
      </div>
    </div>
  );
}
