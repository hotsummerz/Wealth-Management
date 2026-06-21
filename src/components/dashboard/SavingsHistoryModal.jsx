import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const formatIDR = (amount) => `Rp ${Math.abs(amount).toLocaleString('id-ID')}`;

const SavingsHistoryModal = ({ pocket, onClose }) => {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPocketDetail(pocket.id)
      .then(res => {
        if (res.success) setSavings(res.data.savings || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pocket.id]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-bright w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl shadow-2xl border border-outline-variant overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-outline-variant">
          <div className="flex flex-col">
            <h2 className="font-headline-md text-[18px] text-on-surface">Savings History</h2>
            <p className="text-[12px] text-on-surface-variant mt-0.5">{pocket.name}</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto flex flex-col gap-3">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="bg-surface-container-high rounded-lg p-4 animate-pulse min-h-[60px]" />
            ))
          ) : savings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant gap-2">
              <span className="material-symbols-outlined text-4xl">history</span>
              <p className="text-sm">No savings history yet</p>
            </div>
          ) : (
            savings.map((entry) => {
              const dateStr = new Date(entry.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric'
              });
              const timeStr = new Date(entry.created_at).toLocaleTimeString('id-ID', {
                hour: '2-digit', minute: '2-digit'
              });
              return (
                <div key={entry.id} className="bg-surface-container-high rounded-lg p-4 flex justify-between items-center border border-outline-variant/30">
                  <div className="flex flex-col gap-1">
                    <span className="text-on-surface text-[14px] font-medium">{dateStr}</span>
                    <span className="text-on-surface-variant text-[11px]">{timeStr}{entry.note ? ` • ${entry.note}` : ''}</span>
                  </div>
                  <span className={`font-data-mono text-[14px] font-semibold ${entry.amount >= 0 ? 'text-secondary' : 'text-error'}`}>
                    {entry.amount >= 0 ? '+' : '-'}{formatIDR(entry.amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant flex justify-between items-center">
          <span className="text-on-surface-variant text-xs">{savings.length} entries</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-medium text-sm border border-outline-variant/50 hover:bg-surface-container-highest transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavingsHistoryModal;
