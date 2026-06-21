import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const formatIDR = (amount) =>
  `Rp ${amount.toLocaleString('id-ID')}`;

const calcChange = (current, previous) => {
  if (previous === 0 && current === 0) return { value: 0, label: '0%', isNew: false };
  if (previous === 0 && current > 0) return { value: 100, label: 'New', isNew: true };
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const sign = pct >= 0 ? '+' : '';
  return { value: pct, label: `${sign}${pct.toFixed(1)}%`, isNew: false };
};

const BalanceCard = ({ refreshKey }) => {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [monthly, setMonthly] = useState({ income: 0, expense: 0 });
  const [prevMonthly, setPrevMonthly] = useState({ income: 0, expense: 0 });
  const [prevBalance, setPrevBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getSummary(), api.getTransactions()])
      .then(([sumRes, txRes]) => {
        if (sumRes.success) setSummary(sumRes.data);
        if (txRes.success) {
          const now = new Date();
          const currentMonthStr = now.toISOString().slice(0, 7);
          const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const prevMonthStr = prevDate.toISOString().slice(0, 7);

          let curIncome = 0, curExpense = 0;
          let prvIncome = 0, prvExpense = 0;

          txRes.data.forEach(trx => {
            const month = trx.created_at.slice(0, 7);
            if (month === currentMonthStr) {
              if (trx.type === 'income') curIncome += trx.amount;
              if (trx.type === 'expense') curExpense += trx.amount;
            } else if (month === prevMonthStr) {
              if (trx.type === 'income') prvIncome += trx.amount;
              if (trx.type === 'expense') prvExpense += trx.amount;
            }
          });

          setMonthly({ income: curIncome, expense: curExpense });
          setPrevMonthly({ income: prvIncome, expense: prvExpense });

          // Previous balance = all-time balance minus current month net
          if (sumRes.success) {
            const currentNet = curIncome - curExpense;
            setPrevBalance(sumRes.data.balance - currentNet);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const balanceChange = calcChange(summary.balance, prevBalance);
  const incomeChange = calcChange(monthly.income, prevMonthly.income);
  const expenseChange = calcChange(monthly.expense, prevMonthly.expense);

  // Progress bars: income ratio of total flow, expense ratio of income
  const totalFlow = monthly.income + monthly.expense;
  const incomePercent = totalFlow > 0 ? Math.round((monthly.income / totalFlow) * 100) : 0;
  const expensePercent = monthly.income > 0 ? Math.min(100, Math.round((monthly.expense / monthly.income) * 100)) : 0;

  const ChangeChip = ({ change }) => {
    if (change.isNew) {
      return <span className="chip-info px-2 py-0.5 rounded-full text-xs font-semibold">New</span>;
    }
    const isPositive = change.value >= 0;
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isPositive ? 'chip-success' : 'chip-error'}`}>
        {change.label}
      </span>
    );
  };

  return (
    <>
      {/* Total Balance */}
      <section className="glass-card rounded-lg p-6 flex flex-col justify-between min-h-[180px]">
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase">Total Balance</h2>
          <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full text-[20px]">account_balance_wallet</span>
        </div>
        {loading ? (
          <div className="h-10 w-48 bg-surface-bright rounded animate-pulse" />
        ) : (
          <div className="font-currency-nominal-lg text-currency-nominal-lg text-on-surface">
            {formatIDR(summary.balance)}
          </div>
        )}
        <div className="flex items-center gap-2 mt-3">
          <ChangeChip change={balanceChange} />
          <span className="text-on-surface-variant text-xs">vs last month</span>
        </div>
      </section>

      {/* Monthly Income */}
      <section className="glass-card rounded-lg p-6 flex flex-col justify-between min-h-[180px]">
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase">Monthly Income</h2>
          <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-full text-[20px]">arrow_downward</span>
        </div>
        {loading ? (
          <div className="h-10 w-32 bg-surface-bright rounded animate-pulse" />
        ) : (
          <div className="font-currency-nominal-lg text-currency-nominal-lg text-on-surface">
            {formatIDR(monthly.income)}
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <ChangeChip change={incomeChange} />
          <span className="text-on-surface-variant text-xs">vs last month</span>
        </div>
        <div className="mt-3">
          <div className="progress-bar">
            <div className="bg-secondary h-full rounded-full transition-all duration-700" style={{ width: `${incomePercent}%` }} />
          </div>
        </div>
      </section>

      {/* Monthly Expenses */}
      <section className="glass-card rounded-lg p-6 flex flex-col justify-between min-h-[180px]">
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase">Monthly Expenses</h2>
          <span className="material-symbols-outlined text-error bg-error/10 p-2 rounded-full text-[20px]">arrow_upward</span>
        </div>
        {loading ? (
          <div className="h-10 w-32 bg-surface-bright rounded animate-pulse" />
        ) : (
          <div className="font-currency-nominal-lg text-currency-nominal-lg text-on-surface">
            {formatIDR(monthly.expense)}
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <ChangeChip change={expenseChange} />
          <span className="text-on-surface-variant text-xs">vs last month</span>
        </div>
        <div className="mt-3">
          <div className="progress-bar">
            <div className="bg-error h-full rounded-full transition-all duration-700" style={{ width: `${expensePercent}%` }} />
          </div>
        </div>
      </section>
    </>
  );
};

export default BalanceCard;
