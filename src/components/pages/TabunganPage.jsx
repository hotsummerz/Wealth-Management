import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import AddSavingsModal from '../dashboard/AddSavingsModal';
import PocketModal from '../dashboard/PocketModal';
import SavingsHistoryModal from '../dashboard/SavingsHistoryModal';
import SavingsLogModal from '../dashboard/SavingsLogModal';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const ICONS = {
  'Beli Laptop': 'laptop_mac',
  'Dana Darurat': 'health_and_safety',
  'Liburan': 'flight',
  'Kendaraan': 'directions_car',
  'Dream House': 'home',
  'European Vacation': 'flight',
  'default': 'savings',
};

const formatIDR = (amount) =>
  `Rp ${amount.toLocaleString('id-ID')}`;

const getFreqLabel = (freq) => {
  if (freq === 'daily') return '/day';
  if (freq === 'weekly') return '/wk';
  return '/mo';
};

const SmartProjection = ({ pocket, selectedId, setSelectedId, pockets }) => {
  const [routineAmount, setRoutineAmount] = useState(pocket?.routine_amount || 50000);
  const [frequency, setFrequency] = useState(pocket?.frequency || 'monthly');

  useEffect(() => {
    if (pocket) {
      setRoutineAmount(pocket.routine_amount || 50000);
      setFrequency(pocket.frequency || 'monthly');
    }
  }, [pocket?.id]);

  const getProjection = () => {
    if (!pocket || pocket.current_amount >= pocket.target) return { date: 'Achieved!', exactDate: '', months: 0, daysTotal: 0, data: [], isAchieved: true };
    const remaining = pocket.target - pocket.current_amount;
    const timesNeeded = Math.ceil(remaining / routineAmount);
    let daysToAdd = 0;
    if (frequency === 'daily') daysToAdd = timesNeeded;
    if (frequency === 'weekly') daysToAdd = timesNeeded * 7;
    if (frequency === 'monthly') daysToAdd = Math.round(timesNeeded * 30.44);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysToAdd);
    const months = Math.ceil(daysToAdd / 30.44);

    // Generate projection data points
    const data = [];
    const totalPoints = Math.min(12, Math.max(4, months));
    const monthStep = Math.max(1, Math.ceil(months / totalPoints));
    for (let m = 0; m <= months; m += monthStep) {
      let projected = pocket.current_amount;
      const periodsElapsed = frequency === 'daily' ? m * 30.44 : frequency === 'weekly' ? m * 4.33 : m;
      projected += periodsElapsed * routineAmount;
      projected = Math.min(projected, pocket.target);
      data.push({ month: `M${m}`, value: Math.round(projected) });
    }
    if (data.length > 0 && data[data.length - 1]?.value < pocket.target) {
      data.push({ month: `M${months}`, value: pocket.target });
    }

    const exactDate = futureDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const shortDate = futureDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    return {
      date: shortDate,
      exactDate,
      months,
      daysTotal: daysToAdd,
      data,
      isAchieved: false
    };
  };

  const projection = getProjection();

  // Dynamic slider bounds based on pocket target
  const sliderMin = Math.max(1000, Math.round(pocket?.routine_amount * 0.1 / 1000) * 1000) || 10000;
  const sliderMax = Math.round(pocket?.target * 0.5 / 1000) * 1000 || 5000000;
  const sliderStep = Math.max(1000, Math.round((sliderMax - sliderMin) / 100 / 1000) * 1000) || 10000;

  if (!pocket) {
    return (
      <div className="glass-card rounded-lg p-6 flex flex-col items-center justify-center text-on-surface-variant min-h-[400px]">
        <span className="material-symbols-outlined text-4xl mb-3">auto_awesome</span>
        <p className="text-sm text-center">Select a pocket to view smart projection</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg p-5 sm:p-6 flex flex-col gap-5 lg:sticky lg:top-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-indigo-400 text-[20px]">auto_awesome</span>
        <h3 className="font-headline-md text-[18px] text-on-surface font-bold">Smart Projection</h3>
      </div>

      {/* Selected Pocket */}
      <div className="bg-surface-container-high rounded-lg p-3 border border-outline-variant/50">
        <p className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider mb-1">Selected Pocket</p>
        <p className="text-[14px] text-on-surface font-medium truncate">{pocket.name}</p>
      </div>

      {/* Estimated Completion */}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">Estimated Completion</p>
        {projection.isAchieved ? (
          <span className="text-[24px] text-secondary font-semibold">Target Achieved!</span>
        ) : (
          <>
            <span className="text-[24px] text-on-surface font-semibold">{projection.exactDate}</span>
            <div className="flex items-center gap-1 text-on-surface-variant text-xs mt-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {projection.months} months ({projection.daysTotal} days) from now
            </div>
          </>
        )}
      </div>

      {/* Adjust Scenario */}
      <div className="flex flex-col gap-3">
        <p className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">Adjust Scenario</p>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-on-surface-variant">Deposit Amount</span>
            <div className="flex items-center gap-1">
              <span className="text-on-surface-variant text-xs">Rp</span>
              <input
                id="sp-deposit"
                name="deposit"
                type="number"
                value={routineAmount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 0) setRoutineAmount(val);
                }}
                className="w-28 bg-surface-container-lowest border border-outline-variant rounded-md py-1 px-2 text-on-surface text-sm font-semibold text-right focus:outline-none focus:border-indigo-400 transition-colors"
                min="0"
              />
            </div>
          </div>
          <input
            id="sp-slider"
            name="deposit_slider"
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={sliderStep}
            value={routineAmount}
            onChange={(e) => setRoutineAmount(Number(e.target.value))}
            className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-indigo-400"
          />
          <div className="flex justify-between text-[10px] text-on-surface-variant">
            <span>Rp {sliderMin.toLocaleString('id-ID')}</span>
            <span>Rp {sliderMax.toLocaleString('id-ID')}</span>
          </div>
        </div>
        {/* Frequency Toggle */}
        <div className="flex bg-surface-container-high rounded-lg p-1 border border-outline-variant/50">
          {['daily', 'weekly', 'monthly'].map(f => (
            <button
              key={f}
              onClick={() => setFrequency(f)}
              className={`flex-1 py-1.5 text-center rounded-md text-xs font-semibold transition-all capitalize ${
                frequency === f ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Projection Chart */}
      {projection.data.length > 1 && (
        <div className="h-32 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={projection.data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="projGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    return (
                      <div className="bg-surface-bright border border-outline-variant p-2 rounded-lg text-xs">
                        <span className="text-on-surface font-semibold">{formatIDR(payload[0].value)}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={2} fill="url(#projGradient)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="text-right text-[10px] text-on-surface-variant mt-1">
            Target: {formatIDR(pocket.target)}
          </div>
        </div>
      )}

      {/* Apply Button */}
      <button className="w-full py-2.5 rounded-lg border border-indigo-400 text-indigo-400 font-semibold text-sm hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-2 mt-auto">
        <span className="material-symbols-outlined text-[18px]">check</span>
        Apply Changes to Pocket
      </button>
    </div>
  );
};

const TabunganPage = ({ refreshKey, onRefresh }) => {
  const [pockets, setPockets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPocket, setSelectedPocket] = useState(null);
  const [topUpPocket, setTopUpPocket] = useState(null);
  const [isPocketModalOpen, setIsPocketModalOpen] = useState(false);
  const [activePocketId, setActivePocketId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [historyPocket, setHistoryPocket] = useState(null);
  const [logPocket, setLogPocket] = useState(null);

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getPockets();
      if (res.success) {
        setPockets(res.data);
        if (res.data.length > 0 && !activePocketId) {
          setActivePocketId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPercent = (current, target) => {
    if (!target) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pocket?")) return;
    try {
      const res = await api.deletePocket(id);
      if (res.success) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const activePocket = pockets.find(p => p.id === activePocketId) || pockets[0] || null;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="font-headline-md text-[24px] text-on-surface font-semibold leading-8">Tabungan</h1>
        <button
          onClick={() => setIsPocketModalOpen(true)}
          className="bg-primary-container text-on-primary px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create New Pocket
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-6">
          {[1, 2].map(i => (
            <div key={i} className="glass-card rounded-lg p-6 animate-pulse min-h-[200px]" />
          ))}
        </div>
      ) : pockets.length === 0 ? (
        <div className="glass-card rounded-lg flex flex-col items-center justify-center py-16 text-on-surface-variant gap-3">
          <span className="material-symbols-outlined text-5xl">savings</span>
          <p className="font-body-lg text-on-surface">No savings pockets yet.</p>
          <p className="text-sm text-on-surface-variant">Click "Create New Pocket" to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pocket Cards - Left 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {pockets.map((pocket) => {
              const percent = getPercent(pocket.current_amount, pocket.target);
              const isOnTrack = percent >= 20;
              const remaining = pocket.target - pocket.current_amount;
              const isActive = pocket.id === activePocketId;

              return (
                <div
                  key={pocket.id}
                  onClick={() => setActivePocketId(pocket.id)}
                  className={`glass-card glass-card-hover rounded-lg p-6 flex flex-col gap-4 cursor-pointer transition-all ${
                    isActive ? 'border-primary/40' : ''
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-surface-bright p-3 rounded-lg text-primary">
                        <span className="material-symbols-outlined text-[24px]">{ICONS[pocket.name] || ICONS.default}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body-lg text-[16px] text-on-surface font-semibold">{pocket.name}</span>
                        <span className="text-[11px] text-on-surface-variant">{pocket.platform} • {pocket.instrument}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        isOnTrack ? 'chip-success' : 'chip-error'
                      }`}>
                        {isOnTrack ? 'On Track' : 'Needs Attention'}
                      </span>
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === pocket.id ? null : pocket.id); }}
                          className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
                        >
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                        {menuOpenId === pocket.id && (
                          <div className="absolute right-0 top-8 z-50 bg-surface-container-high border border-outline-variant rounded-lg shadow-xl py-1 min-w-[180px]">
                            <button
                              onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); setHistoryPocket(pocket); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-bright transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">history</span>
                              View Savings Details
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); setLogPocket(pocket); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-bright transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit_note</span>
                              Savings Log
                            </button>
                            <div className="border-t border-outline-variant/50 my-1" />
                            <button
                              onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); handleDelete(pocket.id); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                              Delete Pocket
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4 Metric Sub-Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-surface-container-high rounded-lg p-3 border border-outline-variant/30">
                      <p className="text-[10px] text-on-surface-variant uppercase font-semibold mb-1">Current Amount</p>
                      <p className="text-[16px] text-on-surface font-bold">{formatIDR(pocket.current_amount)}</p>
                    </div>
                    <div className="bg-surface-container-high rounded-lg p-3 border border-outline-variant/30">
                      <p className="text-[10px] text-on-surface-variant uppercase font-semibold mb-1">Target Amount</p>
                      <p className="text-[16px] text-on-surface font-bold">{formatIDR(pocket.target)}</p>
                    </div>
                    <div className="bg-surface-container-high rounded-lg p-3 border border-outline-variant/30">
                      <p className="text-[10px] text-on-surface-variant uppercase font-semibold mb-1">Routine Saving</p>
                      <p className="text-[16px] text-on-surface font-bold">Rp {pocket.routine_amount?.toLocaleString('id-ID') || '0'} {getFreqLabel(pocket.frequency)}</p>
                    </div>
                    <div className="bg-surface-container-high rounded-lg p-3 border border-outline-variant/30">
                      <p className="text-[10px] text-on-surface-variant uppercase font-semibold mb-1">Remaining</p>
                      <p className="text-[16px] text-on-surface font-bold">{remaining > 0 ? formatIDR(remaining) : 'Done!'}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant text-xs">Progress</span>
                      <span className="text-primary font-semibold text-xs">{percent}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="bg-primary-container h-full rounded-full transition-all duration-1000"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2 border-t border-outline-variant/30">
                    <button
                      onClick={(e) => { e.stopPropagation(); setTopUpPocket(pocket); }}
                      className="flex-1 py-2.5 rounded-lg bg-surface-bright hover:bg-surface-container-highest text-on-surface font-semibold text-sm transition-colors flex justify-center items-center gap-2 border border-outline-variant/50"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Top Up
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(pocket.id); }}
                      className="py-2.5 px-4 rounded-lg bg-surface-bright hover:bg-error/10 hover:text-error text-on-surface-variant font-semibold text-sm transition-colors flex items-center gap-2 border border-outline-variant/50"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Smart Projection - Right col */}
          <div className="lg:col-span-1">
            <SmartProjection
              pocket={activePocket}
              selectedId={activePocketId}
              setSelectedId={setActivePocketId}
              pockets={pockets}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {topUpPocket && (
        <AddSavingsModal
          pocket={topUpPocket}
          onClose={() => setTopUpPocket(null)}
          onSave={() => {
            setTopUpPocket(null);
            onRefresh();
          }}
        />
      )}

      {isPocketModalOpen && (
        <PocketModal
          onClose={() => setIsPocketModalOpen(false)}
          onSave={() => {
            setIsPocketModalOpen(false);
            onRefresh();
          }}
        />
      )}

      {historyPocket && (
        <SavingsHistoryModal
          pocket={historyPocket}
          onClose={() => setHistoryPocket(null)}
        />
      )}

      {logPocket && (
        <SavingsLogModal
          pocket={logPocket}
          onClose={() => setLogPocket(null)}
          onSave={() => {
            setLogPocket(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default TabunganPage;