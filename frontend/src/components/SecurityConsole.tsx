'use client';

import { useState } from 'react';

interface SecurityConsoleProps {
  logs: string[];
}

export function SecurityConsole({ logs }: SecurityConsoleProps) {
  return (
    <div className="bg-slate-950 border border-slate-700 rounded-lg p-6 mb-8">
      <h2 className="text-lg font-mono font-bold text-amber-400 mb-4">
        💻 LIVE FIREWALL SECURITY LOG STREAM
      </h2>
      <div className="bg-black rounded p-4 h-96 overflow-y-auto font-mono text-sm space-y-1">
        {logs.length === 0 ? (
          <div className="text-slate-500">Waiting for transactions...</div>
        ) : (
          logs.map((log, index) => {
            const isError = log.includes('❌') || log.includes('REVERT');
            const isSuccess = log.includes('✅') || log.includes('PASS');
            const color = isError ? 'text-red-400' : isSuccess ? 'text-emerald-400' : 'text-slate-400';
            return (
              <div key={index} className={color}>
                {log}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
