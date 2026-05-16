'use client';

interface HiveCellProps {
  agentName: string;
  statusScore: number;
  role: string;
}

export function HiveCell({ agentName, statusScore, role }: HiveCellProps) {
  const scoreColor =
    statusScore >= 75 ? 'text-emerald-400' :
    statusScore >= 50 ? 'text-amber-400' :
    'text-red-400';

  return (
    <div
      className="relative w-36 h-40 flex items-center justify-center bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300 cursor-pointer"
      style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
    >
      <div
        className="absolute inset-1 bg-slate-950 flex flex-col items-center justify-center p-4 text-center"
        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
      >
        <span className="text-amber-400 font-mono text-xs font-bold tracking-widest uppercase">
          {agentName}
        </span>
        <span className={`text-2xl font-bold mt-2 font-mono ${scoreColor}`}>
          {statusScore}%
        </span>
        <span className="text-[9px] text-slate-400 uppercase mt-1 tracking-wider">
          {role}
        </span>
      </div>
    </div>
  );
}
