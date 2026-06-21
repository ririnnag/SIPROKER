import React from 'react';

const StatusBadge = ({ status }) => {
  const config = {
    // User statuses
    active:   { label: 'Aktif',     cls: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' },
    pending:  { label: 'Pending',   cls: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' },
    rejected: { label: 'Ditolak',   cls: 'bg-red-100 text-red-700 ring-1 ring-red-200' },
    // Proker statuses
    rencana:  { label: 'Rencana',   cls: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' },
    berjalan: { label: 'Berjalan',  cls: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' },
    selesai:  { label: 'Selesai',   cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
    // Roles
    admin:    { label: 'Admin',     cls: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200' },
    editor:   { label: 'Editor',    cls: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200' },
    viewer:   { label: 'Viewer',    cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
    // Invite code
    true:     { label: 'Aktif',     cls: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' },
    false:    { label: 'Nonaktif',  cls: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200' },
  };

  const key = typeof status === 'boolean' ? String(status) : status;
  const { label, cls } = config[key] || { label: status, cls: 'bg-slate-100 text-slate-600' };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
