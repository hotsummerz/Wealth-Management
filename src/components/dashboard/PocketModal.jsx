import React, { useState } from 'react';
import { api } from '../../utils/api';

const PocketModal = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [platform, setPlatform] = useState('');
  const [instrument, setInstrument] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [routineAmount, setRoutineAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const platforms = ["Jago", "Bibit", "BNI", "Blu", "Seabank"];
  const instruments = [
    "Reksadana Pasar Uang", "Reksadana Obligasi",
    "Deposito", "Kantong Terkunci", "Mata Uang Asing"
  ];
  const frequencies = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' }
  ];

  const handleSave = async () => {
    if (!name || !target || !platform || !instrument || !routineAmount) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        name,
        target: parseFloat(target),
        platform,
        instrument,
        frequency,
        routine_amount: parseFloat(routineAmount),
        estimated_date: null
      };
      const res = await api.createPocket(payload);
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
          <h2 className="font-headline-md text-headline-md text-on-surface">Create New Pocket</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="pm-name" className="font-label-sm text-label-sm text-on-surface-variant uppercase">Goal Name</label>
            <input
              id="pm-name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. Emergency Fund"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Target */}
            <div className="flex flex-col gap-2">
              <label htmlFor="pm-target" className="font-label-sm text-label-sm text-on-surface-variant uppercase">Target Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">Rp</span>
                <input
                  id="pm-target"
                  name="target"
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-8 pr-3 text-on-surface font-semibold focus:outline-none focus:border-primary transition-colors"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Routine Amount */}
            <div className="flex flex-col gap-2">
              <label htmlFor="pm-routine" className="font-label-sm text-label-sm text-on-surface-variant uppercase">Routine Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">Rp</span>
                <input
                  id="pm-routine"
                  name="routine_amount"
                  type="number"
                  value={routineAmount}
                  onChange={(e) => setRoutineAmount(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-8 pr-3 text-on-surface font-semibold focus:outline-none focus:border-primary transition-colors"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Frequency */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Saving Frequency</label>
            <div className="flex bg-surface-container-high rounded-lg p-1 border border-outline-variant/50">
              {frequencies.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFrequency(f.id)}
                  className={`flex-1 py-2 text-center rounded-md text-sm font-semibold transition-all ${
                    frequency === f.id ? 'bg-primary-container text-on-primary shadow' : 'text-on-surface-variant'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>



          {/* Platform */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Platform</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    platform === p
                      ? 'bg-primary/15 border-primary text-primary font-semibold'
                      : 'bg-transparent border-outline-variant text-on-surface-variant hover:border-outline'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Instrument */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Instrument</label>
            <div className="flex flex-wrap gap-2">
              {instruments.map((inst) => (
                <button
                  key={inst}
                  onClick={() => setInstrument(inst)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    instrument === inst
                      ? 'bg-primary-container/15 border-primary-container text-primary-container font-semibold'
                      : 'bg-transparent border-outline-variant text-on-surface-variant hover:border-outline'
                  }`}
                >
                  {inst}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/30 text-error text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!name || !target || !routineAmount || !platform || !instrument || loading}
            className="w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary-container text-on-primary hover:brightness-110 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Saving...</>
            ) : (
              <><span className="material-symbols-outlined text-base">savings</span> Create Pocket</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PocketModal;