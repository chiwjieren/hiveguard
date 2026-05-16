'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWalletTransactionHistory, TransactionRecord } from '@/utils/etherscan';

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      // MVP: Use mock data. In production, would pass real wallet address
      const history = await getWalletTransactionHistory('0x0000000000000000000000000000000000000000');
      setTransactions(history);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-400 mb-2">📋 Transaction History</h1>
          <p className="text-slate-400">All HiveGuard audited transactions</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading transaction history...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
            <p className="text-slate-400 mb-4">No transactions found</p>
            <Link href="/" className="text-amber-400 hover:text-amber-300">
              ← Back to Live Lab
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700">
                  <th className="px-6 py-4 text-left font-semibold text-slate-300">TX Hash</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-300">Target</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-300">Score</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx.txHash}
                    className="border-b border-slate-700 hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <code className="text-xs text-amber-400">
                        {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-slate-300">
                        {tx.target.slice(0, 10)}...{tx.target.slice(-8)}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          tx.consensusScore >= 80
                            ? 'bg-emerald-900 text-emerald-300'
                            : tx.consensusScore >= 50
                            ? 'bg-amber-900 text-amber-300'
                            : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {tx.consensusScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          tx.status === 'Released'
                            ? 'bg-emerald-900 text-emerald-300'
                            : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {tx.status === 'Released' ? '✅' : '❌'} {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/transaction/${tx.txHash}`}
                        className="text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-slate-400 hover:text-amber-400 transition-colors">
            ← Back to Live Lab
          </Link>
        </div>
      </div>
    </div>
  );
}
