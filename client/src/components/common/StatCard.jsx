import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, badge, color = 'cyan' }) {
  const colorMap = {
    cyan: 'border-cyan-500/20 bg-cyan-950/20 text-cyan-400',
    emerald: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-400',
    amber: 'border-amber-500/20 bg-amber-950/20 text-amber-400',
    rose: 'border-rose-500/20 bg-rose-950/20 text-rose-400',
    blue: 'border-blue-500/20 bg-blue-950/20 text-blue-400'
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur shadow-sm hover:border-slate-700 transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorMap[color] || colorMap.cyan}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        {badge && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
    </div>
  );
}
