import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Briefcase,
  ClipboardList, Users2, FileText, Key, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard',        roles: [1, 2, 3] },
  { to: '/users',           icon: Users,           label: 'Pengguna',         roles: [1, 2, 3] },
  { to: '/divisi',          icon: Building2,       label: 'Divisi',           roles: [1, 2, 3] },
  { to: '/jabatan',         icon: Briefcase,       label: 'Jabatan',          roles: [1, 2, 3] },
  { to: '/program-kerja',   icon: ClipboardList,   label: 'Program Kerja',    roles: [1, 2, 3] },
  { to: '/kepanitiaan',     icon: Users2,          label: 'Kepanitiaan',      roles: [1, 2, 3] },
  { to: '/laporan-kegiatan',icon: FileText,        label: 'Laporan Kegiatan', roles: [1, 2, 3] },
  { to: '/invite-code',     icon: Key,             label: 'Invite Code',      roles: [1] },     // Admin only
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const visibleItems = navItems.filter(item =>
    user?.id_role && item.roles.includes(user.id_role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed left-0 top-0 h-full w-64 bg-slate-900 z-50 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
              <ClipboardList size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">SIPROKER</p>
              <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">POINTER</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white lg:hidden transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Menu Utama</p>
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={17}
                    className={isActive ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-300'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight size={13} className="text-indigo-300" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info footer */}
        <div className="px-4 py-4 border-t border-slate-700/60 flex-shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-slate-200 text-xs font-semibold truncate">{user?.nama}</p>
              <p className="text-slate-500 text-[10px] truncate">{user?.username}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
