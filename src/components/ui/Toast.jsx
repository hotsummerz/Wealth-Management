import React from 'react';

const Toast = ({ message }) => {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
      <div className="bg-primary-container text-on-primary font-semibold px-6 py-3 rounded-full shadow-lg flex items-center gap-2 border border-outline-variant">
        <span className="material-symbols-outlined">check_circle</span>
        {message}
      </div>
    </div>
  );
};

export default Toast;