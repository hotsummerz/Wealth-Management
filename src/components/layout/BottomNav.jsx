import React from 'react';

const BottomNav = ({ activeItem, setActiveItem }) => {
  const navItems = [
    { id: 'Home', icon: 'home', label: 'Home' },
    { id: 'Tabungan', icon: 'account_balance_wallet', label: 'Tabungan' },
    { id: 'Analisis', icon: 'analytics', label: 'Analisis' },
    { id: 'Setting', icon: 'settings', label: 'Setting' },
  ];

  return (
    <nav className="md:hidden bg-surface/95 backdrop-blur-xl border-t border-outline-variant w-full fixed bottom-0 z-50 flex justify-around items-center px-4 py-3 pb-safe">
      {navItems.map((item) => {
        const isActive = activeItem === item.id;
        return (
          <button 
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>
              {item.icon}
            </span>
            <span className={`font-label-caps text-[10px] ${isActive ? 'font-bold' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;