import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PackagePlus, ArrowLeftRight, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
  { to: '/purchases', label: 'Purchases', icon: PackagePlus, roles: ['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER'] },
  { to: '/transfers', label: 'Transfers', icon: ArrowLeftRight, roles: ['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER'] },
  { to: '/assignments', label: 'Assignments & Expenditures', icon: ClipboardList, roles: ['ADMIN', 'BASE_COMMANDER'] },
];

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="w-60 bg-slate-950 text-slate-300 h-full flex-shrink-0 hidden md:flex flex-col py-6">
      <nav className="flex flex-col gap-1 px-3">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition ${
                isActive ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
