import React, { useState } from 'react';
import { api } from '../../utils/api';

const SavingsLogModal = ({ pocket, onClose, onSave }) => {
  const [type, setType] = useState('increase'); // increase or decrease
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const presets = [25000, 50000, 75000, 1000000];

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    setError('');
    try {
      const finalAmount = type === 'decrease' ? -Math.abs(Number(amount)) : Number(amount);
      const res = await api.addSavings(pocket.id, { amount: finalAmount, note });
      if (res.success) {
        onSave();
      } else {
        setError(res.message || 'An error occurred.');
      }
    } catch (e) {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-bright w-full sm:max-w-md rounded-t-2xl sm:rounded-xl shadow-2xl border border-outline-variant overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-outline-variant">
          <div className="flex flex-col">
            <h2 className="font-headline-md text-[18px] text-on-surface">Savings Log</h2>
            <p className="text-[12px] text-on-surface-variant mt-0.5">{pocket.name}</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Increase / Decrease Toggle */}
          <div className="flex gap-3">
            <button
              onClick={() => setType('increase')}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all border ${
                type === 'increase'
                  ? 'bg-secondary/15 border-secondary text-secondary'
                  : 'bg-surface-container-high border-outline-variant/50 text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Increase
            </button>
            <button
              onClick={() => setType('decrease')}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all border ${
                type === 'decrease'
                  ? 'bg-error/15 border-error text-error'
                  : 'bg-surface-container-high border-outline-variant/50 text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
              Decrease
            </button>
          </div>

          {/* Nominal Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="sl-nominal" className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">Nominal</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium text-sm">Rp</span>
              <input
                id="sl-nominal"
                name="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-12 pr-4 text-on-surface text-lg font-semibold focus:outline-none focus:border-indigo-400 transition-colors"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Preset Amounts */}
          <div className="flex gap-2 flex-wrap">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(String(preset))}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  amount === String(preset)
                    ? 'bg-indigo-500/15 border-indigo-400 text-indigo-400'
                    : 'bg-surface-container-high border-outline-variant/50 text-on-surface-variant hover:border-outline'
                }`}
              >
                {preset.toLocaleString('id-ID')}
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label htmlFor="sl-description" className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">Description</label>
            <input
              id="sl-description"
              name="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-indigo-400 transition-colors"
              placeholder="e.g. Monthly deposit"
            />
          </div>

          {error && (
            <div className="bg-error/10 border border-error/30 text-error text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!amount || Number(amount) <= 0 || loading}
            className={`w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              type === 'increase'
                ? 'bg-secondary text-on-secondary hover:brightness-110'
                : 'bg-error text-white hover:brightness-110'
            }`}
          >
            {loading ? (
              <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Saving...</>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">{type === 'increase' ? 'add' : 'remove'}</span>
                {type === 'increase' ? 'Add Savings' : 'Withdraw Savings'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavingsLogModal;
