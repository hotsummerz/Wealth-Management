import React from 'react';

const TopNav = () => {
  return (
    <nav className="md:hidden bg-surface/90 backdrop-blur-xl text-primary font-body-md text-body-md w-full sticky top-0 z-50 border-b border-outline-variant shadow-sm flex items-center px-gutter py-4">
      <div className="font-headline-md text-headline-md font-bold text-primary">AkuKaya</div>
    </nav>
  );
};

export default TopNav;