import React from 'react';
import { LogOut, Menu, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between z-30 flex-shrink-0">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          id="sidebar-toggle"
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <p className="text-sm text-slate-500">
            Selamat datang kembali, <span className="font-semibold text-slate-800">{user?.nama}</span>
          </p>
        </div>
      </div>

      {/* Right: user info + logout */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
            {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-700 leading-tight">{user?.nama}</p>
            <div className="mt-0.5">
              <StatusBadge status={user?.nama_role || 'viewer'} />
            </div>
          </div>
        </div>

        <button
          id="logout-btn"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          title="Keluar"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
