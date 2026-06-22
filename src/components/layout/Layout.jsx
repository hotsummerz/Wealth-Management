import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

const Layout = ({ children, activeItem, setActiveItem }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile TopNav */}
      <TopNav />
      {/* Desktop Sidebar + Main content row */}
      <div className="flex">
        <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
        <main className="flex-1 w-full md:pl-64 bg-background pb-20 md:pb-0">
          <div className="w-full max-w-container-max px-4 md:px-gutter pt-7 pb-stack-lg flex flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
      {/* Mobile BottomNav */}
      <BottomNav activeItem={activeItem} setActiveItem={setActiveItem} />
    </div>
  );
};

export default Layout;