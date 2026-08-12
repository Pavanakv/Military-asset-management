import React from 'react';
import { ShieldHalf, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const roleLabels = {
  ADMIN: 'Administrator',
  BASE_COMMANDER: 'Base Commander',
  LOGISTICS_OFFICER: 'Logistics Officer',
};

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shadow-md z-10">
      <div className="flex items-center gap-2">
        <ShieldHalf className="w-6 h-6 text-emerald-400" />
        <span className="font-bold tracking-wide">Military Asset Management</span>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-tight">{user.username}</p>
            <p className="text-xs text-slate-400 leading-tight">{roleLabels[user.role] || user.role}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
