import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const CATEGORY_ICONS = {
  'Makanan': 'restaurant',
  'Makan dan Minum': 'restaurant',
  'Jajan': 'icecream',
  'Game dan Top up': 'sports_esports',
  'Belanja': 'shopping_bag',
  'Parkir': 'local_parking',
  'Subscription': 'calendar_month',
  'Listrik': 'electric_bolt',
  'Kebutuhan Pokok Lainnya': 'inventory_2',
  'Gaji': 'work',
  'Bonus': 'card_giftcard',
  'Investasi': 'trending_up',
  'Freelance': 'laptop_mac',
  'default': 'receipt_long',
};

const CashflowChart = ({ refreshKey }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getTransactions()
      .then(res => {
        if (res.success) setTransactions(res.data.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <section className="glass-card rounded-lg p-5 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-headline-md text-[18px] text-on-surface font-bold">Recent Activities</h3>
      </div>

      {/* Activities List */}
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px] pr-1">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="bg-surface-container-high rounded-lg p-4 animate-pulse min-h-[64px]" />
          ))
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant gap-2">
            <span className="material-symbols-outlined text-4xl">receipt_long</span>
            <p className="text-sm">No recent activities</p>
          </div>
        ) : (
          transactions.map(trx => {
            const isIncome = trx.type === 'income';
            const icon = CATEGORY_ICONS[trx.category] || CATEGORY_ICONS.default;
            return (
              <div key={trx.id} className="bg-surface-container-high rounded-lg p-4 flex justify-between items-center border border-outline-variant/50 hover:border-outline transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg flex items-center justify-center ${isIncome ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'}`}>
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-md text-[14px] text-on-surface font-medium">{trx.category}</span>
                    <span className="text-[11px] text-on-surface-variant">
                      {trx.note ? `${trx.note} • ` : ''}{formatTime(trx.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`font-data-mono text-[14px] font-semibold ${isIncome ? 'text-secondary' : 'text-error'}`}>
                    {isIncome ? '+' : '-'}Rp {trx.amount.toLocaleString('id-ID')}
                  </span>
                  <span className="chip-success px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                    {isIncome ? 'Cleared' : 'Completed'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default CashflowChart;