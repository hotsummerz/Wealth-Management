import React from 'react';
import { supabase } from '../../../lib/supabase';

const Sidebar = ({ activeItem, setActiveItem, user }) => {
  const navItems = [
    { id: 'Home', icon: 'home', label: 'Home' },
    { id: 'Tabungan', icon: 'account_balance_wallet', label: 'Tabungan' },
    { id: 'Analisis', icon: 'analytics', label: 'Analisis' },
  ];

  return (
    <aside className="hidden md:flex flex-col bg-surface text-on-surface font-body-md text-body-md h-screen w-64 fixed left-0 top-0 z-40 border-r border-outline-variant shadow-lg p-6 gap-stack-md">
      {/* Brand */}
      <div className="mt-2 mb-2">
        <div className="font-headline-md text-headline-md font-bold text-primary mb-1">AkuKaya</div>
        <div className="font-label-caps text-label-caps text-on-surface-variant">WEALTH MANAGEMENT</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`flex items-center w-full text-left gap-3 px-4 py-3 rounded-md transition-all active:scale-98 ${
                isActive
                  ? 'nav-active'
                  : 'text-on-surface-variant hover:bg-surface-bright hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom - User info & Logout */}
      <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-outline-variant">
        <div className="px-4 py-2 text-sm text-on-surface-variant truncate">
          {user?.email}
        </div>
        <button
          onClick={() => setActiveItem('Setting')}
          className={`flex items-center w-full text-left gap-3 px-4 py-3 rounded-md transition-all ${
            activeItem === 'Setting'
              ? 'nav-active'
              : 'text-on-surface-variant hover:bg-surface-bright hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined">settings</span>
          Setting
        </button>
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center w-full text-left gap-3 px-4 py-3 rounded-md transition-all text-error hover:bg-error/10"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;