import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Header from './components/dashboard/Header';
import BalanceCard from './components/dashboard/BalanceCard';
import QuickActions from './components/dashboard/QuickActions';
import CashflowChart from './components/dashboard/CashflowChart';
import TabunganPage from './components/pages/TabunganPage';
import AnalisisPage from './components/pages/AnalisisPage';
import Toast from './components/ui/Toast';
import InstallPrompt from './components/ui/InstallPrompt';
import AuthPage from './components/auth/AuthPage';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { supabase } from './lib/supabase';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState('Home');
  const [toastMessage, setToastMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleQuickTxSaved = () => {
    setRefreshKey(k => k + 1);
    showToast('Transaction saved!');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-on-surface">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={setUser} />;
  }

  return (
    <Layout activeItem={activeItem} setActiveItem={setActiveItem} user={user} onLogout={handleLogout}>
      {activeItem === 'Home' && (
        <div className="w-full flex flex-col gap-6">
          <Header />

          {/* 3 Metric Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BalanceCard refreshKey={refreshKey} />
          </div>

          {/* Quick Log + Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickActions onTxSaved={handleQuickTxSaved} />
            <CashflowChart refreshKey={refreshKey} />
          </div>
        </div>
      )}

      {activeItem === 'Tabungan' && (
        <TabunganPage
          refreshKey={refreshKey}
          onRefresh={() => {
            setRefreshKey(k => k + 1);
            showToast('Savings updated!');
          }}
        />
      )}

      {activeItem === 'Analisis' && (
        <AnalisisPage
          refreshKey={refreshKey}
          onRefresh={() => {
            setRefreshKey(k => k + 1);
            showToast('Transaction deleted!');
          }}
        />
      )}

      {activeItem !== 'Home' && activeItem !== 'Tabungan' && activeItem !== 'Analisis' && (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-outline-variant rounded-lg text-on-surface-variant gap-3">
          <span className="material-symbols-outlined text-4xl">construction</span>
          <p className="font-body-md text-body-md">The <strong>{activeItem}</strong> page is under construction.</p>
        </div>
      )}

      {toastMessage && <Toast message={toastMessage} />}
      <InstallPrompt />
      <SpeedInsights />
    </Layout>
  );
}

export default App;