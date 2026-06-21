import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const CHART_COLORS = ['#818cf8', '#4edea3', '#fbbf24', '#f472b6', '#ef4444', '#38bdf8', '#a78bfa', '#fb923c'];

const formatIDR = (amount) =>
  `Rp ${amount.toLocaleString('id-ID')}`;

const formatIDRCompact = (amount) => {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  return `Rp ${amount.toFixed(0)}`;
};

const calcChange = (current, previous) => {
  if (previous === 0 && current === 0) return { value: 0, label: '0%', isNew: false };
  if (previous === 0 && current > 0) return { value: 100, label: 'New', isNew: true };
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const sign = pct >= 0 ? '+' : '';
  return { value: pct, label: `${sign}${pct.toFixed(1)}%`, isNew: false };
};

const AnalisisPage = ({ refreshKey, onRefresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [totalPortfolio, setTotalPortfolio] = useState(0);
  const [prevMonthly, setPrevMonthly] = useState({ income: 0, expense: 0 });
  const [prevBalance, setPrevBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [periodType, setPeriodType] = useState('month'); // month | week | all
  const [periodValue, setPeriodValue] = useState(''); // e.g. '2026-06' or '2026-06-15'
  const [sortOrder, setSortOrder] = useState('desc'); // desc | asc

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, sumRes, pocketRes] = await Promise.all([
        api.getTransactions(),
        api.getSummary(),
        api.getPockets()
      ]);
      if (txRes.success) setTransactions(txRes.data);
      if (sumRes.success) setSummary({ income: 0, expense: 0, balance: sumRes.data.balance });
      if (pocketRes.success) {
        const total = pocketRes.data.reduce((sum, p) => sum + p.current_amount, 0);
        setTotalPortfolio(total);
      }
      // Calculate monthly and previous monthly
      if (txRes.success) {
        const now = new Date();
        const currentMonthStr = now.toISOString().slice(0, 7);
        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthStr = prevDate.toISOString().slice(0, 7);
        let income = 0, expense = 0;
        let prvIncome = 0, prvExpense = 0;
        txRes.data.forEach(trx => {
          const month = trx.created_at.slice(0, 7);
          if (month === currentMonthStr) {
            if (trx.type === 'income') income += trx.amount;
            if (trx.type === 'expense') expense += trx.amount;
          } else if (month === prevMonthStr) {
            if (trx.type === 'income') prvIncome += trx.amount;
            if (trx.type === 'expense') prvExpense += trx.amount;
          }
        });
        setSummary(s => ({ ...s, income, expense }));
        setPrevMonthly({ income: prvIncome, expense: prvExpense });
        if (sumRes.success) {
          setPrevBalance(sumRes.data.balance - (income - expense));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getExpenseChartData = () => {
    const expensesMap = {};
    getFilteredTransactions().forEach(trx => {
      if (trx.type === 'expense') {
        expensesMap[trx.category] = (expensesMap[trx.category] || 0) + trx.amount;
      }
    });
    return Object.keys(expensesMap)
      .map(category => ({ name: category, value: expensesMap[category] }))
      .sort((a, b) => b.value - a.value);
  };

  // Generate available periods from transaction data
  const getAvailablePeriods = () => {
    const months = new Set();
    const weeks = new Set();
    const years = new Set();
    transactions.forEach(trx => {
      const d = new Date(trx.created_at);
      const monthStr = d.toISOString().slice(0, 7);
      const yearStr = d.toISOString().slice(0, 4);
      months.add(monthStr);
      years.add(yearStr);
      // Get week start (Monday)
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(d.setDate(diff));
      weeks.add(weekStart.toISOString().slice(0, 10));
    });
    return {
      months: [...months].sort().reverse(),
      weeks: [...weeks].sort().reverse(),
      years: [...years].sort().reverse(),
    };
  };

  // Filter transactions by selected period
  const getFilteredTransactions = () => {
    if (periodType === 'all' || !periodValue) return transactions;
    return transactions.filter(trx => {
      const d = new Date(trx.created_at);
      if (periodType === 'month') {
        return trx.created_at.slice(0, 7) === periodValue;
      }
      if (periodType === 'week') {
        const weekStart = new Date(periodValue);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return d >= weekStart && d < weekEnd;
      }
      if (periodType === 'year') {
        return trx.created_at.slice(0, 4) === periodValue;
      }
      return true;
    });
  };

  // Get the total expense for the selected period (for donut center + percentages)
  const getFilteredExpenseTotal = () => {
    return getFilteredTransactions()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      const res = await api.deleteTransaction(id);
      if (res.success) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    const headers = ['Date,Description,Category,Amount'];
    const rows = transactions.map(trx => {
      const date = new Date(trx.created_at).toLocaleDateString('en-US');
      return `${date},${trx.category},${trx.category},${trx.type === 'income' ? '' : '-'}${trx.amount}`;
    });
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'transactions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const availablePeriods = getAvailablePeriods();
  const chartData = getExpenseChartData();
  const filteredExpenseTotal = getFilteredExpenseTotal();
  const periodFilteredTx = getFilteredTransactions();
  const typeFilteredTx = filterType === 'all' ? periodFilteredTx : periodFilteredTx.filter(t => t.type === filterType);
  const sortedTx = [...typeFilteredTx].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const handlePieMouseMove = (data, index, e) => {
    if (data) {
      const chartContainer = e?.currentTarget?.closest('.h-56');
      if (chartContainer) {
        const rect = chartContainer.getBoundingClientRect();
        // Mouse position relative to container
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        // Center of the container
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        // Determine which side the mouse is on
        const isRight = mouseX >= centerX;
        const isBottom = mouseY >= centerY;
        // Offset tooltip away from center (same side as mouse) with some padding
        const offsetX = isRight ? 16 : -16;
        const offsetY = isBottom ? 16 : -16;

        setHoveredSlice(data);
        setTooltipPos({
          x: mouseX + offsetX,
          y: mouseY + offsetY,
          anchorX: isRight ? 'left' : 'right',
          anchorY: isBottom ? 'top' : 'bottom',
        });
      } else {
        setHoveredSlice(data);
        setTooltipPos({ x: 0, y: 0, anchorX: 'left', anchorY: 'top' });
      }
    }
  };

  const handlePieMouseLeave = () => {
    setHoveredSlice(null);
  };

  const portfolioChange = calcChange(totalPortfolio, 0); // no historical pocket data, show as-is
  const incomeChange = calcChange(summary.income, prevMonthly.income);
  const expenseChange = calcChange(summary.expense, prevMonthly.expense);
  const balanceChange = calcChange(summary.balance, prevBalance);

  const kpiCards = [
    { icon: 'account_balance', label: 'Total Portfolio', value: totalPortfolio, color: 'text-primary', change: portfolioChange },
    { icon: 'trending_up', label: 'Monthly Income', value: summary.income, color: 'text-secondary', change: incomeChange },
    { icon: 'trending_down', label: 'Monthly Expenses', value: summary.expense, color: 'text-error', change: expenseChange },
    { icon: 'liquor', label: 'Liquid Cash', value: summary.balance, color: 'text-tertiary', change: balanceChange },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Title + Period Selector */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="font-headline-md text-[24px] text-on-surface font-semibold leading-8">Analisis Finansial</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period Dropdown */}
          {periodType !== 'all' && (
            <select
              value={periodValue}
              onChange={(e) => setPeriodValue(e.target.value)}
              className="bg-surface-container-high border border-outline-variant rounded-lg py-1.5 px-3 text-on-surface text-xs focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">Select {periodType}...</option>
              {(periodType === 'month' ? availablePeriods.months : periodType === 'week' ? availablePeriods.weeks : availablePeriods.years).map(p => {
                const d = new Date(p);
                let label;
                if (periodType === 'month') label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                else if (periodType === 'week') label = `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                else label = p; // year string like '2026'
                return <option key={p} value={p}>{label}</option>;
              })}
            </select>
          )}
          {/* Period Type Toggle */}
          <div className="flex bg-surface-container-high rounded-lg p-1 border border-outline-variant/50">
            {[
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' },
              { id: 'year', label: 'Year' },
              { id: 'all', label: 'All' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => { setPeriodType(p.id); setPeriodValue(p.id === 'all' ? '' : ''); }}
                className={`px-3 py-1.5 text-center rounded-md text-xs font-semibold transition-all ${
                  periodType === p.id ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => (
          <div key={idx} className="glass-card rounded-lg p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-surface-bright p-2 rounded-lg">
                <span className={`material-symbols-outlined text-[18px] ${card.color}`}>{card.icon}</span>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant uppercase font-semibold">{card.label}</p>
            {loading ? (
              <div className="h-7 w-24 bg-surface-bright rounded animate-pulse" />
            ) : (
              <p className={`text-[22px] font-bold ${card.color}`}>{formatIDRCompact(card.value)}</p>
            )}
            {card.change && (
              <div className="flex items-center gap-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  card.change.isNew ? 'chip-info' : card.change.value >= 0 ? 'chip-success' : 'chip-error'
                }`}>{card.change.label}</span>
                <span className="text-on-surface-variant text-[10px]">vs last month</span>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Chart + Top Expenses */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="glass-card rounded-lg p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-headline-md text-[18px] text-on-surface font-bold">Expense Distribution</h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">By main category {periodType !== 'all' && periodValue ? `(${periodType === 'month' ? new Date(periodValue).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : periodType === 'week' ? `Week of ${new Date(periodValue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : periodValue})` : '(All time)'}</p>
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant text-xs font-medium hover:bg-surface-bright transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">download</span>
              Export
            </button>
          </div>

          <div className="h-56 w-full relative" onMouseLeave={handlePieMouseLeave}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={chartData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={55} 
                    outerRadius={75} 
                    paddingAngle={4} 
                    dataKey="value" 
                    stroke="none"
                    onMouseMove={handlePieMouseMove}
                    onMouseLeave={handlePieMouseLeave}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2">pie_chart</span>
                <p className="text-sm">No expense data this month</p>
              </div>
            )}
            {chartData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Total</span>
                <span className="text-[16px] font-bold text-on-surface">{formatIDRCompact(filteredExpenseTotal)}</span>
              </div>
            )}
            {hoveredSlice && (
              <div 
                className="absolute bg-surface-bright border border-outline-variant p-3 rounded-lg shadow-xl pointer-events-none z-50 whitespace-nowrap"
                style={tooltipPos.x > 0 ? {
                  left: `${tooltipPos.x}px`,
                  top: `${tooltipPos.y}px`,
                  transform: `translate(${tooltipPos.anchorX === 'right' ? '-100%' : '0'}, ${tooltipPos.anchorY === 'bottom' ? '-100%' : '0'})`,
                } : {
                  right: '16px',
                  top: '16px'
                }}
              >
                <p className="text-[11px] text-on-surface-variant mb-1">{hoveredSlice.name}</p>
                <p className="text-[14px] text-on-surface font-semibold">{formatIDR(hoveredSlice.value)}</p>
              </div>
            )}
          </div>

          {/* Legend */}
          {chartData.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              {chartData.map((item, idx) => {
                const percent = filteredExpenseTotal > 0 ? Math.round((item.value / filteredExpenseTotal) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      <span className="text-on-surface text-[13px]">{item.name}</span>
                    </div>
                    <span className="text-on-surface-variant text-[12px] font-medium">{percent}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Expenses List */}
        <div className="glass-card rounded-lg p-6 flex flex-col gap-4">
          <h3 className="font-headline-md text-[18px] text-on-surface font-bold">Top Expenses List</h3>
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[400px] pr-1">
            {chartData.length > 0 ? chartData.map((item, idx) => {
              const color = CHART_COLORS[idx % CHART_COLORS.length];
              const percent = filteredExpenseTotal > 0 ? Math.round((item.value / filteredExpenseTotal) * 100) : 0;
              return (
                <div key={item.name} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-on-surface text-[13px]">{item.name}</span>
                    </div>
                    <span className="font-data-mono text-on-surface font-semibold text-[13px]">{formatIDR(item.value)}</span>
                  </div>
                  <div className="progress-bar h-1.5">
                    <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            }) : (
              <div className="text-center text-on-surface-variant py-8 text-sm">No data available</div>
            )}
          </div>
        </div>
      </section>

      {/* Transaction History Table */}
      <section className="glass-card rounded-lg p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-headline-md text-[18px] text-on-surface font-bold">Transaction History</h3>
          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-surface-container-high border border-outline-variant rounded-lg py-1.5 px-3 text-on-surface text-xs focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant text-on-surface-variant">
                <th
                  className="text-left py-3 px-2 text-[11px] uppercase font-semibold tracking-wider cursor-pointer hover:text-on-surface transition-colors select-none"
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                >
                  <span className="flex items-center gap-1">
                    Date
                    <span className="material-symbols-outlined text-[14px]">{sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'}</span>
                  </span>
                </th>
                <th className="text-left py-3 px-2 text-[11px] uppercase font-semibold tracking-wider">Description</th>
                <th className="text-left py-3 px-2 text-[11px] uppercase font-semibold tracking-wider">Category</th>
                <th className="text-right py-3 px-2 text-[11px] uppercase font-semibold tracking-wider">Amount</th>
                <th className="text-right py-3 px-2 text-[11px] uppercase font-semibold tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}><td colSpan={5} className="py-4"><div className="h-8 bg-surface-bright rounded animate-pulse" /></td></tr>
                ))
              ) : sortedTx.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-on-surface-variant py-8">No transactions found.</td></tr>
              ) : (
                sortedTx.map(trx => {
                  const isIncome = trx.type === 'income';
                  const dateStr = new Date(trx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  return (
                    <tr key={trx.id} className="border-b border-outline-variant/30 hover:bg-surface-bright/50 transition-colors">
                      <td className="py-3 px-2 text-on-surface-variant text-[13px]">{dateStr}</td>
                      <td className="py-3 px-2">
                        <div className="flex flex-col">
                          <span className="text-on-surface text-[13px] font-medium">{trx.category}</span>
                          {trx.note && <span className="text-on-surface-variant text-[11px]">{trx.note}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-[12px] font-medium ${isIncome ? 'text-secondary' : 'text-on-surface-variant'}`}>
                          {trx.category}
                        </span>
                      </td>
                      <td className={`py-3 px-2 text-right font-data-mono text-[13px] font-semibold ${isIncome ? 'text-secondary' : 'text-error'}`}>
                        {isIncome ? '+' : '-'}{formatIDR(trx.amount)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => handleDelete(trx.id)}
                          className="text-on-surface-variant hover:text-error transition-colors p-1"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AnalisisPage;