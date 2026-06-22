import React, { useState } from 'react';
import { api } from '../../utils/api';

const AddSavingsModal = ({ pocket, onClose, onSave }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!amount) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.addSavings(pocket.id, { amount: parseFloat(amount), note });
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
        <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-outline-variant bg-primary/5">
          <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">add_circle</span>
            Top Up Pocket
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="bg-surface-container-high p-4 rounded-lg border border-outline-variant/30 flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Target Pocket</span>
            <span className="font-body-md text-on-surface font-semibold">{pocket?.name}</span>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-2">
            <label htmlFor="as-amount" className="font-label-sm text-label-sm text-on-surface-variant uppercase">Top Up Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">Rp</span>
              <input
                id="as-amount"
                name="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-10 pr-4 text-on-surface text-lg font-semibold focus:outline-none focus:border-primary transition-colors"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Note */}
          <div className="flex flex-col gap-2">
            <label htmlFor="as-note" className="font-label-sm text-label-sm text-on-surface-variant uppercase">Note (Optional)</label>
            <input
              id="as-note"
              name="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. Monthly savings deposit"
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
            disabled={!amount || loading}
            className="w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary-container text-on-primary hover:brightness-110 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Saving...</>
            ) : (
              <><span className="material-symbols-outlined text-base">savings</span> Add Funds</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSavingsModal;