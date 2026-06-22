import React from 'react';

const Header = ({ user }) => {
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  
  return (
    <header className="flex flex-col gap-1">
      <h1 className="font-headline-md text-[24px] text-on-surface font-semibold leading-8">Dashboard</h1>
      <p className="text-[14px] text-on-surface-variant">Welcome back, {username}</p>
    </header>
  );
};

export default Header;