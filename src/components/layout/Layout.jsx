import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

const Layout = ({ children, activeItem, setActiveItem }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <TopNav />
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      <main className="flex-1 w-full md:pl-64 flex flex-col items-center bg-background pb-20 md:pb-0">
        <div className="w-full max-w-container-max px-gutter pt-7 pb-stack-lg flex flex-col gap-6">
          {children}
        </div>
      </main>
      <BottomNav activeItem={activeItem} setActiveItem={setActiveItem} />
    </div>
  );
};

export default Layout;