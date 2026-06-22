import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function SettingPage({ user, onLogout }) {
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      const currentUsername = user.user_metadata?.username || user.email.split('@')[0] || 'User';
      setUsername(currentUsername);
      setNewUsername(currentUsername);
    }
    setLoading(false);
  }, [user]);

  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || newUsername === username) return;
    
    setSaving(true);
    setMessage('');
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { username: newUsername.trim() }
      });
      
      if (error) throw error;
      
      setUsername(newUsername.trim());
      setMessage('Username updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

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

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg ${message.includes('success') ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
          {message}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-surface-container rounded-xl p-6 mb-6">
        <h3 className="font-label-md text-label-md text-on-surface mb-4">Profile</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container font-bold text-2xl">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-body-md text-body-md text-on-surface">{username}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">{user.email}</div>
          </div>
        </div>

        {/* Edit Username */}
        <div className="border-t border-outline-variant pt-4">
          <label className="block text-sm font-medium text-on-surface mb-2">
            Username
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="flex-1 px-4 py-2 bg-surface border border-outline rounded-lg text-on-surface focus:outline-none focus:border-primary"
              placeholder="Enter new username"
            />
            <button
              onClick={handleUpdateUsername}
              disabled={saving || !newUsername.trim() || newUsername === username}
              className="px-6 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
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
