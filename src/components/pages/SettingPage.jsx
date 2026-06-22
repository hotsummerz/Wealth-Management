import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function SettingPage({ user, onLogout }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setUsername(user.user_metadata?.username || user.email.split('@')[0] || 'User');
    }
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-2xl animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Settings</h2>

      {/* Profile Section */}
      <div className="bg-surface-container rounded-xl p-6 mb-6">
        <h3 className="font-label-md text-label-md text-on-surface mb-4">Profile</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container font-bold text-2xl">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-body-md text-body-md text-on-surface">{username}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">{user.email}</div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-surface-container rounded-xl p-6">
        <h3 className="font-label-md text-label-md text-on-surface mb-4">Account</h3>
        <button
          onClick={onLogout}
          className="w-full py-3 rounded-lg font-semibold text-sm text-error hover:bg-error/10 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </div>
  );
}
