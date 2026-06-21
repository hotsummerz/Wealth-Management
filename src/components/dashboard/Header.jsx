import React from 'react';

const Header = () => {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="font-headline-md text-[24px] text-on-surface font-semibold leading-8">Dashboard</h1>
      <p className="text-[14px] text-on-surface-variant">Welcome back, User</p>
    </header>
  );
};

export default Header;