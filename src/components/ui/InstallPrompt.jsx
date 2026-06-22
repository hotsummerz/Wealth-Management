import React, { useState, useEffect } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 z-[300] animate-slide-up">
      <div className="bg-surface-bright border border-outline-variant rounded-lg p-4 shadow-xl flex items-center gap-3 max-w-xs">
        <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-[24px]">install_mobile</span>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <p className="text-on-surface text-sm font-semibold">Install AkuKaya</p>
          <p className="text-on-surface-variant text-xs">Add to home screen for quick access</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setShowPrompt(false)}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <button
            onClick={handleInstall}
            className="bg-primary-container text-on-primary px-3 py-1.5 rounded-lg text-xs font-semibold hover:brightness-110 transition-all"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
