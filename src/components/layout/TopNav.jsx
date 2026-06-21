import React from 'react';

const TopNav = () => {
  return (
    <nav className="md:hidden bg-surface/90 backdrop-blur-xl text-primary font-body-md text-body-md w-full sticky top-0 z-50 border-b border-outline-variant shadow-sm flex justify-between items-center px-gutter py-4">
      <div className="font-headline-md text-headline-md font-bold text-primary">AkuKaya</div>
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined cursor-pointer active:scale-95 duration-200 hover:text-primary transition-colors text-on-surface-variant font-medium">notifications</span>
        <img alt="User Profile Avatar" className="w-8 h-8 rounded-full border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA12q2Ucv2cvNhj4HJARjH_hdVQ-_kd9MJxGC15vqgzvcvvYH9-ucwQ_kM4zkn3ruR282UUZuioA30EiAEuKWhifDry7h8whWKwdveAdzBDuryHN38fVqwPXgVQCjYAc3CHoUrqyNaS724FrC2J61I1IAdH_mSXxDK1_CgDszgmoAHuH97squGaKT6t3jHf7t8xEKyY4PzyPc5XYAe7wxW5rCMUzePucwhVwNOsyc44VWAROCqLIEbzQgQbtkA27196lKIJHRcawJgp" />
      </div>
    </nav>
  );
};

export default TopNav;