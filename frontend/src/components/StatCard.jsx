import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle, trend }) => {
  const colorMap = {
    indigo: {
      icon: 'bg-indigo-100 text-indigo-600',
      value: 'text-indigo-700',
      ring: 'ring-indigo-100',
    },
    emerald: {
      icon: 'bg-emerald-100 text-emerald-600',
      value: 'text-emerald-700',
      ring: 'ring-emerald-100',
    },
    amber: {
      icon: 'bg-amber-100 text-amber-600',
      value: 'text-amber-700',
      ring: 'ring-amber-100',
    },
    blue: {
      icon: 'bg-blue-100 text-blue-600',
      value: 'text-blue-700',
      ring: 'ring-blue-100',
    },
    red: {
      icon: 'bg-red-100 text-red-600',
      value: 'text-red-700',
      ring: 'ring-red-100',
    },
    violet: {
      icon: 'bg-violet-100 text-violet-600',
      value: 'text-violet-700',
      ring: 'ring-violet-100',
    },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest truncate">{title}</p>
          <p className={`text-3xl font-extrabold mt-2 ${c.value} transition-all`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1.5 font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`p-3.5 rounded-xl ${c.icon} ml-4 flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
