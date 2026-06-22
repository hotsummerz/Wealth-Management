import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import Header from './components/dashboard/Header';
import BalanceCard from './components/dashboard/BalanceCard';
import QuickActions from './components/dashboard/QuickActions';
import CashflowChart from './components/dashboard/CashflowChart';
import TabunganPage from './components/pages/TabunganPage';
import AnalisisPage from './components/pages/AnalisisPage';
import Toast from './components/ui/Toast';
import InstallPrompt from './components/ui/InstallPrompt';

function App() {
  const [activeItem, setActiveItem] = useState('Home');
  const [toastMessage, setToastMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleQuickTxSaved = () => {
    setRefreshKey(k => k + 1);
    showToast('Transaction saved!');
  };

  return (
    <Layout activeItem={activeItem} setActiveItem={setActiveItem}>
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
    </Layout>
  );
}

export default App;